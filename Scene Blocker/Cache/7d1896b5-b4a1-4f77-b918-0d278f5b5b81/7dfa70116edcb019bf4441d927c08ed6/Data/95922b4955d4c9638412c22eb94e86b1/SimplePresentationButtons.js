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
exports.SimplePresentationButtons = void 0;
var __selfType = requireType("./SimplePresentationButtons");
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
let SimplePresentationButtons = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var SimplePresentationButtons = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.presentationSwitcher = this.presentationSwitcher;
            this.nextButton = this.nextButton;
            this.previousButton = this.previousButton;
            this.statusText = this.statusText;
            this.micToggleButton = this.micToggleButton;
            this.speechController = this.speechController;
        }
        __initialize() {
            super.__initialize();
            this.presentationSwitcher = this.presentationSwitcher;
            this.nextButton = this.nextButton;
            this.previousButton = this.previousButton;
            this.statusText = this.statusText;
            this.micToggleButton = this.micToggleButton;
            this.speechController = this.speechController;
        }
        onAwake() {
            this.createEvent("OnStartEvent").bind(() => this.onStart());
        }
        onStart() {
            if (!this.presentationSwitcher) {
                print("SimplePresentationButtons: presentationSwitcher is not assigned.");
                return;
            }
            if (this.nextButton) {
                this.nextButton.onButtonPinched.add(() => {
                    this.presentationSwitcher.next();
                    this.updateStatus("Next");
                });
            }
            else {
                print("SimplePresentationButtons: nextButton not assigned.");
            }
            if (this.previousButton) {
                this.previousButton.onButtonPinched.add(() => {
                    this.presentationSwitcher.previous();
                    this.updateStatus("Previous");
                });
            }
            else {
                print("SimplePresentationButtons: previousButton not assigned.");
            }
            if (this.micToggleButton && this.speechController) {
                this.micToggleButton.onButtonPinched.add(() => {
                    this.speechController.toggleListening();
                    this.updateStatus("Mic Toggled");
                });
            }
            else if (this.micToggleButton && !this.speechController) {
                print("SimplePresentationButtons: micToggleButton assigned but speechController is missing.");
            }
            this.updateStatus("Ready");
        }
        updateStatus(action) {
            if (!this.statusText || !this.presentationSwitcher) {
                return;
            }
            const current = this.presentationSwitcher.getCurrentIndex() + 1;
            const total = this.presentationSwitcher.getSlideCount();
            this.statusText.text = action + " | Slide " + current + " / " + total;
        }
    };
    __setFunctionName(_classThis, "SimplePresentationButtons");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SimplePresentationButtons = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SimplePresentationButtons = _classThis;
})();
exports.SimplePresentationButtons = SimplePresentationButtons;
//# sourceMappingURL=SimplePresentationButtons.js.map