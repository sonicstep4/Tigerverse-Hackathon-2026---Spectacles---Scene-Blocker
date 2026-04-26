"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockingGuideController = void 0;
var __selfType = requireType("./BlockingGuideController");
function component(target) {
    target.getTypeName = function () { return __selfType; };
    if (target.prototype.hasOwnProperty("getTypeName"))
        return;
    Object.defineProperty(target.prototype, "getTypeName", {
        value: function () { return __selfType; },
        configurable: true,
        writable: true
    });
}
const BlockingPathBuilder_1 = require("./BlockingPathBuilder");
let BlockingGuideController = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var BlockingGuideController = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.presentationSwitcher = this.presentationSwitcher;
            this.waypointRoot = this.waypointRoot;
            this.pathVisual = this.pathVisual;
            this.targetMarker = this.targetMarker;
            this.playerReference = this.playerReference;
            this.pathWidth = this.pathWidth;
            this.floorYOffset = this.floorYOffset;
            this.debugLogs = this.debugLogs;
            this.debugLogInterval = this.debugLogInterval;
            this.spawnDebugBeacons = this.spawnDebugBeacons;
            this.debugBeaconPrefab = this.debugBeaconPrefab;
            this.waypoints = [];
            this.targetIndex = -1;
            this.lastDebugLogTime = -1000;
            this.debugBeaconInstances = [];
        }
        __initialize() {
            super.__initialize();
            this.presentationSwitcher = this.presentationSwitcher;
            this.waypointRoot = this.waypointRoot;
            this.pathVisual = this.pathVisual;
            this.targetMarker = this.targetMarker;
            this.playerReference = this.playerReference;
            this.pathWidth = this.pathWidth;
            this.floorYOffset = this.floorYOffset;
            this.debugLogs = this.debugLogs;
            this.debugLogInterval = this.debugLogInterval;
            this.spawnDebugBeacons = this.spawnDebugBeacons;
            this.debugBeaconPrefab = this.debugBeaconPrefab;
            this.waypoints = [];
            this.targetIndex = -1;
            this.lastDebugLogTime = -1000;
            this.debugBeaconInstances = [];
        }
        onAwake() {
            this.createEvent("OnStartEvent").bind(() => this.onStart());
            this.createEvent("UpdateEvent").bind(() => this.onUpdate());
        }
        onStart() {
            this.collectWaypoints();
            this.spawnWaypointDebugBeacons();
            if (this.presentationSwitcher) {
                this.presentationSwitcher.addOnSlideChanged((index) => {
                    this.setTargetForSlide(index);
                });
                this.setTargetForSlide(this.presentationSwitcher.getCurrentIndex());
            }
        }
        onUpdate() {
            if (this.playerReference && this.targetIndex >= 0) {
                this.refreshPathVisual();
            }
        }
        collectWaypoints() {
            this.waypoints = [];
            if (!this.waypointRoot) {
                print("BlockingGuideController: waypointRoot is not assigned.");
                return;
            }
            for (let i = 0; i < this.waypointRoot.getChildrenCount(); i++) {
                this.waypoints.push(this.waypointRoot.getChild(i));
            }
            if (this.debugLogs) {
                print("BlockingGuideController: Waypoints found = " + this.waypoints.length);
            }
        }
        spawnWaypointDebugBeacons() {
            this.clearDebugBeacons();
            if (!this.spawnDebugBeacons || !this.debugBeaconPrefab) {
                return;
            }
            for (let i = 0; i < this.waypoints.length; i++) {
                const waypoint = this.waypoints[i];
                const beacon = this.debugBeaconPrefab.instantiate(this.getSceneObject());
                const waypointPos = waypoint.getTransform().getWorldPosition().add(new vec3(0, this.floorYOffset, 0));
                beacon.getTransform().setWorldPosition(waypointPos);
                this.debugBeaconInstances.push(beacon);
            }
            if (this.debugLogs) {
                print("BlockingGuideController: Spawned debug beacons = " + this.debugBeaconInstances.length);
            }
        }
        clearDebugBeacons() {
            for (let i = 0; i < this.debugBeaconInstances.length; i++) {
                const beacon = this.debugBeaconInstances[i];
                if (beacon) {
                    beacon.destroy();
                }
            }
            this.debugBeaconInstances = [];
        }
        setTargetForSlide(slideIndex) {
            if (this.waypoints.length === 0) {
                return;
            }
            const clampedIndex = Math.min(Math.max(slideIndex, 0), this.waypoints.length - 1);
            this.targetIndex = clampedIndex;
            if (this.targetMarker) {
                const markerPosition = this.waypoints[this.targetIndex]
                    .getTransform()
                    .getWorldPosition()
                    .add(new vec3(0, this.floorYOffset, 0));
                this.targetMarker.getTransform().setWorldPosition(markerPosition);
                if (this.debugLogs) {
                    print("BlockingGuideController: Target set to " +
                        this.waypoints[this.targetIndex].name +
                        " at (" +
                        markerPosition.x.toFixed(1) +
                        ", " +
                        markerPosition.y.toFixed(1) +
                        ", " +
                        markerPosition.z.toFixed(1) +
                        ")");
                }
            }
            this.refreshPathVisual();
        }
        refreshPathVisual() {
            if (!this.pathVisual || this.targetIndex < 0 || this.targetIndex >= this.waypoints.length) {
                return;
            }
            const targetPos = this.waypoints[this.targetIndex]
                .getTransform()
                .getWorldPosition()
                .add(new vec3(0, this.floorYOffset, 0));
            const points = [];
            if (this.playerReference) {
                const playerPos = this.playerReference.getTransform().getWorldPosition().add(new vec3(0, this.floorYOffset, 0));
                points.push(playerPos);
            }
            points.push(targetPos);
            if (this.targetIndex + 1 < this.waypoints.length) {
                const nextPos = this.waypoints[this.targetIndex + 1]
                    .getTransform()
                    .getWorldPosition()
                    .add(new vec3(0, this.floorYOffset, 0));
                points.push(nextPos);
            }
            const mesh = BlockingPathBuilder_1.BlockingPathBuilder.buildFromPoints(points, this.pathWidth);
            if (mesh) {
                this.pathVisual.mesh = mesh;
                this.pathVisual.enabled = true;
                this.debugPathState(points, true);
            }
            else {
                this.pathVisual.enabled = false;
                this.debugPathState(points, false);
            }
        }
        debugPathState(points, hasMesh) {
            if (!this.debugLogs) {
                return;
            }
            const now = getTime();
            if (now - this.lastDebugLogTime < this.debugLogInterval) {
                return;
            }
            this.lastDebugLogTime = now;
            let msg = "BlockingGuideController: mesh=" + (hasMesh ? "yes" : "no") + ", points=" + points.length;
            for (let i = 0; i < points.length; i++) {
                msg +=
                    " | p" +
                        i +
                        "=(" +
                        points[i].x.toFixed(1) +
                        "," +
                        points[i].y.toFixed(1) +
                        "," +
                        points[i].z.toFixed(1) +
                        ")";
            }
            print(msg);
        }
    };
    __setFunctionName(_classThis, "BlockingGuideController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BlockingGuideController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BlockingGuideController = _classThis;
})();
exports.BlockingGuideController = BlockingGuideController;
//# sourceMappingURL=BlockingGuideController.js.map