import Event from "../Util/Event";
import { Deferred } from "../Util/Deferred";
import { delay } from "../Util/Delay";
import { LocationTracking } from "./Tracking";
import { LoggerVisualization } from "./Logging";
import {
  MapScanning,
  GateByFlagOrTrackingAlready,
  Timeout,
} from "./MapScanning";
import { Anchor, AreaEvent, Model, ModelEvent } from "./Model";
import { PersistentStorage } from "./PersistentStorage";

// flow

// initialize multiplayer session (hack)
// start loading previous location + anchors
// start mapping
// wait for previous location + anchors loading to complete -> either have a previous location or don't
// if have previous location, start tracking
//   -> wait for tracking to complete
//   -> wait for mapping to complete
// else
//   -> wait for mapping to complete
//
// whenever mapping completes
//   -> don't switch tracking
//   -> instead, only update the model with the new location
//
// if have placed a new anchor
//  -> if we are waiting for an existing map to track
//    -> once tracking completes, update the model
//  -> if we have completed a new map
//    -> update the model
//  -> if we have completed a new map with no previous map
//    -> once tracking starts, update the model

export interface TrackingState {
  location: LocationAsset;
  anchoringRoot: SceneObject;
}

// initialization events
export class InitializedEvent {
  loadedAnchors: { [key: string]: SceneObject };
}

export class InitializedLensCloudEvent {}

export class InitializeErrorEvent {
  error: Error;
}

export class AnchorEvent {
  anchorId: string;
  sceneObject: SceneObject;
}

export class AnchorError {
  message: string;
  anchorId: string;
}

export class AnchorMappingStatusEvent {
  quality?: number;
  capacityUsed?: number;
}

export class AreaActivatedEvent {
  areaId: string;
}

export class AreaDeactivatedEvent {
  areaId: string;
}

export interface SpatialPersistenceInterface {
  createAnchor(sceneObject: SceneObject): AnchorEvent;
  saveAnchor(sceneObject: SceneObject): Promise<AnchorEvent>;
  deleteAnchor(sceneObject: SceneObject): Promise<AnchorEvent>;
  resetArea(): Promise<void>;
  selectArea(areaID: string | null);
}

export class SpatialPersistence implements SpatialPersistenceInterface {
  private _locationCloudStorageModule?: LocationCloudStorageModule;

  // temporary
  private _mappingInterval: number = 20;
  private _resetDelayInS: number = 0.5;
  private _checkPointDelayInS: number = 1.0;
  private _debug: boolean = true;
  private _incrementalMapping: boolean = false;
  private _enableLoggingPoseSettling: boolean = false;
  private _trackedLocationsCount: number = 0;

  private sceneObject: SceneObject;
  private scriptComponent: BaseScriptComponent;

  private _mapScanning: Deferred<MapScanning> = new Deferred<MapScanning>();
  private sceneObjects: { [key: string]: SceneObject } = {};

  private static readonly anchorIdStash = "__anchorId";
  static readonly DefaultAreaId: string = "default";
  static readonly DefaultStateAsString: string = JSON.stringify({
    areas: { default: { name: "default" } },
  });

  private gateByFlagOrTrackingAlreadyTrigger?: GateByFlagOrTrackingAlready; // !!! mapping after tracking a separate map -> quality << 1.0

  private mappingSceneObject: SceneObject;

  constructor(
    mappingInterval: number,
    resetDelayInS: number,
    debug: boolean,
    incrementalMapping: boolean,
    enableLoggingPoseSettling: boolean,
    locationCloudStorageModule?: LocationCloudStorageModule,
  ) {
    this._locationCloudStorageModule = locationCloudStorageModule;
    this._mappingInterval = mappingInterval;
    this._resetDelayInS = resetDelayInS;
    this._debug = debug;
    this._incrementalMapping = incrementalMapping;
    this._enableLoggingPoseSettling = enableLoggingPoseSettling;
  }

  createAnchor(sceneObject: SceneObject): AnchorEvent {
    let anchorId = getGuid();
    this.model.createAnchor(anchorId);

    this.sceneObjects[anchorId] = sceneObject;
    (sceneObject as ScriptObject)[SpatialPersistence.anchorIdStash] = anchorId;

    let anchorEvent = new AnchorEvent();
    anchorEvent.anchorId = anchorId;
    anchorEvent.sceneObject = sceneObject;

    return anchorEvent;
  }

