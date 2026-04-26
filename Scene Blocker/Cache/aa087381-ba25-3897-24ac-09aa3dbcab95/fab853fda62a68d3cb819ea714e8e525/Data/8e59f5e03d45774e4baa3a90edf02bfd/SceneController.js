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
exports.SceneController = void 0;
var __selfType = requireType("./SceneController");
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
const Logger_1 = require("Utilities.lspkg/Scripts/Utils/Logger");
const decorators_1 = require("SnapDecorators.lspkg/decorators");
const NespressoKnowledge_1 = require("./NespressoKnowledge");
let SceneController = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    let _instanceExtraInitializers = [];
    let _onStart_decorators;
    var SceneController = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.showDebugVisuals = (__runInitializers(this, _instanceExtraInitializers), this.showDebugVisuals);
            this.debugVisualizer = this.debugVisualizer;
            this.speechUI = this.speechUI;
            this.gemini = this.gemini;
            this.responseUI = this.responseUI;
            this.loading = this.loading;
            this.depthCache = this.depthCache;
            this.guidancePanel = this.guidancePanel;
            this.testTexture = this.testTexture;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.isRequestRunning = false;
        }
        __initialize() {
            super.__initialize();
            this.showDebugVisuals = (__runInitializers(this, _instanceExtraInitializers), this.showDebugVisuals);
            this.debugVisualizer = this.debugVisualizer;
            this.speechUI = this.speechUI;
            this.gemini = this.gemini;
            this.responseUI = this.responseUI;
            this.loading = this.loading;
            this.depthCache = this.depthCache;
            this.guidancePanel = this.guidancePanel;
            this.testTexture = this.testTexture;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.isRequestRunning = false;
        }
        onAwake() {
            this.logger = new Logger_1.Logger("SceneController", this.enableLogging || this.enableLoggingLifecycle, true);
            if (this.enableLoggingLifecycle)
                this.logger.debug("LIFECYCLE: onAwake()");
        }
        onStart() {
            if (this.enableLoggingLifecycle)
                this.logger.debug("LIFECYCLE: onStart()");
            this.speechUI.onSpeechReady.add((text) => {
                this.onSpeechRecieved(text);
            });
        }
        onSpeechRecieved(text) {
            this.speechUI.activateSpeechButton(false);
            if (this.isRequestRunning) {
                this.logger.warn("REQUEST ALREADY RUNNING");
                return;
            }
            this.logger.info("MAKING REQUEST~~~~~");
            this.isRequestRunning = true;
            this.loading.activateLoder(true);
            this.responseUI.clearLabels();
            this.responseUI.closeResponseBubble();
            const depthFrameID = this.depthCache.saveDepthFrame();
            const camImage = this.testTexture ? this.testTexture : this.depthCache.getCamImageWithID(depthFrameID);
            let geminiPrompt = text;
            if (this.guidancePanel != null) {
                geminiPrompt = (0, NespressoKnowledge_1.formatGuidanceContextForPrompt)(this.guidancePanel.currentStep) + "\n\nUser said: " + text;
            }
            this.sendToGemini(camImage, geminiPrompt, depthFrameID);
            if (this.showDebugVisuals) {
                this.debugVisualizer.updateCameraFrame(camImage);
            }
        }
        sendToGemini(cameraFrame, text, depthFrameID) {
            this.gemini.makeGeminiRequest(cameraFrame, text, (response) => {
                this.isRequestRunning = false;
                this.speechUI.activateSpeechButton(true);
                this.loading.activateLoder(false);
                this.logger.info("GEMINI Points LENGTH: " + response.points.length);
                this.responseUI.openResponseBubble(response.aiMessage);
                // Update guidance panel step if AI detected one
                if (this.guidancePanel && response.detectedStep > 0) {
                    this.guidancePanel.setAutoStep(response.detectedStep);
                }
                for (let i = 0; i < response.points.length; i++) {
                    const pointObj = response.points[i];
                    if (this.showDebugVisuals) {
                        this.debugVisualizer.visualizeLocalPoint(pointObj.pixelPos, cameraFrame);
                    }
                    const worldPosition = this.depthCache.getWorldPositionWithID(pointObj.pixelPos, depthFrameID);
                    if (worldPosition != null) {
                        this.responseUI.loadWorldLabel(pointObj.label, worldPosition, pointObj.showArrow);
                    }
                }
                this.depthCache.disposeDepthFrame(depthFrameID);
            });
        }
    };
    __setFunctionName(_classThis, "SceneController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _onStart_decorators = [decorators_1.bindStartEvent];
        __esDecorate(_classThis, null, _onStart_decorators, { kind: "method", name: "onStart", static: false, private: false, access: { has: obj => "onStart" in obj, get: obj => obj.onStart }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SceneController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SceneController = _classThis;
})();
exports.SceneController = SceneController;
//# sourceMappingURL=SceneController.js.map