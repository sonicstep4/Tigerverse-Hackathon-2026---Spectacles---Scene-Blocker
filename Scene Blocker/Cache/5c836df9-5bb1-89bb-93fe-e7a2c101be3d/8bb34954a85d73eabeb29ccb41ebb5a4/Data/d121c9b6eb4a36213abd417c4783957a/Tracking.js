"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationTracking = void 0;
const Util_1 = require("../Util/Util");
const Util_2 = require("../Util/Util");
const Logging_1 = require("./Logging");
class LocationTracking {
    constructor(script, location, locationSize, logPoseSettling) {
        this._locationSize = 0;
        this.logger = Logging_1.LoggerVisualization.createLogger("tracking");
        this.log = this.logger.log.bind(this.logger);
        this._sceneObject = global.scene.createSceneObject("tracking - " + location.toSerialized());
        this._locationSize = locationSize;
        let deviceTracking = (0, Util_1.findDeviceTracking)();
        let poseLogger = logPoseSettling
            ? () => {
                this.log("pose settling: locatedAt - " +
                    locatedAt.getTransform().getWorldTransform().toString() +
                    " device - " +
                    deviceTracking
                        .getSceneObject()
                        .getTransform()
                        .getWorldTransform()
                        .toString());
            }
            : () => {
                return;
            };
        this.worldPositionMonitor = new Util_2.WorldPositionMonitor(script, this._sceneObject, poseLogger);
        // onFound appears not to get reset when location is set to null, so we always have to remove the component if present
        this.removeTrackingComponent();
        let locatedAt = this._sceneObject.createComponent("LocatedAtComponent");
        this.log("downloading location " + location.toSerialized());
        locatedAt.location = location;
        locatedAt.onReady.add(() => {
            this.log("attempting to track " + location.toSerialized());
        });
        this.onceFound = new Promise((resolve, reject) => {
            locatedAt.onFound.add(async () => {
                this.log("location " +
                    location.toSerialized() +
                    " found, waiting for stability");
                // !!! hack because onFound fires before world transform is set
                await this.worldPositionMonitor.waitForStability(locatedAt.getTransform(), 3, 1);
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
    removeTrackingComponent() {
        let sceneObject = this.sceneObject;
        let oldLocatedAt = sceneObject.getComponent("LocatedAtComponent");
        if (oldLocatedAt) {
            this.log("removing old location tracking");
            oldLocatedAt.destroy();
        }
    }
    get sceneObject() {
        return this._sceneObject;
    }
    get locationSize() {
        return this._locationSize;
    }
    get timestampWhenPoseSettled() {
        return this._timestampWhenPoseSettled;
    }
}
exports.LocationTracking = LocationTracking;
//# sourceMappingURL=Tracking.js.map