  private async updateAnchorInModel(
    sceneObject: SceneObject,
  ): Promise<ModelEvent> {
    let anchorId = (sceneObject as ScriptObject)[
      SpatialPersistence.anchorIdStash
    ];
    this.log("Saving " + anchorId);

    const [trackingState, locationSize] =
      await this.getTrackingStateWithLocationSizeForAnchor(sceneObject);

    if (trackingState === null) {
      throw new Error(
        "Invalid tracking state: No tracking state available. Either checkpointing hasn't completed or no locations are being tracked.",
      );
    }

    let toLensWorldFromAnchor = sceneObject.getTransform().getWorldTransform();
    let toLensWorldFromAnchorRoot = trackingState.anchoringRoot
      .getTransform()
      .getWorldTransform();
    let toAnchorRootFromAnchor = toLensWorldFromAnchorRoot
      .inverse()
      .mult(toLensWorldFromAnchor);

    let serializedLocationId = await this.persistentStorage.storeLocation(
      trackingState.location,
    );

    let modelEvent = await this.model.saveAnchor(
      anchorId,
      serializedLocationId,
      toAnchorRootFromAnchor,
      locationSize,
    );
    return modelEvent;
  }

  private async getTrackedAnchorStateWithLocationSize(
    anchor: Anchor,
  ): Promise<[TrackingState, number]> {
    if (
      this._trackingStateFromLatestCheckpoint &&
      (await this.isAnchorTrackedBeforeCheckpointTrigger(anchor))
    ) {
      return [
        this._trackingStateFromLatestCheckpoint,
        this.mapSizeFromLatestCheckpoint,
      ];
    }

    const locationTracking =
      this.trackingPerLocation[this.trackedLocationPerAnchor[anchor.anchorId]];
    return [locationTracking.trackingState, locationTracking.locationSize];
  }

  private getNearestLocationTrackingForAnchor(
    anchorSceneObject: SceneObject,
  ): LocationTracking {
    const anchorPos = anchorSceneObject.getTransform().getWorldPosition();

    let minDistance = Infinity;
    let nearestLocationTracking: LocationTracking | null = null;

    for (const locationTracking of Object.values(this.trackingPerLocation)) {
      const rootTransform =
        locationTracking?.trackingState?.anchoringRoot?.getTransform();
      if (!rootTransform) continue;

      const rootPos = rootTransform.getWorldPosition();
      const distance = anchorPos.distance(rootPos);

      if (distance < minDistance) {
        minDistance = distance;
        nearestLocationTracking = locationTracking;
      }
    }

    return nearestLocationTracking;
  }

  private async getTrackingStateWithLocationSizeForAnchor(
    sceneObject: SceneObject,
  ): Promise<[TrackingState, number]> {
    let anchorId = (sceneObject as ScriptObject)[
      SpatialPersistence.anchorIdStash
    ];
    let anchor = this.model.area.anchors[anchorId];
    const isNewAnchor = !(anchor.anchorId in this.trackedLocationPerAnchor);
    let haveCheckpointed = this._trackingStateFromLatestCheckpoint !== null;

    if (isNewAnchor && haveCheckpointed) {
      // Anchor is new and we have checkpointed, so use state from current mapping session.
      return [
        this._trackingStateFromLatestCheckpoint,
        this.mapSizeFromLatestCheckpoint,
      ];
    } else if (isNewAnchor) {
      // Anchor was created when checkpointing was blocked or before first checkpoint, but we tracked first,
      // hence we attach the anchor to the nearest tracked location

      // get nearest tracked location for anchor
      const locationTracking =
        this.getNearestLocationTrackingForAnchor(sceneObject);
      return [locationTracking!.trackingState!, locationTracking!.locationSize];
    }

    // Tracked anchor was moved
    return await this.getTrackedAnchorStateWithLocationSize(anchor);
  }

