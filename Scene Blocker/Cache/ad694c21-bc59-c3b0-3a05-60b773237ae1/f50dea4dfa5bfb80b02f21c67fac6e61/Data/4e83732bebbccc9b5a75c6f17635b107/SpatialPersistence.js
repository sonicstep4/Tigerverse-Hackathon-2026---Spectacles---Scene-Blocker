"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpatialPersistence = exports.AreaDeactivatedEvent = exports.AreaActivatedEvent = exports.AnchorMappingStatusEvent = exports.AnchorError = exports.AnchorEvent = exports.InitializeErrorEvent = exports.InitializedLensCloudEvent = exports.InitializedEvent = void 0;
const Event_1 = require("../Util/Event");
const Deferred_1 = require("../Util/Deferred");
const Delay_1 = require("../Util/Delay");
const Tracking_1 = require("./Tracking");
const Logging_1 = require("./Logging");
const MapScanning_1 = require("./MapScanning");
const Model_1 = require("./Model");
const PersistentStorage_1 = require("./PersistentStorage");
// initialization events
class InitializedEvent {
}
exports.InitializedEvent = InitializedEvent;
class InitializedLensCloudEvent {
}
exports.InitializedLensCloudEvent = InitializedLensCloudEvent;
class InitializeErrorEvent {
}
exports.InitializeErrorEvent = InitializeErrorEvent;
class AnchorEvent {
}
exports.AnchorEvent = AnchorEvent;
class AnchorError {
}
exports.AnchorError = AnchorError;
class AnchorMappingStatusEvent {
}
exports.AnchorMappingStatusEvent = AnchorMappingStatusEvent;
class AreaActivatedEvent {
}
exports.AreaActivatedEvent = AreaActivatedEvent;
class AreaDeactivatedEvent {
}
exports.AreaDeactivatedEvent = AreaDeactivatedEvent;
class SpatialPersistence {
    constructor(mappingInterval, resetDelayInS, debug, incrementalMapping, enableLoggingPoseSettling, locationCloudStorageModule) {
        // temporary
        this._mappingInterval = 20;
        this._resetDelayInS = 0.5;
        this._checkPointDelayInS = 1.0;
        this._debug = true;
        this._incrementalMapping = false;
        this._enableLoggingPoseSettling = false;
        this._trackedLocationsCount = 0;
        this._mapScanning = new Deferred_1.Deferred();
        this.sceneObjects = {};
        this.alreadyInitialized = false;
        this.initializingDelayInSec = 1.0;
        this.onLoadedEvent = new Event_1.default();
        this.onLoaded = this.onLoadedEvent.publicApi();
        this.onLoadErrorEvent = new Event_1.default();
        this.onLoadError = this.onLoadErrorEvent.publicApi();
        this.onUnloadedEvent = new Event_1.default();
        this.onUnloaded = this.onUnloadedEvent.publicApi();
        this.onFoundEvent = new Event_1.default();
        this.onFound = this.onFoundEvent.publicApi();
        this.onLostEvent = new Event_1.default();
        this.onLost = this.onLostEvent.publicApi();
        this.onDeletedEvent = new Event_1.default();
        this.onDeleted = this.onDeletedEvent.publicApi();
        this.onDeleteErrorEvent = new Event_1.default();
        this.onDeleteError = this.onDeleteErrorEvent.publicApi();
        this.checkpointsBlockedEvent = new Event_1.default();
        this.onCheckpointsBlocked = this.checkpointsBlockedEvent.publicApi();
        // debugging / ui
        this.onAnchorMappingStatusEvent = new Event_1.default();
        this.onAnchorMappingStatus = this.onAnchorMappingStatusEvent.publicApi();
        // Outgoing area selection events
        this.onAreaActivatedEvent = new Event_1.default();
        this.onAreaActivated = this.onAreaActivatedEvent.publicApi();
        this.onAreaDeactivatedEvent = new Event_1.default();
        this.onAreaDeactivated = this.onAreaDeactivatedEvent.publicApi();
        // A13 behaviour - wait for any location for current area to be tracked, then we resolve
        this._mappedOrTracked = new Deferred_1.Deferred();
        this._trackingStateFromLatestCheckpoint = null;
        this.mapSizeFromLatestCheckpoint = 0;
        this.trackingPerLocation = {}; // locationId -> LocationTracking
        this.trackedLocationPerAnchor = {}; // anchorId -> locationId
        this.maxAllowedMapsPerArea = 10;
        this.maxAllowedTotalMapSizeForArea = 30 * 1024 * 1024; // 30MB
        this.totalMapSizeOfUntrackedLocations = 0;
        this.logger = Logging_1.LoggerVisualization.createLogger("component");
        this.log = this.logger.log.bind(this.logger);
        this._locationCloudStorageModule = locationCloudStorageModule;
        this._mappingInterval = mappingInterval;
        this._resetDelayInS = resetDelayInS;
        this._debug = debug;
        this._incrementalMapping = incrementalMapping;
        this._enableLoggingPoseSettling = enableLoggingPoseSettling;
    }
    createAnchor(sceneObject) {
        let anchorId = getGuid();
        this.model.createAnchor(anchorId);
        this.sceneObjects[anchorId] = sceneObject;
        sceneObject[SpatialPersistence.anchorIdStash] = anchorId;
        let anchorEvent = new AnchorEvent();
        anchorEvent.anchorId = anchorId;
        anchorEvent.sceneObject = sceneObject;
        return anchorEvent;
    }
    async updateAnchorInModel(sceneObject) {
        let anchorId = sceneObject[SpatialPersistence.anchorIdStash];
        this.log("Saving " + anchorId);
        const [trackingState, locationSize] = await this.getTrackingStateWithLocationSizeForAnchor(sceneObject);
        if (trackingState === null) {
            throw new Error("Invalid tracking state: No tracking state available. Either checkpointing hasn't completed or no locations are being tracked.");
        }
        let toLensWorldFromAnchor = sceneObject.getTransform().getWorldTransform();
        let toLensWorldFromAnchorRoot = trackingState.anchoringRoot
            .getTransform()
            .getWorldTransform();
        let toAnchorRootFromAnchor = toLensWorldFromAnchorRoot
            .inverse()
            .mult(toLensWorldFromAnchor);
        let serializedLocationId = await this.persistentStorage.storeLocation(trackingState.location);
        let modelEvent = await this.model.saveAnchor(anchorId, serializedLocationId, toAnchorRootFromAnchor, locationSize);
        return modelEvent;
    }
    async getTrackedAnchorStateWithLocationSize(anchor) {
        if (this._trackingStateFromLatestCheckpoint &&
            (await this.isAnchorTrackedBeforeCheckpointTrigger(anchor))) {
            return [
                this._trackingStateFromLatestCheckpoint,
                this.mapSizeFromLatestCheckpoint,
            ];
        }
        const locationTracking = this.trackingPerLocation[this.trackedLocationPerAnchor[anchor.anchorId]];
        return [locationTracking.trackingState, locationTracking.locationSize];
    }
    getNearestLocationTrackingForAnchor(anchorSceneObject) {
        const anchorPos = anchorSceneObject.getTransform().getWorldPosition();
        let minDistance = Infinity;
        let nearestLocationTracking = null;
        for (const locationTracking of Object.values(this.trackingPerLocation)) {
            const rootTransform = locationTracking?.trackingState?.anchoringRoot?.getTransform();
            if (!rootTransform)
                continue;
            const rootPos = rootTransform.getWorldPosition();
            const distance = anchorPos.distance(rootPos);
            if (distance < minDistance) {
                minDistance = distance;
                nearestLocationTracking = locationTracking;
            }
        }
        return nearestLocationTracking;
    }
    async getTrackingStateWithLocationSizeForAnchor(sceneObject) {
        let anchorId = sceneObject[SpatialPersistence.anchorIdStash];
        let anchor = this.model.area.anchors[anchorId];
        const isNewAnchor = !(anchor.anchorId in this.trackedLocationPerAnchor);
        let haveCheckpointed = this._trackingStateFromLatestCheckpoint !== null;
        if (isNewAnchor && haveCheckpointed) {
            // Anchor is new and we have checkpointed, so use state from current mapping session.
            return [
                this._trackingStateFromLatestCheckpoint,
                this.mapSizeFromLatestCheckpoint,
            ];
        }
        else if (isNewAnchor) {
            // Anchor was created when checkpointing was blocked or before first checkpoint, but we tracked first,
            // hence we attach the anchor to the nearest tracked location
            // get nearest tracked location for anchor
            const locationTracking = this.getNearestLocationTrackingForAnchor(sceneObject);
            return [locationTracking.trackingState, locationTracking.locationSize];
        }
        // Tracked anchor was moved
        return await this.getTrackedAnchorStateWithLocationSize(anchor);
    }
    async saveAnchor(sceneObject) {
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
    async deleteAnchor(sceneObject) {
        let anchorId = sceneObject[SpatialPersistence.anchorIdStash];
        let modelEvent = this.model.deleteAnchor(anchorId);
        return this.createAnchorEvent(modelEvent);
    }
    async resetArea() {
        // can't reset if load hasn't completed
        await this.previousState.finally(async () => {
            this.log("resetting area " + this.model.currentAreaId);
            await this.model.reset();
            // !!! should be triggered by model
            // !!! missing is model notifying subscribers that state has changed due to lastTrackedLocation being cleared
            this.triggerSceneSave();
        });
    }
    selectArea(areaID) {
        this.model.selectArea(areaID);
    }
    awake(sceneObject, scriptComponent) {
        this.sceneObject = sceneObject;
        this.scriptComponent = scriptComponent;
        this.mappingSceneObject = global.scene.createSceneObject("mapping");
        this.mappingSceneObject.setParent(sceneObject);
        let mappingLocatedAt = this.mappingSceneObject.createComponent("LocatedAtComponent");
        mappingLocatedAt.location = LocationAsset.getAROrigin();
        this.model = new Model_1.Model();
        // !!! persistent storage needs to be per area, not per tracked location
        this.persistentStorage = new PersistentStorage_1.PersistentStorage(this._locationCloudStorageModule);
        this.model.onAnchorLoaded.add(this.notifyAnchorLoaded.bind(this));
        this.model.onAnchorUnloaded.add(this.notifyAnchorUnloaded.bind(this));
        this.model.onAnchorDeleted.add(this.notifyAnchorDeleted.bind(this));
        this.model.onAreaActivated.add(this.notifyAreaActivated.bind(this));
        this.model.onAreaDeactivated.add(this.notifyAreaDeactivated.bind(this));
    }
    async initializeMapping() {
        if (this.alreadyInitialized) {
            await (0, Delay_1.delay)(this.initializingDelayInSec);
        }
        this.alreadyInitialized = true;
        this.log("initializing mapping and tracking for area " + this.model.currentAreaId);
        let mapScanning = this.createMapScanning();
        // mapping control
        let trigger = new MapScanning_1.GateByFlagOrTrackingAlready();
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
            }
            catch (error) {
                this.log("error during initial checkpointing: " + error);
            }
        })();
    }
    createMapScanning() {
        let mapScanning = new MapScanning_1.MapScanning(this.scriptComponent);
        mapScanning.onMappingStatus.add((status) => {
            this.onAnchorMappingStatusEvent.invoke(status);
        });
        this._mapScanning.resolve(mapScanning);
        return mapScanning;
    }
    createLocationTracking(location, locationSize) {
        this.log("Creating new location tracking for " + location.toSerialized());
        return new Tracking_1.LocationTracking(this.scriptComponent, location, locationSize, this._enableLoggingPoseSettling);
    }
    async destroyMappingAndTracking() {
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
        this._mapScanning = new Deferred_1.Deferred();
        this.trackingPerLocation = {};
        await (0, Delay_1.delay)(this._resetDelayInS);
    }
    async scheduleSubsequentMap() {
        if (this._mappingInterval > 0.0) {
            this.log("scheduling subsequent map");
            let mapScanning = await this._mapScanning.promise;
            this.log("mapping session capacity used: " +
                mapScanning.mappingSession.capacityUsed);
            // "capacityUsed" is scaled relative to the "wearableMaximumSize_" parameter
            // defined in LensCore:
            // capacityUsed = std::min(rawCapacity / wearableMaximumSize_, 1.0)
            this.log("mapSizeFromLatestCheckpoint: " +
                this.mapSizeFromLatestCheckpoint / (1024 * 1024) +
                "MB");
            this.log("totalMapSizeOfUntrackedLocations: " +
                this.totalMapSizeOfUntrackedLocations / (1024 * 1024) +
                "MB");
            this.log("trackedLocationsCount: " + this._trackedLocationsCount);
            const totalMapSize = this.mapSizeFromLatestCheckpoint +
                this.totalMapSizeOfUntrackedLocations;
            if (totalMapSize >= this.maxAllowedTotalMapSizeForArea) {
                this.log("capacity used above threshold - stopping map saves");
                this.checkpointsBlockedEvent.invoke({
                    message: "Checkpoints blocked due to total size of all maps for area is too large. Track some previously loaded locations to unblock.",
                    anchorId: "",
                });
                return;
            }
            try {
                let trigger = new MapScanning_1.Timeout();
                trigger.timeoutInS = this._mappingInterval;
                let newlyMappedLocation = await mapScanning.checkpoint(trigger);
                this._trackingStateFromLatestCheckpoint = {
                    location: newlyMappedLocation,
                    anchoringRoot: this.mappingSceneObject,
                };
                await this.updateModelAgainstScan();
                this.scheduleSubsequentMap();
            }
            catch (error) {
                this.log("Chained checkpointing failed: " + error);
            }
        }
    }
    async isAnchorTrackedBeforeCheckpointTrigger(anchor) {
        const trackedLocationId = this.trackedLocationPerAnchor[anchor.anchorId];
        const locationTracking = this.trackingPerLocation[trackedLocationId];
        // If anchor location is tracked and is tracked before the latest checkpoint trigger
        return (locationTracking?.trackingState &&
            locationTracking.timestampWhenPoseSettled <
                (await this._mapScanning.promise).latestCheckpointTriggerTimestamp);
    }
    async updateModelAgainstScan() {
        if (this.model.area === undefined || this.model.area === null) {
            this.log("[updateModelAgainstScan] no area selected - cannot update model against scan");
            return;
        }
        this.mapSizeFromLatestCheckpoint = await this.getCurrentMapSize();
        for (const [anchorId, anchor] of Object.entries(this.model.area.anchors)) {
            const isNewAnchor = !(anchor.anchorId in this.trackedLocationPerAnchor);
            const shouldUpdateAnchor = isNewAnchor ||
                (await this.isAnchorTrackedBeforeCheckpointTrigger(anchor));
            // Update anchor if it is newly spawned or if the anchor was loaded and its location was tracked before the latest checkpoint trigger
            if (shouldUpdateAnchor) {
                await this.updateAnchorInModel(this.sceneObjects[anchorId]);
            }
        }
        this.triggerSceneSave();
    }
    async initialize() {
        this.log("initializing");
        this.previousState = this.loadPrevious();
        try {
            await this.previousState;
        }
        catch (noPreviousStateError) {
            this.log("no previous location state - using default state" +
                noPreviousStateError);
            this.model.load(SpatialPersistence.DefaultStateAsString);
            this.model.selectArea(SpatialPersistence.DefaultAreaId);
        }
    }
    async loadPrevious() {
        try {
            let stateAsString = await this.persistentStorage.loadFromStore();
            this.model.load(stateAsString);
        }
        catch (error) {
            throw new Error("previous location failed to load");
        }
    }
    invokeOnFoundForTrackedAnchors(trackedLocationId) {
        for (const anchorId of Object.keys(this.trackedLocationPerAnchor)) {
            if (this.trackedLocationPerAnchor[anchorId] === trackedLocationId) {
                const anchorEvent = new AnchorEvent();
                anchorEvent.anchorId = anchorId;
                anchorEvent.sceneObject = this.sceneObjects[anchorId];
                this.onFoundEvent.invoke(anchorEvent);
            }
        }
    }
    async track(trackedLocationId) {
        await this.trackingPerLocation[trackedLocationId].onceFound;
        this.invokeOnFoundForTrackedAnchors(trackedLocationId);
        this._trackedLocationsCount += 1;
        this.totalMapSizeOfUntrackedLocations -=
            this.trackingPerLocation[trackedLocationId].locationSize;
        this.mappedOrTracked.resolve();
    }
    get mappedOrTracked() {
        return this._mappedOrTracked;
    }
    set mappedOrTracked(mappedOrTracked) {
        this._mappedOrTracked.reject(new Error("tracking cancelled"));
        this._mappedOrTracked = mappedOrTracked;
        this._trackingStateFromLatestCheckpoint = null;
    }
    // Serialize model to JSON string and save it to persistent storage
    async triggerSceneSave() {
        // todo: wait 5s then save
        this.log("triggering save");
        let stateAsString = this.model.save();
        try {
            await this.persistentStorage.saveToStore(stateAsString);
            this.log("save successful");
        }
        catch (error) {
            this.log("save failed: " + error);
        }
    }
    notifyAnchorLoaded(modelEvent) {
        let trackingScnObject;
        const locationId = modelEvent.trackedLocation;
        const anchorId = modelEvent.anchorId;
        // check if we already have a LocationTracking for this location, if not create one
        if (!(locationId in this.trackingPerLocation)) {
            this.totalMapSizeOfUntrackedLocations += modelEvent.trackedLocationSize;
            this.trackingPerLocation[locationId] = this.createLocationTracking(this.persistentStorage.retrieveLocation(locationId), modelEvent.trackedLocationSize);
            this.trackingPerLocation[locationId].sceneObject.setParent(this.sceneObject);
            this.track(locationId);
        }
        trackingScnObject = this.trackingPerLocation[locationId].sceneObject;
        this.trackedLocationPerAnchor[anchorId] = locationId;
        let anchorSceneObject = global.scene.createSceneObject("anchor-" + anchorId);
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
        }
        catch (error) {
            this.onLoadErrorEvent.invoke({
                message: error,
                anchorId: modelEvent.anchorId,
            });
        }
    }
    createAnchorEvent(modelEvent) {
        let sceneObject = this.sceneObjects[modelEvent.anchorId];
        let anchorEvent = new AnchorEvent();
        anchorEvent.anchorId = modelEvent.anchorId;
        anchorEvent.sceneObject = sceneObject;
        return anchorEvent;
    }
    notifyAnchorUnloaded(modelEvent) {
        this.log("unloading anchor " + modelEvent.anchorId);
        try {
            // model was not updated so no need to save
            // as far as the ui is concerned, the anchor is gone
            // forward the event
            let anchorEvent = this.createAnchorEvent(modelEvent);
            // anchor was unloaded, we no longer care about it
            this.sceneObjects[modelEvent.anchorId] = undefined;
            this.log("invoking onUnloaded due to unloading anchor " + modelEvent.anchorId);
            this.onUnloadedEvent.invoke(anchorEvent);
            this.onDeletedEvent.invoke(anchorEvent);
        }
        catch (error) {
            this.log("error unloading anchor: " + error + " " + error.stack);
        }
    }
    notifyAnchorDeleted(modelEvent) {
        // model was updated, now we need to save
        this.triggerSceneSave();
        // we don't notify UI at this point - anchor was unloaded, and that is forwarded as a delete
        // event to UI
    }
    async getCurrentMapSize() {
        const mapScanning = await this._mapScanning.promise;
        return (mapScanning.mappingSession.capacityUsed *
            mapScanning.mappingSession.wearableMaximumSize);
    }
    async notifyAreaActivated(areaEvent) {
        // At this point all prev anchors are unloaded if there was an area switch
        try {
            await this.initializeMapping();
            // TODO (ngollahalliananda): https://jira.sc-corp.net/browse/AVALON-50446
            // Cancel API call has issues since map snips buffer is not cleared properly
            // This is a workaround by adding a delay before checkpointing in case of new area
            await (0, Delay_1.delay)(this._checkPointDelayInS);
            const totalMapSize = (await this.getCurrentMapSize()) +
                this.totalMapSizeOfUntrackedLocations;
            if (totalMapSize < this.maxAllowedTotalMapSizeForArea &&
                Object.keys(this.trackingPerLocation).length <
                    this.maxAllowedMapsPerArea) {
                if (this.gateByFlagOrTrackingAlreadyTrigger) {
                    this.gateByFlagOrTrackingAlreadyTrigger.allowCheckpoint = true;
                }
            }
            else {
                this.checkpointsBlockedEvent.invoke({
                    message: "Checkpoints blocked due to too many loaded locations or total size of all maps for area is too large. Track some previously loaded locations to unblock.",
                    anchorId: "",
                });
                await this.mappedOrTracked.promise;
            }
            let areaActivatedEvent = {
                areaId: areaEvent.areaId,
            };
            this.onAreaActivatedEvent.invoke(areaActivatedEvent);
        }
        catch (error) {
            this.log("notifyAreaActivated: error during area activation for area " +
                areaEvent.areaId +
                ": " +
                error);
        }
        finally {
            if (this.gateByFlagOrTrackingAlreadyTrigger) {
                this.gateByFlagOrTrackingAlreadyTrigger.allowCheckpoint =
                    this._incrementalMapping; // only allow first scan to complete if we are incrementally mapping
                this.gateByFlagOrTrackingAlreadyTrigger.trackingAlready = true;
            }
        }
    }
    async notifyAreaDeactivated(deletedAreaEvent) {
        this.mappedOrTracked = new Deferred_1.Deferred();
        this.trackedLocationPerAnchor = {};
        this.mapSizeFromLatestCheckpoint = 0;
        this.totalMapSizeOfUntrackedLocations = 0;
        this._trackedLocationsCount = 0;
        // Start the destroy operation asynchronously
        (async () => {
            try {
                await this.destroyMappingAndTracking();
                this.log(deletedAreaEvent.areaId +
                    " deactivated - destroyed mapping and tracking session");
            }
            catch (error) {
                this.log("error destroying mapping and tracking session: " + error);
                throw new Error("error destroying mapping and tracking session: " + error);
            }
        })();
        let areaDeactivatedEvent = {
            areaId: deletedAreaEvent.areaId,
        };
        this.onAreaDeactivatedEvent.invoke(areaDeactivatedEvent);
    }
}
exports.SpatialPersistence = SpatialPersistence;
SpatialPersistence.anchorIdStash = "__anchorId";
SpatialPersistence.DefaultAreaId = "default";
SpatialPersistence.DefaultStateAsString = JSON.stringify({
    areas: { default: { name: "default" } },
});
const getGuid = () => {
    // return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    let uuid = "";
    let currentChar;
    for (currentChar = 0; currentChar < /* 36 minus four hyphens */ 32; currentChar += 1) {
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
//# sourceMappingURL=SpatialPersistence.js.map