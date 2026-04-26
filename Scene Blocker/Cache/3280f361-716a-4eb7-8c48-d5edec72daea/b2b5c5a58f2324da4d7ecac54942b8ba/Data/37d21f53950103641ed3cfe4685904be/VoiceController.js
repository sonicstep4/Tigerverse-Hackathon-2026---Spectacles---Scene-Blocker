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
            this.autoStartListening = this.autoStartListening;
            this.firstContentSlideIndex = this.firstContentSlideIndex;
            this.startPhrase = this.startPhrase;
            this.stageCalibrationController = this.stageCalibrationController;
            this.lineAdvanceSfx = this.lineAdvanceSfx;
            this.asr = require("LensStudio:AsrModule");
            this.options = null;
            this.lastTranscription = "";
            this.commandPending = false;
            this.commandTimer = 0;
            this.isListening = false;
            // Trigger phrases keyed by 0-based slide index.
            this.slideAdvancePhrases = {
                0: ["expecting you", "wasnt expecting you", "not expecting you"],
                1: ["coming along", "deal coming along", "is the deal coming along"],
                2: ["the resources", "have the resources", "dont have the resources", "do not have the resources"],
                3: ["drag me down", "wont let you drag me down", "will not let you drag me down"],
                4: ["best of them", "youre the best of them", "you are the best of them", "make it up to me"],
                5: ["see ya", "see you", "see yaa", "see you later"]
            };
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
            this.autoStartListening = this.autoStartListening;
            this.firstContentSlideIndex = this.firstContentSlideIndex;
            this.startPhrase = this.startPhrase;
            this.stageCalibrationController = this.stageCalibrationController;
            this.lineAdvanceSfx = this.lineAdvanceSfx;
            this.asr = require("LensStudio:AsrModule");
            this.options = null;
            this.lastTranscription = "";
            this.commandPending = false;
            this.commandTimer = 0;
            this.isListening = false;
            // Trigger phrases keyed by 0-based slide index.
            this.slideAdvancePhrases = {
                0: ["expecting you", "wasnt expecting you", "not expecting you"],
                1: ["coming along", "deal coming along", "is the deal coming along"],
                2: ["the resources", "have the resources", "dont have the resources", "do not have the resources"],
                3: ["drag me down", "wont let you drag me down", "will not let you drag me down"],
                4: ["best of them", "youre the best of them", "you are the best of them", "make it up to me"],
                5: ["see ya", "see you", "see yaa", "see you later"]
            };
        }
        onAwake() {
            // Bind the update event (for delay tracking)
            this.createEvent("UpdateEvent").bind(() => {
                this.update();
            });
            // Setup ASR options
            this.options = AsrModule.AsrTranscriptionOptions.create();
            this.options.mode = AsrModule.AsrMode.HighAccuracy;
            this.options.silenceUntilTerminationMs = 1000;
            this.options.onTranscriptionUpdateEvent.add((args) => {
                if (args.text.trim() === "") {
                    return;
                }
                log.d(`Transcription: ${args.text}`);
                this.text.text = args.text;
                if (args.isFinal) {
                    log.d(`Final Transcription: "${args.text}"`);
                    if (this.isListening) {
                        this.handleTranscription(args.text);
                    }
                    else {
                        log.d("Listening is disabled - ignoring transcription");
                    }
                }
            });
            this.options.onTranscriptionErrorEvent.add((errorCode) => {
                log.d(`ASR Error: ${errorCode}`);
                if (this.text) {
                    this.text.text = `ASR Error: ${errorCode}`;
                }
            });
            // Set the initial button icon to normal mic (listening off)
            if (this.buttonImage && this.normalMicImage) {
                this.buttonImage.mainMaterial.mainPass.baseTex = this.normalMicImage;
            }
            else {
                log.d("Button image or normal mic image not assigned in inspector");
            }
            if (this.autoStartListening) {
                this.setListening(true);
            }
            else if (this.text) {
                this.text.text = "Mic Off";
            }
        }
        // Public method to toggle listening
        toggleListening() {
            this.setListening(!this.isListening);
        }
        setListening(shouldListen) {
            if (this.isListening === shouldListen) {
                return;
            }
            this.isListening = shouldListen;
            if (shouldListen) {
                log.d("Listening toggled ON");
                this.asr.startTranscribing(this.options);
                if (this.text) {
                    this.text.text = "Listening...";
                }
                if (this.buttonImage && this.listeningMicImage) {
                    this.buttonImage.mainMaterial.mainPass.baseTex = this.listeningMicImage;
                }
            }
            else {
                log.d("Listening toggled OFF");
                this.asr.stopTranscribing();
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
            const normalizedText = transcription
                .trim()
                .toLowerCase()
                .replace(/[.,!?]/g, "");
            const currentSlideIndex = this.presentationSwitcher
                ? this.presentationSwitcher.getVisibleSlideIndex()
                : 0;
            // Intro/start slide: wait for explicit "start" phrase to calibrate and begin.
            if (currentSlideIndex < this.firstContentSlideIndex) {
                const normalizedStart = this.startPhrase.trim().toLowerCase().replace(/[.,!?]/g, "");
                if (normalizedText === normalizedStart ||
                    normalizedText.includes(" " + normalizedStart) ||
                    normalizedText.startsWith(normalizedStart + " ")) {
                    log.d(`Detected start phrase "${normalizedStart}" on intro slide`);
                    if (this.stageCalibrationController) {
                        this.stageCalibrationController.calibrateNow();
                    }
                    this.lastTranscription = "next";
                    this.commandPending = true;
                    this.commandTimer = 0;
                }
                else {
                    this.commandPending = false;
                }
                return;
            }
            const contentSlideIndex = currentSlideIndex - this.firstContentSlideIndex;
            const triggerPhrases = this.slideAdvancePhrases[contentSlideIndex] || [];
            let matchedPhrase = "";
            for (let i = 0; i < triggerPhrases.length; i++) {
                const phrase = triggerPhrases[i];
                if (normalizedText.includes(phrase)) {
                    matchedPhrase = phrase;
                    break;
                }
            }
            if (matchedPhrase !== "") {
                log.d(`Detected advance phrase "${matchedPhrase}" on slide ${currentSlideIndex + 1}`);
                this.lastTranscription = "next";
                this.commandPending = true;
                this.commandTimer = 0;
            }
            else {
                log.d(`Transcription "${transcription}" did not match slide ${currentSlideIndex + 1} trigger phrase(s)`);
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
                log.d(`Command "${this.lastTranscription}" confirmed after delay`);
                if (this.isListening) {
                    // Only execute if listening is enabled
                    if (this.lastTranscription === "next") {
                        this.navigateToNext();
                    }
                    else if (this.lastTranscription === "previous") {
                        this.navigateToPrevious();
                    }
                }
                else {
                    log.d("Listening is disabled - ignoring command execution");
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
            this.playLineAdvanceSfx();
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
        playLineAdvanceSfx() {
            if (!this.lineAdvanceSfx) {
                return;
            }
            const sfx = this.lineAdvanceSfx;
            try {
                if (typeof sfx.stop === "function") {
                    sfx.stop(false);
                }
                if (typeof sfx.play === "function") {
                    // `1` = play once.
                    sfx.play(1);
                }
            }
            catch (error) {
                log.d(`Line advance SFX failed to play: ${error}`);
            }
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