  async saveAnchor(sceneObject: SceneObject): Promise<AnchorEvent> {
    let areaIdWhenRequestIssued = this.model.currentAreaId;
    await this.mappedOrTracked.promise;
    if (areaIdWhenRequestIssued != this.model.currentAreaId) {
      throw new Error("Save cancelled - area has changed");
    }

    let modelEvent = await this.updateAnchorInModel(sceneObject);

    // model was updated, now we need to save
    this.triggerSceneSave();

    // forward the event
    let anchorEvent = new AnchorEvent();
    anchorEvent.anchorId = modelEvent.anchorId;
    anchorEvent.sceneObject = this.sceneObjects[modelEvent.anchorId];

    return anchorEvent;
  }

  // This doesn't need to be async
  async deleteAnchor(sceneObject: SceneObject): Promise<AnchorEvent> {
    let anchorId = (sceneObject as ScriptObject)[
      SpatialPersistence.anchorIdStash
    ];
    let modelEvent = this.model.deleteAnchor(anchorId);
    return this.createAnchorEvent(modelEvent);
  }

  async resetArea(): Promise<void> {
    // can't reset if load hasn't completed
    await this.previousState.finally(async () => {
      this.log("resetting area " + this.model.currentAreaId);

      await this.model.reset();

      // !!! should be triggered by model
      // !!! missing is model notifying subscribers that state has changed due to lastTrackedLocation being cleared
      this.triggerSceneSave();
    });
  }

  selectArea(areaID: string | null) {
    this.model.selectArea(areaID);
  }

  awake(sceneObject: SceneObject, scriptComponent: BaseScriptComponent) {
    this.sceneObject = sceneObject;
    this.scriptComponent = scriptComponent;

    this.mappingSceneObject = global.scene.createSceneObject("mapping");
    this.mappingSceneObject.setParent(sceneObject);
    let mappingLocatedAt = this.mappingSceneObject.createComponent(
      "LocatedAtComponent",
    ) as LocatedAtComponent;
    mappingLocatedAt.location = LocationAsset.getAROrigin();

    this.model = new Model();
    // !!! persistent storage needs to be per area, not per tracked location

    this.persistentStorage = new PersistentStorage(
      this._locationCloudStorageModule,
    );

    this.model.onAnchorLoaded.add(this.notifyAnchorLoaded.bind(this));
    this.model.onAnchorUnloaded.add(this.notifyAnchorUnloaded.bind(this));
    this.model.onAnchorDeleted.add(this.notifyAnchorDeleted.bind(this));

    this.model.onAreaActivated.add(this.notifyAreaActivated.bind(this));
    this.model.onAreaDeactivated.add(this.notifyAreaDeactivated.bind(this));
  }

  private alreadyInitialized: boolean = false;
  private initializingDelayInSec: number = 1.0;
  private async initializeMapping(): Promise<void> {
    if (this.alreadyInitialized) {
      await delay(this.initializingDelayInSec);
    }
    this.alreadyInitialized = true;

    this.log(
      "initializing mapping and tracking for area " + this.model.currentAreaId,
    );

    let mapScanning = this.createMapScanning();

    // mapping control
    let trigger = new GateByFlagOrTrackingAlready();
    trigger.allowCheckpoint = false;
    trigger.trackingAlready = false;
    this.gateByFlagOrTrackingAlreadyTrigger = trigger;

    // Start checkpoint operation asynchronously (fire-and-forget)
    // This ensures the method returns immediately and doesn't block the function
    (async () => {
      try {
        const newlyMappedLocation = await mapScanning.checkpoint(trigger);
        this._trackingStateFromLatestCheckpoint = {
          location: newlyMappedLocation,
          anchoringRoot: this.mappingSceneObject,
        };
        await this.updateModelAgainstScan();
        this.mappedOrTracked.resolve();

        if (this._incrementalMapping) {
          this.scheduleSubsequentMap();
        }
      } catch (error) {
        this.log("error during initial checkpointing: " + error);
      }
    })();
  }

  private createMapScanning(): MapScanning {
    let mapScanning = new MapScanning(this.scriptComponent);
    mapScanning.onMappingStatus.add((status) => {
      this.onAnchorMappingStatusEvent.invoke(status);
    });
    this._mapScanning.resolve(mapScanning);
    return mapScanning;
  }

