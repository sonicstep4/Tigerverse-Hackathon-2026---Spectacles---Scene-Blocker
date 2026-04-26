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
exports.GeminiAPI = void 0;
var __selfType = requireType("./GeminiAPI");
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
/**
 * Specs Inc. 2026
 * Gemini API component for the Depth Cache Spectacles lens.
 */
const Gemini_1 = require("RemoteServiceGateway.lspkg/HostedExternal/Gemini");
const Logger_1 = require("Utilities.lspkg/Scripts/Utils/Logger");
const NespressoKnowledge_1 = require("./NespressoKnowledge");
const GEMINI_MODEL = "gemini-2.5-pro";
const SYSTEM_MESSAGE = "You are an AI assistant inside augmented reality glasses, helping the user with tasks including Nespresso VertuoLine maintenance.\n" +
    (0, NespressoKnowledge_1.buildSystemPromptContext)() +
    NespressoKnowledge_1.AI_RESPONSE_POLICY +
    "\nReturn bounding boxes as a JSON array with labels. " +
    "Your answer must be a JSON object with these keys: 'message', 'data', and 'currentStep'.\n" +
    "  'message': a short, helpful response (max 175 characters).\n" +
    "  'data': array of bounding box objects (label + coordinates). " +
    "    Set showArrow to true most of the time, especially for task steps.\n" +
    "  'currentStep': integer 1–15 if you detect the user is performing a specific Nespresso descaling step, otherwise 0.\n" +
    "    Detect the step from the camera view AND the user's question together.\n" +
    "Never return masks or code fencing. Limit to 25 objects. " +
    "Don't label anything over 20 feet away. Don't duplicate labels. " +
    "For how-to tasks you may label Step #1, Step #2, etc. on relevant objects.\n";
let GeminiAPI = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var GeminiAPI = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
        }
        __initialize() {
            super.__initialize();
            this.enableLogging = this.enableLogging;
            this.enableLoggingLifecycle = this.enableLoggingLifecycle;
        }
        onAwake() {
            this.logger = new Logger_1.Logger("GeminiAPI", this.enableLogging || this.enableLoggingLifecycle, true);
            if (this.enableLoggingLifecycle)
                this.logger.debug("LIFECYCLE: onAwake()");
        }
        makeGeminiRequest(texture, userQuery, callback) {
            Base64.encodeTextureAsync(texture, (base64String) => {
                this.logger.info("Making image request...");
                this.sendGeminiChat(userQuery, base64String, texture, callback);
            }, () => {
                this.logger.error("Image encoding failed!");
            }, CompressionQuality.HighQuality, EncodingType.Png);
        }
        sendGeminiChat(request, image64, texture, callback) {
            const respSchema = {
                type: "object",
                properties: {
                    message: { type: "string" },
                    currentStep: { type: "number" },
                    data: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                boundingBox: {
                                    type: "array",
                                    items: { type: "number" }
                                },
                                label: { type: "string" },
                                useArrow: { type: "boolean" }
                            },
                            required: ["boundingBox", "label", "useArrow"]
                        }
                    }
                },
                required: ["message", "currentStep", "data"]
            };
            const reqObj = {
                model: GEMINI_MODEL,
                type: "generateContent",
                body: {
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    inlineData: {
                                        mimeType: "image/png",
                                        data: image64
                                    }
                                },
                                {
                                    text: request
                                }
                            ]
                        }
                    ],
                    systemInstruction: {
                        parts: [
                            {
                                text: SYSTEM_MESSAGE
                            }
                        ]
                    },
                    generationConfig: {
                        temperature: 0.5,
                        responseMimeType: "application/json",
                        response_schema: respSchema
                    }
                }
            };
            this.logger.debug(JSON.stringify(reqObj.body));
            Gemini_1.Gemini.models(reqObj)
                .then((response) => {
                const responseObj = JSON.parse(response.candidates[0].content.parts[0].text);
                this.onGeminiResponse(responseObj, texture, callback);
            })
                .catch((error) => {
                this.logger.error("Gemini error: " + error);
                if (callback != null) {
                    callback({
                        points: [],
                        lines: [],
                        aiMessage: "reponse error..."
                    });
                }
            });
        }
        onGeminiResponse(responseObj, texture, callback) {
            const geminiResult = {
                points: [],
                aiMessage: "no response",
                detectedStep: 0
            };
            this.logger.info("GEMINI RESPONSE: " + responseObj.message);
            geminiResult.aiMessage = responseObj.message;
            geminiResult.detectedStep = typeof responseObj.currentStep === "number" ? responseObj.currentStep : 0;
            if (geminiResult.detectedStep > 0) {
                this.logger.info("DETECTED STEP: " + geminiResult.detectedStep);
            }
            try {
                const data = responseObj.data;
                this.logger.debug("Data: " + JSON.stringify(data));
                this.logger.info("POINT LENGTH: " + data.length);
                for (let i = 0; i < data.length; i++) {
                    const centerPoint = this.boundingBoxToPixels(data[i].boundingBox, texture.getWidth(), texture.getHeight());
                    const lensStudioPoint = {
                        pixelPos: centerPoint,
                        label: data[i].label,
                        showArrow: data[i].useArrow
                    };
                    geminiResult.points.push(lensStudioPoint);
                }
            }
            catch (error) {
                this.logger.error("Error parsing points!: " + error);
            }
            if (callback != null) {
                callback(geminiResult);
            }
        }
        boundingBoxToPixels(boxPoints, width, height) {
            const x1 = MathUtils.remap(boxPoints[1], 0, 1000, 0, width);
            const y1 = MathUtils.remap(boxPoints[0], 0, 1000, height, 0);
            const topLeft = new vec2(x1, height - y1);
            const x2 = MathUtils.remap(boxPoints[3], 0, 1000, 0, width);
            const y2 = MathUtils.remap(boxPoints[2], 0, 1000, height, 0);
            const bottomRight = new vec2(x2, height - y2);
            const center = topLeft.add(bottomRight).uniformScale(0.5);
            return center;
        }
    };
    __setFunctionName(_classThis, "GeminiAPI");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GeminiAPI = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GeminiAPI = _classThis;
})();
exports.GeminiAPI = GeminiAPI;
//# sourceMappingURL=GeminiAPI.js.map