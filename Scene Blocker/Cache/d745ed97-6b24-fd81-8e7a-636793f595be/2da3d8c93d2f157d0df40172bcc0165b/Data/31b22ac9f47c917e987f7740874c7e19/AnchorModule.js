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
exports.AnchorModule = void 0;
var __selfType = requireType("./AnchorModule");
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
 * ## Anchors
 * Define and track poses in world space.
 */
const SpatialPersistence_1 = require("./SpatialPersistence/SpatialPersistence");
const AnchorSession_1 = require("./AnchorSession");
/**
 * Create, scan for, save and delete Anchors.
 */
let AnchorModule = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var AnchorModule = _classThis = class extends _classSuper {
        constructor() {
            super();
            /**
             * Storage context for anchors.
             */
            this.cloudStorage = this.cloudStorage;
            // temporary
            this.debug = this.debug;
            this._version = "v0.0.8";
        }
        __initialize() {
            super.__initialize();
            /**
             * Storage context for anchors.
             */
            this.cloudStorage = this.cloudStorage;
            // temporary
            this.debug = this.debug;
            this._version = "v0.0.8";
        }
        /**
         * Open a session for scanning for anchors in the area.
         */
        async openSession(options) {
            await this._haveInitialized;
            if (this._session) {
                throw new Error("Only one session may be active at a time.");
            }
            this._spatialPersistence.selectArea(null);
            print("Spatial Anchor version: " + this._version);
            this._session = new AnchorSession_1.AnchorSession(options, this._spatialPersistence, async (session) => {
                await this.onClosed(session);
            });
            return this._session;
        }
        // implementation details
        onAwake() {
            this._spatialPersistence =
                AnchorModule.theSpatialPersistenceFactory !== undefined
                    ? AnchorModule.theSpatialPersistenceFactory()
                    : new SpatialPersistence_1.SpatialPersistence(20, // mappingInterval
                    0.5, // resetDelayInS
                    this.debug, true, // incrementalMapping
                    false, // enableLoggingPoseSettling
                    this.cloudStorage);
            this._spatialPersistence.awake(this.sceneObject, this);
        }
        async onClosed(session) {
            return await new Promise((resolve, reject) => {
                let registration = this._spatialPersistence.onAreaDeactivated.add((areaDeactivatedEvent) => {
                    this._spatialPersistence.onAreaDeactivated.remove(registration);
                    resolve();
                });
                this._spatialPersistence.selectArea(null);
                this._session = undefined;
            });
        }
        get _haveInitialized() {
            if (!this._initialized) {
                const waitForInitialization = async () => {
                    await this._spatialPersistence.initialize();
                };
                this._initialized = waitForInitialization();
            }
            return this._initialized;
        }
    };
    __setFunctionName(_classThis, "AnchorModule");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnchorModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnchorModule = _classThis;
})();
exports.AnchorModule = AnchorModule;
//# sourceMappingURL=AnchorModule.js.map