  private createLocationTracking(
    location: LocationAsset,
    locationSize: number,
  ): LocationTracking {
    this.log("Creating new location tracking for " + location.toSerialized());

    return new LocationTracking(
      this.scriptComponent,
      location,
      locationSize,
      this._enableLoggingPoseSettling,
    );
  }

  private async destroyMappingAndTracking(): Promise<void> {
    (async () => {
      const mapScanning = await this._mapScanning.promise;
      mapScanning.destroy();
    })();

    // destroy all location tracking
    for (let locationTracking of Object.values(this.trackingPerLocation)) {
      if (locationTracking) {
        locationTracking.destroy();
      }
    }
    this._mapScanning = new Deferred<MapScanning>();
    this.trackingPerLocation = {};

    await delay(this._resetDelayInS);
  }

  async scheduleSubsequentMap() {
    if (this._mappingInterval > 0.0) {
      this.log("scheduling subsequent map");

      let mapScanning = await this._mapScanning.promise;

      this.log(
        "mapping session capacity used: " +
          mapScanning.mappingSession.capacityUsed,
      );

      // "capacityUsed" is scaled relative to the "wearableMaximumSize_" parameter
      // defined in LensCore:
      // capacityUsed = std::min(rawCapacity / wearableMaximumSize_, 1.0)
      this.log(
        "mapSizeFromLatestCheckpoint: " +
          this.mapSizeFromLatestCheckpoint / (1024 * 1024) +
          "MB",
      );
      this.log(
        "totalMapSizeOfUntrackedLocations: " +
          this.totalMapSizeOfUntrackedLocations / (1024 * 1024) +
          "MB",
      );
      this.log("trackedLocationsCount: " + this._trackedLocationsCount);
      const totalMapSize =
        this.mapSizeFromLatestCheckpoint +
        this.totalMapSizeOfUntrackedLocations;

      if (totalMapSize >= this.maxAllowedTotalMapSizeForArea) {
        this.log("capacity used above threshold - stopping map saves");
        this.checkpointsBlockedEvent.invoke({
          message:
            "Checkpoints blocked due to total size of all maps for area is too large. Track some previously loaded locations to unblock.",
          anchorId: "",
        });
        return;
      }
      try {
        let trigger = new Timeout();
        trigger.timeoutInS = this._mappingInterval;

        let newlyMappedLocation = await mapScanning.checkpoint(trigger);
        this._trackingStateFromLatestCheckpoint = {
          location: newlyMappedLocation,
          anchoringRoot: this.mappingSceneObject,
        };

        await this.updateModelAgainstScan();
        this.scheduleSubsequentMap();
      } catch (error) {
        this.log("Chained checkpointing failed: " + error);
      }
    }
  }

  private async isAnchorTrackedBeforeCheckpointTrigger(
    anchor: Anchor,
  ): Promise<boolean> {
    const trackedLocationId = this.trackedLocationPerAnchor[anchor.anchorId];
    const locationTracking = this.trackingPerLocation[trackedLocationId];

    // If anchor location is tracked and is tracked before the latest checkpoint trigger
    return (
      locationTracking?.trackingState &&
      locationTracking.timestampWhenPoseSettled <
        (await this._mapScanning.promise).latestCheckpointTriggerTimestamp
    );
  }

  async updateModelAgainstScan() {
    if (this.model.area === undefined || this.model.area === null) {
      this.log(
        "[updateModelAgainstScan] no area selected - cannot update model against scan",
      );
      return;
    }

    this.mapSizeFromLatestCheckpoint = await this.getCurrentMapSize();
    for (const [anchorId, anchor] of Object.entries(this.model.area.anchors)) {
      const isNewAnchor = !(anchor.anchorId in this.trackedLocationPerAnchor);
      const shouldUpdateAnchor =
        isNewAnchor ||
        (await this.isAnchorTrackedBeforeCheckpointTrigger(anchor));

      // Update anchor if it is newly spawned or if the anchor was loaded and its location was tracked before the latest checkpoint trigger
      if (shouldUpdateAnchor) {
        await this.updateAnchorInModel(this.sceneObjects[anchorId]);
      }
    }

    this.triggerSceneSave();
  }

