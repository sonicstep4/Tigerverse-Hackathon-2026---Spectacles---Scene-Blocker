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
exports.SidePanelFollow = void 0;
var __selfType = requireType("./SidePanelFollow");
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
let SidePanelFollow = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var SidePanelFollow = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.forwardDistance = this.forwardDistance;
            this.sideOffset = this.sideOffset;
            this.verticalOffset = this.verticalOffset;
            this.positionLerpSpeed = this.positionLerpSpeed;
            this.rotationLerpSpeed = this.rotationLerpSpeed;
            this.yawOnlyFacing = this.yawOnlyFacing;
        }
        __initialize() {
            super.__initialize();
            this.forwardDistance = this.forwardDistance;
            this.sideOffset = this.sideOffset;
            this.verticalOffset = this.verticalOffset;
            this.positionLerpSpeed = this.positionLerpSpeed;
            this.rotationLerpSpeed = this.rotationLerpSpeed;
            this.yawOnlyFacing = this.yawOnlyFacing;
        }
        onAwake() {
            this.cameraService = CameraService_1.CameraService.getInstance();
            this.createEvent("UpdateEvent").bind(() => this.onUpdate());
        }
        onUpdate() {
            const cam = this.cameraService.getCamera(CameraService_1.CameraType.Main);
            if (!cam) {
                return;
            }
            const camTr = cam.getTransform();
            const camPos = camTr.getWorldPosition();
            const targetPos = camPos
                .add(camTr.forward.uniformScale(this.forwardDistance))
                .add(camTr.right.uniformScale(this.sideOffset))
                .add(camTr.up.uniformScale(this.verticalOffset));
            const panelTr = this.getSceneObject().getTransform();
            const currentPos = panelTr.getWorldPosition();
            const dt = Math.min(getDeltaTime(), 0.05);
            const posT = Math.max(0, Math.min(1, dt * this.positionLerpSpeed));
            const newPos = vec3.lerp(currentPos, targetPos, posT);
            panelTr.setWorldPosition(newPos);
            let targetRot;
            if (this.yawOnlyFacing) {
                const toCam = camPos.sub(newPos);
                const flatToCam = new vec3(toCam.x, 0, toCam.z);
                if (flatToCam.length > 0.0001) {
                    targetRot = quat.lookAt(flatToCam.normalize(), vec3.up());
                }
                else {
                    targetRot = panelTr.getWorldRotation();
                }
            }
            else {
                const toCam = camPos.sub(newPos);
                if (toCam.length > 0.0001) {
                    targetRot = quat.lookAt(toCam.normalize(), vec3.up());
                }
                else {
                    targetRot = panelTr.getWorldRotation();
                }
            }
            const currentRot = panelTr.getWorldRotation();
            const rotT = Math.max(0, Math.min(1, dt * this.rotationLerpSpeed));
            const newRot = quat.slerp(currentRot, targetRot, rotT);
            panelTr.setWorldRotation(newRot);
        }
    };
    __setFunctionName(_classThis, "SidePanelFollow");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SidePanelFollow = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SidePanelFollow = _classThis;
})();
exports.SidePanelFollow = SidePanelFollow;
//# sourceMappingURL=SidePanelFollow.js.map