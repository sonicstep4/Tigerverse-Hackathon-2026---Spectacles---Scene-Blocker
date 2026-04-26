"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuidancePanel = void 0;
var __selfType = requireType("./GuidancePanel");
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
const Event_1 = require("SpectaclesInteractionKit.lspkg/Utils/Event");
const NespressoKnowledge_1 = require("./NespressoKnowledge");
const Logger_1 = require("Utilities.lspkg/Scripts/Utils/Logger");
const decorators_1 = require("SnapDecorators.lspkg/decorators");
const PANEL_DISTANCE = 50; // cm in front of camera
const PANEL_HEIGHT = 8; // cm above camera center
const PANEL_LERP = 5; // camera-follow smoothness
let GuidancePanel = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    let _instanceExtraInitializers = [];
    let _onStart_decorators;
    let _onUpdate_decorators;
    var GuidancePanel = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.mainCamObj = (__runInitializers(this, _instanceExtraInitializers), this.mainCamObj);
            // ── Texts ─────────────────────────────────────────────────────────────────
            this.stepCounterText = this.stepCounterText;
            this.stepTitleText = this.stepTitleText;
            this.stepDescText = this.stepDescText;
            this.modeText = this.modeText;
            // ── Buttons ───────────────────────────────────────────────────────────────
            this.prevButton = this.prevButton;
            this.nextButton = this.nextButton;
            this.modeToggleButton = this.modeToggleButton;
            // ── Logging ───────────────────────────────────────────────────────────────
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            // ── Public events ─────────────────────────────────────────────────────────
            /** Fired whenever the displayed step changes (0-based index). */
            this.onStepChanged = new Event_1.default();
            this.currentStepIndex = 0;
            this.isAutoMode = false;
        }
        __initialize() {
            super.__initialize();
            this.mainCamObj = (__runInitializers(this, _instanceExtraInitializers), this.mainCamObj);
            // ── Texts ─────────────────────────────────────────────────────────────────
            this.stepCounterText = this.stepCounterText;
            this.stepTitleText = this.stepTitleText;
            this.stepDescText = this.stepDescText;
            this.modeText = this.modeText;
            // ── Buttons ───────────────────────────────────────────────────────────────
            this.prevButton = this.prevButton;
            this.nextButton = this.nextButton;
            this.modeToggleButton = this.modeToggleButton;
            // ── Logging ───────────────────────────────────────────────────────────────
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            // ── Public events ─────────────────────────────────────────────────────────
            /** Fired whenever the displayed step changes (0-based index). */
            this.onStepChanged = new Event_1.default();
            this.currentStepIndex = 0;
            this.isAutoMode = false;
        }
        // ── Lifecycle ─────────────────────────────────────────────────────────────
        onAwake() {
            this.logger = new Logger_1.Logger("GuidancePanel", this.enableLogging || this.enableLoggingLifecycle, true);
            if (this.enableLoggingLifecycle)
                this.logger.debug("LIFECYCLE: onAwake()");
            this.trans = this.getSceneObject().getTransform();
            this.mainCamTrans = this.mainCamObj.getTransform();
            this.refreshDisplay();
        }
        onStart() {
            if (this.enableLoggingLifecycle)
                this.logger.debug("LIFECYCLE: onStart()");
            this.prevButton.onTriggerUp.add(() => this.goToPrevStep());
            this.nextButton.onTriggerUp.add(() => this.goToNextStep());
            this.modeToggleButton.onTriggerUp.add(() => this.toggleMode());
        }
        onUpdate() {
            const camPos = this.mainCamTrans.getWorldPosition();
            const desired = camPos
                .add(this.mainCamTrans.forward.uniformScale(-PANEL_DISTANCE))
                .add(this.mainCamTrans.up.uniformScale(PANEL_HEIGHT));
            this.trans.setWorldPosition(vec3.lerp(this.trans.getWorldPosition(), desired, getDeltaTime() * PANEL_LERP));
            const desiredRot = quat.lookAt(this.mainCamTrans.forward, vec3.up());
            this.trans.setWorldRotation(quat.slerp(this.trans.getWorldRotation(), desiredRot, getDeltaTime() * PANEL_LERP));
        }
        // ── Public API ────────────────────────────────────────────────────────────
        goToPrevStep() {
            if (this.isAutoMode)
                return;
            if (this.currentStepIndex > 0) {
                this.currentStepIndex--;
                this.refreshDisplay();
                this.onStepChanged.invoke(this.currentStepIndex);
                this.logger.info("Step -> " + (this.currentStepIndex + 1));
            }
        }
        goToNextStep() {
            if (this.isAutoMode)
                return;
            if (this.currentStepIndex < NespressoKnowledge_1.DESCALING_STEPS.length - 1) {
                this.currentStepIndex++;
                this.refreshDisplay();
                this.onStepChanged.invoke(this.currentStepIndex);
                this.logger.info("Step -> " + (this.currentStepIndex + 1));
            }
        }
        toggleMode() {
            this.isAutoMode = !this.isAutoMode;
            this.refreshDisplay();
            this.logger.info("Mode -> " + (this.isAutoMode ? "AUTO" : "MANUAL"));
        }
        /**
         * Called by SceneController when Gemini detects which step the user is at.
         * Ignored when in MANUAL mode.
         * @param stepId 1-based step number (1–15); 0 = not detected
         */
        setAutoStep(stepId) {
            if (!this.isAutoMode || stepId <= 0)
                return;
            const idx = NespressoKnowledge_1.DESCALING_STEPS.findIndex((s) => s.id === stepId);
            if (idx === -1 || idx === this.currentStepIndex)
                return;
            this.currentStepIndex = idx;
            this.refreshDisplay();
            this.onStepChanged.invoke(this.currentStepIndex);
            this.logger.info("Auto step -> " + NespressoKnowledge_1.DESCALING_STEPS[idx].id + ": " + NespressoKnowledge_1.DESCALING_STEPS[idx].title);
        }
        get currentStep() {
            return NespressoKnowledge_1.DESCALING_STEPS[this.currentStepIndex];
        }
        get autoMode() {
            return this.isAutoMode;
        }
        // ── Private helpers ───────────────────────────────────────────────────────
        refreshDisplay() {
            const step = NespressoKnowledge_1.DESCALING_STEPS[this.currentStepIndex];
            this.stepCounterText.text = step.id + " / " + NespressoKnowledge_1.DESCALING_STEPS.length + "  [" + step.phase.toUpperCase() + "]";
            this.stepTitleText.text = step.title;
            let desc = step.description;
            if (step.warning)
                desc += "\n\u26A0 " + step.warning;
            if (step.timeNote)
                desc += "\n\u23F1 " + step.timeNote;
            this.stepDescText.text = desc;
            this.modeText.text = this.isAutoMode ? "AUTO" : "MANUAL";
        }
    };
    __setFunctionName(_classThis, "GuidancePanel");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _onStart_decorators = [decorators_1.bindStartEvent];
        _onUpdate_decorators = [decorators_1.bindUpdateEvent];
        __esDecorate(_classThis, null, _onStart_decorators, { kind: "method", name: "onStart", static: false, private: false, access: { has: obj => "onStart" in obj, get: obj => obj.onStart }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onUpdate_decorators, { kind: "method", name: "onUpdate", static: false, private: false, access: { has: obj => "onUpdate" in obj, get: obj => obj.onUpdate }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GuidancePanel = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GuidancePanel = _classThis;
})();
exports.GuidancePanel = GuidancePanel;
//# sourceMappingURL=GuidancePanel.js.map