  //!!! temp hack due to ordering
  //!!!    this component needs to be ahead of consumers in scene graph so events
  //!!!    are available for consumers to subscribe to
  //!!!
  //!!!    it also wants to deserialize previous state
  //!!!
  //!!!    however the consumers may wish to react to this state via the events
  //!!!    they haven't yet had a chance to subscribe to
  //!!!
  //!!!    so we have to make sure that the events published by this component are
  //!!!    there and can be subscribed to before deserializing
  //!!!
  //!!!    atm we supply an 'initialize' function and onInitializeEvent for consumers
  //!!!    to subscribe to, such that they can control when deserialize happens
  private previousState?: Promise<void>;
  async initialize(): Promise<void> {
    this.log("initializing");

    this.previousState = this.loadPrevious();
    try {
      await this.previousState;
    } catch (noPreviousStateError) {
      this.log(
        "no previous location state - using default state" +
          noPreviousStateError,
      );
      this.model.load(SpatialPersistence.DefaultStateAsString);
      this.model.selectArea(SpatialPersistence.DefaultAreaId);
    }
  }

  private async loadPrevious(): Promise<void> {
    try {
      let stateAsString = await this.persistentStorage.loadFromStore();
      this.model.load(stateAsString);
    } catch (error) {
      throw new Error("previous location failed to load");
    }
  }

  private invokeOnFoundForTrackedAnchors(trackedLocationId: string): void {
    for (const anchorId of Object.keys(this.trackedLocationPerAnchor)) {
      if (this.trackedLocationPerAnchor[anchorId] === trackedLocationId) {
        const anchorEvent = new AnchorEvent();
        anchorEvent.anchorId = anchorId;
        anchorEvent.sceneObject = this.sceneObjects[anchorId];
        this.onFoundEvent.invoke(anchorEvent);
      }
    }
  }

  private async track(trackedLocationId: string): Promise<void> {
    await this.trackingPerLocation[trackedLocationId].onceFound;
    this.invokeOnFoundForTrackedAnchors(trackedLocationId);
    this._trackedLocationsCount += 1;
    this.totalMapSizeOfUntrackedLocations -=
      this.trackingPerLocation[trackedLocationId].locationSize;
    this.mappedOrTracked.resolve();
  }

  private onLoadedEvent = new Event<AnchorEvent>();
  public readonly onLoaded = this.onLoadedEvent.publicApi();

  private onLoadErrorEvent = new Event<AnchorError>();
  public readonly onLoadError = this.onLoadErrorEvent.publicApi();

  private onUnloadedEvent = new Event<AnchorEvent>();
  public readonly onUnloaded = this.onUnloadedEvent.publicApi();

  private onFoundEvent = new Event<AnchorEvent>();
  public readonly onFound = this.onFoundEvent.publicApi();

  private onLostEvent = new Event<AnchorEvent>();
  public readonly onLost = this.onLostEvent.publicApi();

  private onDeletedEvent = new Event<AnchorEvent>();
  public readonly onDeleted = this.onDeletedEvent.publicApi();

  private onDeleteErrorEvent = new Event<AnchorError>();
  public readonly onDeleteError = this.onDeleteErrorEvent.publicApi();

  private checkpointsBlockedEvent = new Event<AnchorError>();
  public readonly onCheckpointsBlocked =
    this.checkpointsBlockedEvent.publicApi();

  // debugging / ui
  private onAnchorMappingStatusEvent = new Event<AnchorMappingStatusEvent>();
  public readonly onAnchorMappingStatus =
    this.onAnchorMappingStatusEvent.publicApi();

  // Outgoing area selection events
  private onAreaActivatedEvent = new Event<AreaActivatedEvent>();
  public readonly onAreaActivated = this.onAreaActivatedEvent.publicApi();

  private onAreaDeactivatedEvent = new Event<AreaDeactivatedEvent>();
  public readonly onAreaDeactivated = this.onAreaDeactivatedEvent.publicApi();

  // implementation
  private model: Model;
  private persistentStorage?: PersistentStorage;

