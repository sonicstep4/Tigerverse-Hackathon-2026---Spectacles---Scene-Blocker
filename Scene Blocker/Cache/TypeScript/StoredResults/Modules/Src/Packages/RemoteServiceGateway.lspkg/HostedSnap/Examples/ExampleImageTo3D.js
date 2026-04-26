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
exports.ExampleSnap3DImageTo3D = void 0;
var __selfType = requireType("./ExampleImageTo3D");
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
 * Example implementation of Snap3D text-to-3D generation with texture display. Demonstrates
 * submitting prompts for 3D generation while displaying a reference texture from the editor.
 * This example shows how to handle generation progress and instantiate 3D mesh assets.
 */
const Snap3D_1 = require("RemoteServiceGateway.lspkg/HostedSnap/Snap3D");
let ExampleSnap3DImageTo3D = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var ExampleSnap3DImageTo3D = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.sourceTexture = this.sourceTexture;
            this.prompt = this.prompt;
            this.refineMesh = this.refineMesh;
            this.useVertexColor = this.useVertexColor;
            this.sourceImage = this.sourceImage;
            this.baseMeshRoot = this.baseMeshRoot;
            this.refinedMeshRoot = this.refinedMeshRoot;
            this.modelMat = this.modelMat;
            this.hintText = this.hintText;
            this.runOnTap = this.runOnTap;
            this.baseMeshSceneObject = null;
            this.refinedMeshSceneObject = null;
            this.isRequestInProgress = false;
            this.gestureModule = require("LensStudio:GestureModule");
        }
        __initialize() {
            super.__initialize();
            this.sourceTexture = this.sourceTexture;
            this.prompt = this.prompt;
            this.refineMesh = this.refineMesh;
            this.useVertexColor = this.useVertexColor;
            this.sourceImage = this.sourceImage;
            this.baseMeshRoot = this.baseMeshRoot;
            this.refinedMeshRoot = this.refinedMeshRoot;
            this.modelMat = this.modelMat;
            this.hintText = this.hintText;
            this.runOnTap = this.runOnTap;
            this.baseMeshSceneObject = null;
            this.refinedMeshSceneObject = null;
            this.isRequestInProgress = false;
            this.gestureModule = require("LensStudio:GestureModule");
        }
        onAwake() {
            this.initializeSpinners();
            if (global.deviceInfoSystem.isEditor()) {
                this.createEvent("TapEvent").bind(() => {
                    this.onTap();
                });
            }
            else {
                this.gestureModule
                    .getPinchDownEvent(GestureModule.HandType.Right)
                    .add(() => {
                    this.onTap();
                });
            }
            this.hintText.text = "Tap or Pinch to generate 3D from prompt";
        }
        onTap() {
            if (!this.runOnTap) {
                return;
            }
            if (this.isRequestInProgress) {
                this.hintText.text = "Request already in progress...";
                return;
            }
            if (!this.sourceTexture || isNull(this.sourceTexture)) {
                this.hintText.text = "Please assign a source texture";
                return;
            }
            this.startImageTo3DGeneration();
        }
        /**
         * Starts the text-to-3D generation process using the provided prompt.
         * The source texture is displayed but not used for generation (package limitation).
         */
        startImageTo3DGeneration() {
            this.isRequestInProgress = true;
            this.resetAssets();
            this.hintText.text = "Generating 3D from prompt. Please wait...";
            this.enableSpinners(true);
            // Display the source texture
            this.sourceImage.mainPass.baseTex = this.sourceTexture;
            this.sourceImage.enabled = true;
            // Submit request for 3D generation (this version doesn't support direct image input)
            Snap3D_1.Snap3D.submitAndGetStatus({
                prompt: this.prompt,
                format: "glb",
                refine: this.refineMesh,
                use_vertex_color: this.useVertexColor,
            })
                .then((submitGetStatusResults) => {
                this.hintText.text = "Generating 3D model from image...";
                submitGetStatusResults.event.add(([artifactType, assetOrError]) => {
                    if (artifactType === "image") {
                        // Image already exists (we provided it), so this stage is skipped
                        // or confirms the image was received
                        print("Image artifact confirmed");
                    }
                    else if (artifactType === "base_mesh") {
                        this.generateBaseMeshAsset(assetOrError);
                        this.hintText.text = "Base mesh generated. Refining...";
                    }
                    else if (artifactType === "refined_mesh") {
                        this.generateRefinedMeshAsset(assetOrError);
                        this.hintText.text =
                            "Generation complete! Tap or Pinch to generate again.";
                    }
                    else if (artifactType === "failed") {
                        this.handleError(assetOrError);
                    }
                });
            })
                .catch((error) => {
                this.handleError({
                    errorMsg: error,
                    errorCode: -1,
                });
            });
        }
        generateBaseMeshAsset(gltfAssetData) {
            this.baseMeshSceneObject = gltfAssetData.gltfAsset.tryInstantiate(this.baseMeshRoot, this.modelMat);
            this.baseMeshSpinner.enabled = false;
            print("Base mesh instantiated from: " + gltfAssetData.url);
        }
        generateRefinedMeshAsset(gltfAssetData) {
            this.refinedMeshSceneObject = gltfAssetData.gltfAsset.tryInstantiate(this.refinedMeshRoot, this.modelMat);
            this.refinedMeshSpinner.enabled = false;
            this.isRequestInProgress = false;
            print("Refined mesh instantiated from: " + gltfAssetData.url);
        }
        handleError(error) {
            this.enableSpinners(false);
            print("Generation failed: " +
                error.errorMsg +
                " (Code: " +
                error.errorCode +
                ")");
            this.hintText.text = "Generation failed. Tap or Pinch to try again.";
            this.isRequestInProgress = false;
        }
        resetAssets() {
            this.sourceImage.enabled = false;
            if (!isNull(this.baseMeshSceneObject)) {
                this.baseMeshSceneObject.destroy();
                this.baseMeshSceneObject = null;
            }
            if (!isNull(this.refinedMeshSceneObject)) {
                this.refinedMeshSceneObject.destroy();
                this.refinedMeshSceneObject = null;
            }
        }
        initializeSpinners() {
            this.baseMeshSpinner = this.baseMeshRoot.getChild(0);
            this.refinedMeshSpinner = this.refinedMeshRoot.getChild(0);
            this.enableSpinners(false);
        }
        enableSpinners(enable) {
            this.baseMeshSpinner.enabled = enable;
            this.refinedMeshSpinner.enabled = enable;
        }
    };
    __setFunctionName(_classThis, "ExampleSnap3DImageTo3D");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExampleSnap3DImageTo3D = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExampleSnap3DImageTo3D = _classThis;
})();
exports.ExampleSnap3DImageTo3D = ExampleSnap3DImageTo3D;
//# sourceMappingURL=ExampleImageTo3D.js.map