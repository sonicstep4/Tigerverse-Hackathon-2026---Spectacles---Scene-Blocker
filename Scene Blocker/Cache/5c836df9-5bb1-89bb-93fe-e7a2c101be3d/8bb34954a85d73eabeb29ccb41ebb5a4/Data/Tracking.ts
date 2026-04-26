import { findDeviceTracking } from "../Util/Util";
import {
  DelayActionByMultipleFrames,
  WorldPositionMonitor,
} from "../Util/Util";
import { TrackingState } from "./SpatialPersistence";
import { LoggerVisualization } from "./Logging";

export class LocationTracking {
  constructor(
    script: BaseScriptComponent,
    location: LocationAsset,
    locationSize: number,
    logPoseSettling: boolean,
  ) {
    this._sceneObject = global.scene.createSceneObject(
      "tracking - " + location.toSerialized(),
    );
    this._locationSize = locationSize;
    let deviceTracking = findDeviceTracking();
    let poseLogger = logPoseSettling
      ? () => {
          this.log(
            "pose settling: locatedAt - " +
              locatedAt.getTransform().getWorldTransform().toString() +
              " device - " +
              deviceTracking
                .getSceneObject()
                .getTransform()
                .getWorldTransform()
                .toString(),
          );
        }
      : () => {
          return;
        };
    this.worldPositionMonitor = new WorldPositionMonitor(
      script,
      this._sceneObject,
      poseLogger,
    );

    // onFound appears not to get reset when location is set to null, so we always have to remove the component if present
    this.removeTrackingComponent();

    let locatedAt = this._sceneObject.createComponent(
      "LocatedAtComponent",
    ) as LocatedAtComponent;
    this.log("downloading location " + location.toSerialized());
    locatedAt.location = location;
    locatedAt.onReady.add(() => {
      this.log("attempting to track " + location.toSerialized());
    });
    this.onceFound = new Promise<void>((resolve, reject) => {
      locatedAt.onFound.add(async () => {
        this.log(
          "location " +
            location.toSerialized() +
            " found, waiting for stability",
        );

        // !!! hack because onFound fires before world transform is set
        await this.worldPositionMonitor.waitForStability(
          locatedAt.getTransform(),
          3,
          1,
        );

        this.log("location " + location.toSerialized() + " stable");

        // record time when pose is settled
        this._timestampWhenPoseSettled = getTime();

        // Populate trackingState after location is found and stable
        this.trackingState = {
          location: location,
          anchoringRoot: this._sceneObject,
        };

        resolve();
      });
      //locatedAt.onError.add(() => {
      //    this.log("tracking location: " + location.toSerialized() + " - error");
      //});
      //locatedAt.onCannotTrack.add(() => {
      //    this.log("tracking location: " + location.toSerialized() + " - cannot track");
      //});
    });
  }

  destroy() {
    this.removeTrackingComponent();
    this.trackingState = undefined;
    this._timestampWhenPoseSettled = undefined;
  }

  private removeTrackingComponent() {
    let sceneObject = this.sceneObject;
    let oldLocatedAt = sceneObject.getComponent(
      "LocatedAtComponent",
    ) as LocatedAtComponent;
    if (oldLocatedAt) {
      this.log("removing old location tracking");
      oldLocatedAt.destroy();
    }
  }

  onceFound: Promise<void>;
  trackingState?: TrackingState;

  // private scene objects
  private _sceneObject: SceneObject;
  get sceneObject(): SceneObject {
    return this._sceneObject;
  }

  private _locationSize: number = 0;
  get locationSize(): number {
    return this._locationSize;
  }

  private logger = LoggerVisualization.createLogger("tracking");
  private log = this.logger.log.bind(this.logger);

  private worldPositionMonitor: WorldPositionMonitor;

  private _timestampWhenPoseSettled?: number;
  get timestampWhenPoseSettled(): number | undefined {
    return this._timestampWhenPoseSettled;
  }
}
