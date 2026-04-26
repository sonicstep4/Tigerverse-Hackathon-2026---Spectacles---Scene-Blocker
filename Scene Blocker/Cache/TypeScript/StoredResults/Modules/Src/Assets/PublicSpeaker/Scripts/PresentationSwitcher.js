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
exports.PresentationSwitcher = void 0;
var __selfType = requireType("./PresentationSwitcher");
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
let PresentationSwitcher = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var PresentationSwitcher = _classThis = class extends _classSuper {
        constructor() {
            super();
            // Optional parent object whose children will be used as slides
            this.parentObject = this.parentObject;
            this.loopStartIndex = this.loopStartIndex;
            // Track the currently active slide index
            this.currentIndex = 0;
            // Array to store references to all slide objects
            this.slides = [];
            this.slideChangedCallbacks = [];
        }
        __initialize() {
            super.__initialize();
            // Optional parent object whose children will be used as slides
            this.parentObject = this.parentObject;
            this.loopStartIndex = this.loopStartIndex;
            // Track the currently active slide index
            this.currentIndex = 0;
            // Array to store references to all slide objects
            this.slides = [];
            this.slideChangedCallbacks = [];
        }
        onAwake() {
            // If no parent object is specified, use the object this script is attached to
            if (!this.parentObject) {
                this.parentObject = this.getSceneObject();
            }
            // Collect all children of the parent object
            this.collectSlides();
            // Show only the first slide initially
            if (this.slides.length > 0) {
                this.showSlide(this.currentIndex);
            }
            else {
                print("PresentationSwitcher: No children found to use as slides.");
            }
        }
        // Collect all child objects of the parent
        collectSlides() {
            // Clear the array first
            this.slides = [];
            // Get all children
            const childCount = this.parentObject.getChildrenCount();
            print("PresentationSwitcher: Found " + childCount + " children.");
            for (let i = 0; i < childCount; i++) {
                const child = this.parentObject.getChild(i);
                this.slides.push(child);
            }
            // Initially hide all slides
            this.hideAllSlides();
        }
        // Hide all slides
        hideAllSlides() {
            for (const slide of this.slides) {
                slide.enabled = false;
            }
        }
        // Show only the specified slide
        showSlide(index) {
            // Make sure index is within bounds
            if (index >= 0 && index < this.slides.length) {
                // First hide all
                this.hideAllSlides();
                // Then show only the one at the index
                this.slides[index].enabled = true;
                this.currentIndex = index;
                print("PresentationSwitcher: Showing slide " + (index + 1) + " of " + this.slides.length);
                this.notifySlideChanged();
            }
        }
        notifySlideChanged() {
            const currentSlide = this.slides[this.currentIndex];
            for (let i = 0; i < this.slideChangedCallbacks.length; i++) {
                this.slideChangedCallbacks[i](this.currentIndex, currentSlide);
            }
        }
        // Public method to move to the next slide
        next() {
            if (this.slides.length === 0)
                return;
            let nextIndex = this.currentIndex + 1;
            // If we're at the end, wrap around to the first slide
            if (nextIndex >= this.slides.length) {
                const minLoop = Math.max(0, Math.min(this.loopStartIndex, this.slides.length - 1));
                nextIndex = minLoop;
            }
            this.showSlide(nextIndex);
        }
        // Public method to move to the previous slide
        previous() {
            if (this.slides.length === 0)
                return;
            let prevIndex = this.currentIndex - 1;
            const minLoop = Math.max(0, Math.min(this.loopStartIndex, this.slides.length - 1));
            // If we're at/before loop start, wrap around to the last slide
            if (prevIndex < minLoop) {
                prevIndex = this.slides.length - 1;
            }
            this.showSlide(prevIndex);
        }
        addOnSlideChanged(callback) {
            this.slideChangedCallbacks.push(callback);
        }
        goToIndex(index) {
            if (this.slides.length === 0)
                return;
            const clamped = Math.min(Math.max(index, 0), this.slides.length - 1);
            this.showSlide(clamped);
        }
        getCurrentIndex() {
            return this.currentIndex;
        }
        getSlideCount() {
            return this.slides.length;
        }
        // Returns the currently visible slide index by scanning enabled state.
        // This helps other systems stay in sync even when another controller toggles slides.
        getVisibleSlideIndex() {
            for (let i = 0; i < this.slides.length; i++) {
                if (this.slides[i].enabled) {
                    return i;
                }
            }
            return this.currentIndex;
        }
    };
    __setFunctionName(_classThis, "PresentationSwitcher");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PresentationSwitcher = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PresentationSwitcher = _classThis;
})();
exports.PresentationSwitcher = PresentationSwitcher;
//# sourceMappingURL=PresentationSwitcher.js.map