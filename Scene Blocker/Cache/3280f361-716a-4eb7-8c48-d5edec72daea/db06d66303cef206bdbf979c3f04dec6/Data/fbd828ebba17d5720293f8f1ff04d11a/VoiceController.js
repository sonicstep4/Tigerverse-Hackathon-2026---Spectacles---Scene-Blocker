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
            this.voiceMLModule = require("LensStudio:VoiceMLModule");
            this.lastTranscription = "";
            this.commandPending = false;
            this.commandTimer = 0;
            this.isListening = false; // Added to toggle listening state
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
            this.voiceMLModule = require("LensStudio:VoiceMLModule");
            this.lastTranscription = "";
            this.commandPending = false;
            this.commandTimer = 0;
            this.isListening = false; // Added to toggle listening state
        }
        onAwake() {
            // Bind the onStart event
            this.createEvent("OnStartEvent").bind(() => {
                this.onStart();
                log.d("OnStart event triggered");
            });
            // Bind the update event (for delay tracking)
            this.createEvent("UpdateEvent").bind(() => {
                this.update();
            });
            // Setup listening options
            this.listeningOptions = VoiceML.ListeningOptions.create();
            this.listeningOptions.speechRecognizer = VoiceMLModule.SpeechRecognizer.Default;
            this.listeningOptions.shouldReturnAsrTranscription = true;
            this.listeningOptions.shouldReturnInterimAsrTranscription = true;
            // Define the onListenUpdate callback
            this.onListenUpdate = (eventData) => {
                if (eventData.transcription.trim() === "") {
                    log.d("Transcription is empty");
                    return;
                }
                log.d(`Transcription: ${eventData.transcription}`);
                if (eventData.isFinalTranscription) {
                    log.d(`Final Transcription: "${eventData.transcription}"`);
                    if (this.isListening) {
                        // Only update text if listening is enabled
                        this.text.text = eventData.transcription;
                        this.handleTranscription(eventData.transcription);
                    }
                    else {
                        log.d("Listening is disabled - ignoring transcription");
                    }
                }
            };
            // Set the initial button icon to normal mic (listening off)
            if (this.buttonImage && this.normalMicImage) {
                this.buttonImage.mainMaterial.mainPass.baseTex = this.normalMicImage;
            }
            else {
                log.d("Button image or normal mic image not assigned in inspector");
            }
        }
        onStart() {
            // Setup VoiceMLModule callbacks
            this.voiceMLModule.onListeningEnabled.add(() => {
                log.d("Microphone permissions granted - starting listening");
                this.voiceMLModule.startListening(this.listeningOptions);
                this.eventRegistration = this.voiceMLModule.onListeningUpdate.add(this.onListenUpdate);
            });
            this.voiceMLModule.onListeningDisabled.add(() => {
                this.voiceMLModule.stopListening();
                if (this.eventRegistration) {
                    this.voiceMLModule.onListeningUpdate.remove(this.eventRegistration);
                    this.eventRegistration = null;
                }
                log.d("Listening stopped due to permissions being revoked");
                // Reset the button icon and state when permissions are revoked
                this.isListening = false;
                if (this.buttonImage && this.normalMicImage) {
                    this.buttonImage.mainMaterial.mainPass.baseTex = this.normalMicImage;
                }
            });
            this.voiceMLModule.onListeningError.add((eventErrorArgs) => {
                log.d(`Listening Error: ${eventErrorArgs.error}, Description: ${eventErrorArgs.description}`);
            });
        }
        // Public method to toggle listening
        toggleListening() {
            this.isListening = !this.isListening;
            if (this.isListening) {
                log.d("Listening toggled ON");
                if (this.buttonImage && this.listeningMicImage) {
                    this.buttonImage.mainMaterial.mainPass.baseTex = this.listeningMicImage;
                }
            }
            else {
                log.d("Listening toggled OFF");
                if (this.buttonImage && this.normalMicImage) {
                    this.buttonImage.mainMaterial.mainPass.baseTex = this.normalMicImage;
                }
                this.text.text = ""; // Clear the text feedback when listening is disabled
                this.commandPending = false; // Reset any pending commands
                this.lastTranscription = "";
            }
        }
        // Handle the transcription directly
        handleTranscription(transcription) {
            // Normalize the transcription for comparison
            const normalizedText = transcription.trim().toLowerCase();
            // Check for valid commands
            if (normalizedText === "next" || normalizedText === "next.") {
                log.d("Detected 'next' command - starting delay");
                this.lastTranscription = normalizedText;
                this.commandPending = true;
                this.commandTimer = 0;
            }
            else if (normalizedText === "previous" ||
                normalizedText === "previous." ||
                normalizedText === "go back" ||
                normalizedText === "go back.") {
                log.d("Detected 'previous' or 'go back' command - starting delay");
                this.lastTranscription = normalizedText;
                this.commandPending = true;
                this.commandTimer = 0;
            }
            else {
                log.d(`Transcription "${transcription}" does not match any commands`);
                this.commandPending = false; // Reset if the transcription doesn't match
            }
        }
        // Update method to handle the delay
        update() {
            if (!this.commandPending)
                return;
            this.commandTimer += getDeltaTime();
            log.d(`Command delay timer: ${this.commandTimer.toFixed(2)} seconds`);
            if (this.commandTimer >= this.commandDelay) {
                // Check if the text is still the same after the delay
                const currentText = this.text.text.trim().toLowerCase();
                if (currentText === this.lastTranscription) {
                    log.d(`Command "${this.lastTranscription}" confirmed after delay`);
                    if (this.isListening) {
                        // Only execute if listening is enabled
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
                    else {
                        log.d("Listening is disabled - ignoring command execution");
                    }
                }
                else {
                    log.d(`Command "${this.lastTranscription}" changed to "${currentText}" during delay - ignoring`);
                }
                this.commandPending = false;
                this.lastTranscription = "";
            }
        }
        // Navigate to the next slide and synchronize across all platforms
        navigateToNext() {
            // Update local presentation
            if (this.presentationSwitcher && !this.useGoogleSlide) {
                this.presentationSwitcher.next();
            }
            // Update Google Slides via direct API
            if (this.googleSlideBridge && this.useGoogleSlide) {
                this.googleSlideBridge.next();
            }
            log.d("Going to next slide");
        }
        // Navigate to the previous slide and synchronize across all platforms
        navigateToPrevious() {
            // Update local presentation
            if (this.presentationSwitcher && !this.useGoogleSlide) {
                this.presentationSwitcher.previous();
            }
            // Update Google Slides via direct API
            if (this.googleSlideBridge && this.useGoogleSlide) {
                this.googleSlideBridge.previous();
            }
            log.d("Going to previous slide");
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