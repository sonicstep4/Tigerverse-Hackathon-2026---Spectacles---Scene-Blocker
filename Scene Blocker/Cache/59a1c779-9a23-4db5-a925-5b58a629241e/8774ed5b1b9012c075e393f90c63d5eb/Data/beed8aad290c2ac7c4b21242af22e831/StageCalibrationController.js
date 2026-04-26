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
exports.StageCalibrationController = void 0;
var __selfType = requireType("./StageCalibrationController");
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
let StageCalibrationController = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var StageCalibrationController = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.stageRoot = this.stageRoot;
            this.cameraObject = this.cameraObject;
            this.calibrateButton = this.calibrateButton;
            this.autoCalibrateOnStart = this.autoCalibrateOnStart;
            this.forwardDistance = this.forwardDistance;
            this.xOffset = this.xOffset;
            this.yOffset = this.yOffset;
            this.keepCurrentY = this.keepCurrentY;
        }
        __initialize() {
            super.__initialize();
            this.stageRoot = this.stageRoot;
            this.cameraObject = this.cameraObject;
            this.calibrateButton = this.calibrateButton;
            this.autoCalibrateOnStart = this.autoCalibrateOnStart;
            this.forwardDistance = this.forwardDistance;
            this.xOffset = this.xOffset;
            this.yOffset = this.yOffset;
            this.keepCurrentY = this.keepCurrentY;
        }
        onAwake() {
            this.createEvent("OnStartEvent").bind(() => this.onStart());
        }
        onStart() {
            if (this.calibrateButton) {
                this.calibrateButton.onButtonPinched.add(() => {
                    this.calibrateNow();
                });
            }
            if (this.autoCalibrateOnStart) {
                this.calibrateNow();
            }
        }
        calibrateNow() {
            if (!this.stageRoot || !this.cameraObject) {
                print("StageCalibrationController: stageRoot or cameraObject is not assigned.");
                return;
            }
            const cameraTransform = this.cameraObject.getTransform();
            const cameraPos = cameraTransform.getWorldPosition();
            const cameraForward = cameraTransform.forward;
            // Flatten forward so stage always sits on a floor plane in front of user.
            let flatForward = new vec3(cameraForward.x, 0, cameraForward.z);
            if (flatForward.length <= 0.0001) {
                flatForward = new vec3(0, 0, -1);
            }
            else {
                flatForward = flatForward.normalize();
            }
            const flatRight = new vec3(cameraTransform.right.x, 0, cameraTransform.right.z).normalize();
            const basePos = cameraPos.add(flatForward.uniformScale(this.forwardDistance));
            const targetY = this.keepCurrentY ? this.stageRoot.getTransform().getWorldPosition().y : 0;
            const targetPos = new vec3(basePos.x + flatRight.x * this.xOffset, targetY + this.yOffset, basePos.z + flatRight.z * this.xOffset);
            // Rotate stage so its local forward points away from user direction of travel.
            const stageForward = flatForward;
            const stageRotation = quat.lookAt(stageForward, vec3.up());
            const stageTransform = this.stageRoot.getTransform();
            stageTransform.setWorldPosition(targetPos);
            stageTransform.setWorldRotation(stageRotation);
            print("StageCalibrationController: Stage recalibrated.");
        }
    };
    __setFunctionName(_classThis, "StageCalibrationController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StageCalibrationController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StageCalibrationController = _classThis;
})();
exports.StageCalibrationController = StageCalibrationController;
//# sourceMappingURL=StageCalibrationController.js.map