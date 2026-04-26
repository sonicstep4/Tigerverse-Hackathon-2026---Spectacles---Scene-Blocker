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
exports.SmoothRepositioning = void 0;
var __selfType = requireType("./SmoothRespositioning");
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
const CameraService_1 = require("./CameraService");
let SmoothRepositioning = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var SmoothRepositioning = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.maxDistance = this.maxDistance; // Maximum allowed distance in cm
            this.maxAngleDegrees = this.maxAngleDegrees; // Maximum allowed angle in degrees
            this.repositionSpeed = this.repositionSpeed; // Speed of repositioning in cm/second
            this.frontDistance = this.frontDistance; // Distance to place in front of camera
            this.xOffset = this.xOffset; // Horizontal offset (positive = right, negative = left)
            this.yOffset = this.yOffset; // Vertical offset from original Y position
            this.cooldownTime = this.cooldownTime; // Time to wait between repositions
            this.lastRepositionTime = 0;
            this.isRepositioning = false;
            // Animation variables
            this.animStartTime = 0;
            this.animDuration = 0;
        }
        __initialize() {
            super.__initialize();
            this.maxDistance = this.maxDistance; // Maximum allowed distance in cm
            this.maxAngleDegrees = this.maxAngleDegrees; // Maximum allowed angle in degrees
            this.repositionSpeed = this.repositionSpeed; // Speed of repositioning in cm/second
            this.frontDistance = this.frontDistance; // Distance to place in front of camera
            this.xOffset = this.xOffset; // Horizontal offset (positive = right, negative = left)
            this.yOffset = this.yOffset; // Vertical offset from original Y position
            this.cooldownTime = this.cooldownTime; // Time to wait between repositions
            this.lastRepositionTime = 0;
            this.isRepositioning = false;
            // Animation variables
            this.animStartTime = 0;
            this.animDuration = 0;
        }
        onAwake() {
            // Create the main update event
            this.createEvent("UpdateEvent").bind(() => this.onUpdate());
            this.cameraService = CameraService_1.CameraService.getInstance();
            // Store original Y position
            this.originalYPosition = this.getSceneObject().getTransform().getWorldPosition().y;
        }
        onUpdate() {
            if (this.isRepositioning) {
                this.updateAnimation();
            }
            else {
                this.checkAndReposition();
            }
        }
        updateAnimation() {
            const currentTime = getTime();
            const elapsed = currentTime - this.animStartTime;
            const t = Math.min(elapsed / this.animDuration, 1.0);
            const objTransform = this.getSceneObject().getTransform();
            // Lerp position and rotation
            const newPosition = vec3.lerp(this.animStartPosition, this.animTargetPosition, t);
            const newRotation = quat.slerp(this.animStartRotation, this.animTargetRotation, t);
            // Apply position and rotation
            objTransform.setWorldPosition(newPosition);
            objTransform.setWorldRotation(newRotation);
            // Check if animation is complete
            if (t >= 1.0) {
                // Set exact final position and rotation to avoid floating point errors
                objTransform.setWorldPosition(this.animTargetPosition);
                objTransform.setWorldRotation(this.animTargetRotation);
                // End animation state
                this.isRepositioning = false;
                this.lastRepositionTime = currentTime;
            }
        }
        // Separate the update logic
        checkAndReposition() {
            // Don't reposition if we're still in cooldown
            const currentTime = getTime();
            if (currentTime - this.lastRepositionTime < this.cooldownTime)
                return;
            if (this.needsRepositioning()) {
                this.repositionInFrontOfCamera();
                print("Repositioning");
            }
        }
        needsRepositioning() {
            // Get camera position
            const objTransform = this.getSceneObject().getTransform();
            const objPosition = objTransform.getWorldPosition();
            const camTransform = this.getCameraTransform();
            const camPosition = this.getCameraPosition();
            // Check distance
            const distance = objPosition.distance(camPosition);
            const isTooFar = distance > this.maxDistance;
            // Check Y-axis angle difference
            // Get forward direction in XZ plane for both camera and direction to object
            const camForwardXZ = new vec3(camTransform.forward.x, 0, camTransform.forward.z).normalize();
            const dirToObjectXZ = new vec3(objPosition.x - camPosition.x, 0, objPosition.z - camPosition.z).normalize();
            // Calculate angle in degrees (only considering y-axis rotation)
            const angleCos = camForwardXZ.dot(dirToObjectXZ);
            const angleRad = Math.acos(Math.min(Math.max(angleCos, -1), 1)); // Clamp to avoid domain errors
            const angleDeg = angleRad * (180 / Math.PI);
            const isAngleTooLarge = angleDeg > this.maxAngleDegrees;
            // Reposition ONLY if BOTH conditions are met
            return isTooFar || isAngleTooLarge;
        }
        repositionInFrontOfCamera() {
            this.isRepositioning = true;
            const objTransform = this.getSceneObject().getTransform();
            this.animStartPosition = objTransform.getWorldPosition();
            this.animStartRotation = objTransform.getWorldRotation();
            const camTransform = this.getCameraTransform();
            const camPosition = camTransform.getWorldPosition();
            // Get camera forward vector but flatten it to XZ plane
            const flatForward = new vec3(camTransform.forward.x, 0, camTransform.forward.z).normalize();
            // Calculate position in front of camera on XZ plane
            const basePositionXZ = camPosition.add(flatForward.uniformScale(this.frontDistance));
            // Apply horizontal offset (using right vector but flattened)
            const flatRight = new vec3(camTransform.right.x, 0, camTransform.right.z).normalize();
            const rightOffset = flatRight.uniformScale(this.xOffset);
            // Create final position with preserved Y + offset
            this.animTargetPosition = new vec3(basePositionXZ.x + rightOffset.x, this.originalYPosition + this.yOffset, basePositionXZ.z + rightOffset.z);
            // Calculate rotation to face camera, but only on Y axis
            const horizontalDir = new vec3(camPosition.x - this.animTargetPosition.x, 0, camPosition.z - this.animTargetPosition.z).normalize();
            // Create a rotation that only affects the Y axis
            this.animTargetRotation = quat.lookAt(horizontalDir, vec3.up());
            // Animation timing setup
            const distance = this.animStartPosition.distance(this.animTargetPosition);
            this.animDuration = distance / this.repositionSpeed;
            this.animStartTime = getTime();
        }
        getCameraPosition() {
            const mainCamera = this.cameraService.getCamera(CameraService_1.CameraType.Main);
            return mainCamera.getTransform().getWorldPosition();
        }
        getCameraTransform() {
            const mainCamera = this.cameraService.getCamera(CameraService_1.CameraType.Main);
            return mainCamera.getTransform();
        }
    };
    __setFunctionName(_classThis, "SmoothRepositioning");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SmoothRepositioning = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SmoothRepositioning = _classThis;
})();
exports.SmoothRepositioning = SmoothRepositioning;
//# sourceMappingURL=SmoothRespositioning.js.map