  // A13 behaviour - wait for any location for current area to be tracked, then we resolve
  private _mappedOrTracked = new Deferred<void>();
  private get mappedOrTracked(): Deferred<void> {
    return this._mappedOrTracked;
  }
  private set mappedOrTracked(mappedOrTracked: Deferred<void>) {
    this._mappedOrTracked.reject(new Error("tracking cancelled"));
    this._mappedOrTracked = mappedOrTracked;
    this._trackingStateFromLatestCheckpoint = null;
  }

  private _trackingStateFromLatestCheckpoint: TrackingState | null = null;
  private mapSizeFromLatestCheckpoint: number = 0;
  private trackingPerLocation: {
    [key: string]: LocationTracking;
  } = {}; // locationId -> LocationTracking
  private trackedLocationPerAnchor: { [key: string]: string } = {}; // anchorId -> locationId
  private maxAllowedMapsPerArea: number = 10;
  private maxAllowedTotalMapSizeForArea: number = 30 * 1024 * 1024; // 30MB
  private totalMapSizeOfUntrackedLocations: number = 0;

  private logger = LoggerVisualization.createLogger("component");
  private log = this.logger.log.bind(this.logger);

  // Serialize model to JSON string and save it to persistent storage
  private async triggerSceneSave() {
    // todo: wait 5s then save
    this.log("triggering save");
    let stateAsString = this.model.save();

    try {
      await this.persistentStorage.saveToStore(stateAsString);
      this.log("save successful");
    } catch (error) {
      this.log("save failed: " + error);
    }
  }

  private notifyAnchorLoaded(modelEvent: ModelEvent) {
    let trackingScnObject: SceneObject;
    const locationId = modelEvent.trackedLocation;
    const anchorId = modelEvent.anchorId;
    // check if we already have a LocationTracking for this location, if not create one
    if (!(locationId in this.trackingPerLocation)) {
      this.totalMapSizeOfUntrackedLocations += modelEvent.trackedLocationSize;

      this.trackingPerLocation[locationId] = this.createLocationTracking(
        this.persistentStorage.retrieveLocation(locationId),
        modelEvent.trackedLocationSize,
      );
      this.trackingPerLocation[locationId].sceneObject.setParent(
        this.sceneObject,
      );
      this.track(locationId);
    }

    trackingScnObject = this.trackingPerLocation[locationId].sceneObject;
    this.trackedLocationPerAnchor[anchorId] = locationId;

    let anchorSceneObject = global.scene.createSceneObject(
      "anchor-" + anchorId,
    );
    anchorSceneObject.setParent(trackingScnObject);

    anchorSceneObject[SpatialPersistence.anchorIdStash] = anchorId;
    this.sceneObjects[anchorId] = anchorSceneObject;

    let anchorEvent = new AnchorEvent();
    anchorEvent.anchorId = anchorId;
    anchorEvent.sceneObject = anchorSceneObject;

    try {
      this.onLoadedEvent.invoke(anchorEvent);
      anchorSceneObject
        .getTransform()
        .setLocalTransform(modelEvent.toTrackedLocationFromAnchor);
    } catch (error) {
      this.onLoadErrorEvent.invoke({
        message: error,
        anchorId: modelEvent.anchorId,
      });
    }
  }

  private createAnchorEvent(modelEvent: ModelEvent) {
    let sceneObject = this.sceneObjects[modelEvent.anchorId];

    let anchorEvent = new AnchorEvent();
    anchorEvent.anchorId = modelEvent.anchorId;
    anchorEvent.sceneObject = sceneObject;

    return anchorEvent;
  }

  private notifyAnchorUnloaded(modelEvent: ModelEvent) {
    this.log("unloading anchor " + modelEvent.anchorId);

    try {
      // model was not updated so no need to save

      // as far as the ui is concerned, the anchor is gone

      // forward the event
      let anchorEvent = this.createAnchorEvent(modelEvent);

      // anchor was unloaded, we no longer care about it
      this.sceneObjects[modelEvent.anchorId] = undefined;

      this.log(
        "invoking onUnloaded due to unloading anchor " + modelEvent.anchorId,
      );
      this.onUnloadedEvent.invoke(anchorEvent);
      this.onDeletedEvent.invoke(anchorEvent);
    } catch (error) {
      this.log("error unloading anchor: " + error + " " + error.stack);
    }
  }

