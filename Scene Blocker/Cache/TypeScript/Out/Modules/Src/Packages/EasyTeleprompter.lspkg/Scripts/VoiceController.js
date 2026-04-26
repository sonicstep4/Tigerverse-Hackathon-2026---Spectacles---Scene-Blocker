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
exports.SpeechToText = void 0;
var __selfType = requireType("./VoiceController");
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
const NativeLogger_1 = require("SpectaclesInteractionKit.lspkg/Utils/NativeLogger");
const log = new NativeLogger_1.default("SpeechToText");
let SpeechToText = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var SpeechToText = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.text = this.text;
            this.presentationSwitcher = this.presentationSwitcher;
            this.googleSlideBridge = this.googleSlideBridge;
            this.commandDelay = this.commandDelay;
            this.buttonImage = this.buttonImage;
            this.normalMicImage = this.normalMicImage;
            this.listeningMicImage = this.listeningMicImage;
            this.useGoogleSlide = this.useGoogleSlide;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.asr = require("LensStudio:AsrModule");
            this.options = null;
            this.isListening = false;
            this.lastTranscription = "";
            this.commandPending = false;
            this.commandTimer = 0;
        }
        __initialize() {
            super.__initialize();
            this.text = this.text;
            this.presentationSwitcher = this.presentationSwitcher;
            this.googleSlideBridge = this.googleSlideBridge;
            this.commandDelay = this.commandDelay;
            this.buttonImage = this.buttonImage;
            this.normalMicImage = this.normalMicImage;
            this.listeningMicImage = this.listeningMicImage;
            this.useGoogleSlide = this.useGoogleSlide;
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
            this.asr = require("LensStudio:AsrModule");
            this.options = null;
            this.isListening = false;
            this.lastTranscription = "";
            this.commandPending = false;
            this.commandTimer = 0;
        }
        onAwake() {
            this.logger = new Logger_1.Logger("SpeechToText", this.enableLogging || this.enableLoggingLifecycle, true);
            if (this.enableLoggingLifecycle) {
                this.logger.debug("LIFECYCLE: onAwake() - Component initializing");
            }
            this.logger.debug("SpeechToText onAwake called");
            this.logger.debug(`Device: ${global.deviceInfoSystem.isSpectacles() ? "Spectacles" : "Editor"}`);
            // Create ASR options once (following working Depth Cache pattern)
            this.options = AsrModule.AsrTranscriptionOptions.create();
            this.options.silenceUntilTerminationMs = 1000;
            this.options.mode = AsrModule.AsrMode.HighAccuracy;
            // Register transcription update callback
            this.options.onTranscriptionUpdateEvent.add((args) => {
                this.logger.debug(`Transcription: ${args.text}, isFinal: ${args.isFinal}`);
                if (args.text.trim() === "") {
                    this.logger.debug("Empty transcription, skipping");
                    return;
                }
                // Update text display
                this.text.text = args.text;
                // Process final transcriptions
                if (args.isFinal) {
                    this.logger.debug(`Final: ${args.text}`);
                    if (this.isListening) {
                        this.handleTranscription(args.text);
                    }
                    else {
                        this.logger.debug("Listening disabled, ignoring");
                    }
                }
            });
            // Register error callback
            this.options.onTranscriptionErrorEvent.add((errorCode) => {
                this.logger.error(`ASR Error: ${errorCode}`);
            });
            // Bind update event for command delay
            this.createEvent("UpdateEvent").bind(() => {
                this.update();
            });
            // Set initial button icon
            if (this.buttonImage && this.normalMicImage) {
                this.buttonImage.mainMaterial.mainPass.baseTex = this.normalMicImage;
                this.logger.debug("Button icon set to normal");
            }
            else {
                this.logger.warn("Button image or normal mic image not assigned");
            }
            this.logger.debug("SpeechToText initialized successfully");
        }
        // Public method to toggle listening
        toggleListening() {
            this.logger.debug("toggleListening() called");
            this.isListening = !this.isListening;
            if (this.isListening) {
                this.logger.debug("Starting ASR transcription...");
                this.asr.startTranscribing(this.options);
                this.logger.debug("ASR started");
                if (this.buttonImage && this.listeningMicImage) {
                    this.buttonImage.mainMaterial.mainPass.baseTex = this.listeningMicImage;
                    this.logger.debug("Button icon changed to listening");
                }
            }
            else {
                this.logger.debug("Stopping ASR transcription...");
                this.asr.stopTranscribing();
                this.logger.debug("ASR stopped");
                if (this.buttonImage && this.normalMicImage) {
                    this.buttonImage.mainMaterial.mainPass.baseTex = this.normalMicImage;
                    this.logger.debug("Button icon changed to normal");
                }
                this.text.text = "";
                this.commandPending = false;
                this.lastTranscription = "";
            }
        }
        handleTranscription(transcription) {
            const normalizedText = transcription.trim().toLowerCase();
            if (normalizedText === "next" || normalizedText === "next.") {
                this.logger.debug("Detected 'next' command - starting delay");
                this.lastTranscription = normalizedText;
                this.commandPending = true;
                this.commandTimer = 0;
            }
            else if (normalizedText === "previous" ||
                normalizedText === "previous." ||
                normalizedText === "go back" ||
                normalizedText === "go back.") {
                this.logger.debug("Detected 'previous' command - starting delay");
                this.lastTranscription = normalizedText;
                this.commandPending = true;
                this.commandTimer = 0;
            }
            else {
                this.logger.debug(`No command match for: "${transcription}"`);
                this.commandPending = false;
            }
        }
        update() {
            if (!this.commandPending)
                return;
            this.commandTimer += getDeltaTime();
            this.logger.debug(`Command timer: ${this.commandTimer.toFixed(2)}s`);
            if (this.commandTimer >= this.commandDelay) {
                const currentText = this.text.text.trim().toLowerCase();
                if (currentText === this.lastTranscription) {
                    this.logger.debug(`Command "${this.lastTranscription}" confirmed after delay`);
                    if (this.isListening) {
                        if (this.lastTranscription === "next" || this.lastTranscription === "next.") {
                            this.navigateToNext();
                        }
                        else if (this.lastTranscription === "previous" ||
                            this.lastTranscription === "go back" ||
                            this.lastTranscription === "previous." ||
                            this.lastTranscription === "go back.") {
                            this.navigateToPrevious();
                        }
                    }
                }
                else {
                    this.logger.debug(`Command changed from "${this.lastTranscription}" to "${currentText}" - ignoring`);
                }
                this.commandPending = false;
                this.lastTranscription = "";
            }
        }
        navigateToNext() {
            if (this.presentationSwitcher && !this.useGoogleSlide) {
                this.presentationSwitcher.next();
            }
            if (this.googleSlideBridge && this.useGoogleSlide) {
                this.googleSlideBridge.next();
            }
            this.logger.debug("Going to next slide");
        }
        navigateToPrevious() {
            if (this.presentationSwitcher && !this.useGoogleSlide) {
                this.presentationSwitcher.previous();
            }
            if (this.googleSlideBridge && this.useGoogleSlide) {
                this.googleSlideBridge.previous();
            }
            this.logger.debug("Going to previous slide");
        }
    };
    __setFunctionName(_classThis, "SpeechToText");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SpeechToText = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SpeechToText = _classThis;
})();
exports.SpeechToText = SpeechToText;
//# sourceMappingURL=VoiceController.js.map