  private notifyAnchorDeleted(modelEvent: ModelEvent) {
    // model was updated, now we need to save
    this.triggerSceneSave();

    // we don't notify UI at this point - anchor was unloaded, and that is forwarded as a delete
    // event to UI
  }

  private async getCurrentMapSize(): Promise<number> {
    const mapScanning = await this._mapScanning.promise;
    return (
      mapScanning.mappingSession.capacityUsed *
      mapScanning.mappingSession.wearableMaximumSize
    );
  }

  private async notifyAreaActivated(areaEvent: AreaEvent) {
    // At this point all prev anchors are unloaded if there was an area switch
    try {
      await this.initializeMapping();
      // TODO (ngollahalliananda): https://jira.sc-corp.net/browse/AVALON-50446
      // Cancel API call has issues since map snips buffer is not cleared properly
      // This is a workaround by adding a delay before checkpointing in case of new area
      await delay(this._checkPointDelayInS);

      const totalMapSize =
        (await this.getCurrentMapSize()) +
        this.totalMapSizeOfUntrackedLocations;
      if (
        totalMapSize < this.maxAllowedTotalMapSizeForArea &&
        Object.keys(this.trackingPerLocation).length <
          this.maxAllowedMapsPerArea
      ) {
        if (this.gateByFlagOrTrackingAlreadyTrigger) {
          this.gateByFlagOrTrackingAlreadyTrigger.allowCheckpoint = true;
        }
      } else {
        this.checkpointsBlockedEvent.invoke({
          message:
            "Checkpoints blocked due to too many loaded locations or total size of all maps for area is too large. Track some previously loaded locations to unblock.",
          anchorId: "",
        });
        await this.mappedOrTracked.promise;
      }

      let areaActivatedEvent: AreaActivatedEvent = {
        areaId: areaEvent.areaId,
      };
      this.onAreaActivatedEvent.invoke(areaActivatedEvent);
    } catch (error) {
      this.log(
        "notifyAreaActivated: error during area activation for area " +
          areaEvent.areaId +
          ": " +
          error,
      );
    } finally {
      if (this.gateByFlagOrTrackingAlreadyTrigger) {
        this.gateByFlagOrTrackingAlreadyTrigger.allowCheckpoint =
          this._incrementalMapping; // only allow first scan to complete if we are incrementally mapping
        this.gateByFlagOrTrackingAlreadyTrigger.trackingAlready = true;
      }
    }
  }

  private async notifyAreaDeactivated(deletedAreaEvent: AreaEvent) {
    this.mappedOrTracked = new Deferred<void>();
    this.trackedLocationPerAnchor = {};
    this.mapSizeFromLatestCheckpoint = 0;
    this.totalMapSizeOfUntrackedLocations = 0;
    this._trackedLocationsCount = 0;

    // Start the destroy operation asynchronously
    (async () => {
      try {
        await this.destroyMappingAndTracking();
        this.log(
          deletedAreaEvent.areaId +
            " deactivated - destroyed mapping and tracking session",
        );
      } catch (error) {
        this.log("error destroying mapping and tracking session: " + error);
        throw new Error(
          "error destroying mapping and tracking session: " + error,
        );
      }
    })();

    let areaDeactivatedEvent: AreaDeactivatedEvent = {
      areaId: deletedAreaEvent.areaId,
    };
    this.onAreaDeactivatedEvent.invoke(areaDeactivatedEvent);
  }
}

const getGuid = () => {
  // return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  let uuid = "";
  let currentChar;
  for (
    currentChar = 0;
    currentChar < /* 36 minus four hyphens */ 32;
    currentChar += 1
  ) {
    switch (currentChar) {
      case 8:
      case 20:
        uuid += "-";
        uuid += ((Math.random() * 16) | 0).toString(16);
        break;
      case 12:
        uuid += "-";
        uuid += "4";
        break;
      case 16:
        uuid += "-";
        uuid += ((Math.random() * 4) | 8).toString(16); // Not the difference for this position
        break;
      default:
        uuid += ((Math.random() * 16) | 0).toString(16);
    }
  }
  return uuid;
};
