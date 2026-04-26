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
exports.GoogleSlideBridge = void 0;
var __selfType = requireType("./GoogleSlideBridge");
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
const log = new NativeLogger_1.default("GoogleSlidesBridge");
let GoogleSlideBridge = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var GoogleSlideBridge = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.internetModule = require("LensStudio:InternetModule");
            this.remoteServiceModule = require("LensStudio:RemoteServiceModule");
            this.remoteMediaModule = require("LensStudio:RemoteMediaModule");
            this.presentationId = this.presentationId;
            this.accessToken = this.accessToken;
            this.slideImage = this.slideImage;
            this.speakerNotes = this.speakerNotes;
            this.syncNavigationToGoogle = this.syncNavigationToGoogle;
            this.pollForChanges = this.pollForChanges;
            this.pollingInterval = this.pollingInterval;
            this.webSocketController = this.webSocketController;
            // Internal state tracking
            this.currentSlideIndex = 0;
            this.slideCount = 0;
            this.slides = [];
            this.lastPollTime = 0;
            this.isInitialized = false;
            this.hasValidCredentials = false;
        }
        __initialize() {
            super.__initialize();
            this.internetModule = require("LensStudio:InternetModule");
            this.remoteServiceModule = require("LensStudio:RemoteServiceModule");
            this.remoteMediaModule = require("LensStudio:RemoteMediaModule");
            this.presentationId = this.presentationId;
            this.accessToken = this.accessToken;
            this.slideImage = this.slideImage;
            this.speakerNotes = this.speakerNotes;
            this.syncNavigationToGoogle = this.syncNavigationToGoogle;
            this.pollForChanges = this.pollForChanges;
            this.pollingInterval = this.pollingInterval;
            this.webSocketController = this.webSocketController;
            // Internal state tracking
            this.currentSlideIndex = 0;
            this.slideCount = 0;
            this.slides = [];
            this.lastPollTime = 0;
            this.isInitialized = false;
            this.hasValidCredentials = false;
        }
        async onAwake() {
            if (this.presentationId === "" || this.accessToken === "") {
                log.w("Token and id fields are incorrect or empty. Please set it in the inspector.");
                return;
            }
            // Create event bindings
            this.createEvent("UpdateEvent").bind(() => this.update());
            this.createEvent("OnStartEvent").bind(() => this.initialize());
            // Set up callback for when local presentation changes
            this.presentationChangeCallback = () => {
                // When local presentation changes, sync to Google if enabled
                if (this.syncNavigationToGoogle && this.hasValidCredentials) {
                    // TODO: Implement sync to Google slides
                }
            };
            if (!this.internetModule) {
                log.e("Internet Module is not available.");
                return;
            }
            const url = `https://slides.googleapis.com/v1/presentations/${this.presentationId}?fields=title`;
            const accessToken = this.accessToken;
            try {
                const response = await this.internetModule.fetch(url, {
                    headers: {
                        Authorization: accessToken,
                        Accept: "application/json"
                    }
                });
                if (response.status === 200) {
                    const data = await response.json();
                    log.d(`Fetch successful: ${JSON.stringify(data)}`);
                }
                else {
                    log.w(`Fetch failed with status: ${response.status}`);
                }
            }
            catch (error) {
                log.e(`Error during fetch: ${error}`);
            }
            log.d(`Internet Module available: ${!!this.internetModule}`);
            log.d(`Internet Module available: ${!!this.remoteMediaModule}`);
            if (!global.deviceInfoSystem.isInternetAvailable()) {
                log.e("Internet is not available. Cannot proceed with API requests.");
                return;
            }
        }
        initialize() {
            if (!this.accessToken || !this.presentationId) {
                log.w("Missing access token or presentation ID. Google Slides integration disabled.");
                return;
            }
            // Validate access token and fetch presentation data
            this.validateCredentials().then((valid) => {
                if (valid) {
                    this.hasValidCredentials = true;
                    this.fetchPresentationData();
                }
            });
        }
        // Add this helper method for better error diagnostics
        async logResponseError(response) {
            try {
                const errorText = await response.text();
                log.w(`API Error Response: ${errorText}`);
            }
            catch (e) {
                log.w("Could not parse error response");
            }
        }
        update() {
            if (!this.hasValidCredentials || !this.pollForChanges)
                return;
            // Poll for changes at specified interval
            const currentTime = getTime();
            if (currentTime - this.lastPollTime >= this.pollingInterval) {
                this.lastPollTime = currentTime;
                this.checkForRemoteSlideChanges();
            }
        }
        // Validate access token by making a test API call
        async validateCredentials() {
            try {
                const response = await this.internetModule.fetch(`https://slides.googleapis.com/v1/presentations/${this.presentationId}?fields=title`, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        Accept: "application/json"
                    }
                });
                if (response.status === 200) {
                    log.d("Google Slides API connection successful");
                    return true;
                }
                else {
                    log.w(`API validation failed with status: ${response.status}`);
                    return false;
                }
            }
            catch (error) {
                log.e("Failed to validate Google credentials: " + error);
                return false;
            }
        }
        // Fetch presentation data including slides and notes
        async fetchPresentationData() {
            try {
                if (!this.internetModule || !this.internetModule.fetch) {
                    log.e("Internet Module or fetch method is not available.");
                    return;
                }
                const response = await this.internetModule.fetch(`https://slides.googleapis.com/v1/presentations/${this.presentationId}`, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        Accept: "application/json"
                    }
                });
                if (response.status === 200) {
                    const data = await response.json();
                    this.slides = data.slides || [];
                    this.slideCount = this.slides.length; // Use the length of slides array
                    log.d(`Loaded presentation with ${this.slideCount} slides`);
                    // Load current slide content
                    this.loadSlideContent(this.currentSlideIndex);
                    this.isInitialized = true;
                }
                else {
                    await this.logResponseError(response); // Log detailed error
                }
            }
            catch (error) {
                log.e("Error fetching presentation data: " + error);
            }
        }
        // Load content for a specific slide index
        async loadSlideContent(index) {
            if (!this.hasValidCredentials || index >= this.slides.length) {
                log.w("Invalid slide index or credentials.");
                return;
            }
            try {
                const slideId = this.slides[index].objectId;
                if (!slideId) {
                    log.w("Slide ID is not available.");
                    return;
                }
                // Correct the thumbnail API URL
                const thumbnailResponse = await this.internetModule.fetch(`https://slides.googleapis.com/v1/presentations/${this.presentationId}/pages/${slideId}/thumbnail`, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        Accept: "application/json"
                    }
                });
                if (thumbnailResponse.status === 200) {
                    const thumbnailData = await thumbnailResponse.json();
                    if (this.slideImage && thumbnailData.contentUrl) {
                        this.loadImageFromUrl(thumbnailData.contentUrl);
                    }
                }
                else {
                    await this.logResponseError(thumbnailResponse); // Log detailed error
                }
                // Speaker notes handling
                try {
                    // Get the current slide's notes page
                    const slideData = this.slides[index];
                    // Check if speaker notes exist
                    if (slideData && slideData.slideProperties && slideData.slideProperties.notesPage) {
                        const notesPage = slideData.slideProperties.notesPage;
                        // Extract text content from notes page
                        if (notesPage.pageElements) {
                            // Collect all text from text boxes in the notes page
                            let notesText = "";
                            for (const element of notesPage.pageElements) {
                                if (element.shape && element.shape.text) {
                                    const textElements = element.shape.text.textElements || [];
                                    for (const textElement of textElements) {
                                        if (textElement.textRun && textElement.textRun.content) {
                                            notesText += textElement.textRun.content;
                                        }
                                    }
                                }
                            }
                            // Set the speaker notes text
                            if (notesText.trim()) {
                                this.speakerNotes.text = notesText;
                                log.d("Speaker notes loaded successfully");
                            }
                            else {
                                this.speakerNotes.text = "No speaker notes available";
                                log.d("No speaker notes content found");
                            }
                        }
                        else {
                            this.speakerNotes.text = "No speaker notes available";
                            log.d("Notes page has no elements");
                        }
                    }
                    else {
                        this.speakerNotes.text = "No speaker notes available";
                        log.d("No notes page found for this slide");
                    }
                }
                catch (error) {
                    this.speakerNotes.text = "Error loading speaker notes";
                    log.e("Error processing speaker notes: " + error);
                }
                this.currentSlideIndex = index;
            }
            catch (error) {
                log.e("Error loading slide content: " + error);
            }
        }
        // Load image from URL into the slideImage component
        loadImageFromUrl(url) {
            if (!this.slideImage) {
                log.w("SlideImage component is not defined.");
                return;
            }
            // Check for RemoteServiceModule for makeResourceFromUrl
            if (!this.remoteServiceModule || !this.remoteServiceModule.makeResourceFromUrl) {
                log.e("RemoteServiceModule or makeResourceFromUrl is not available. Ensure you are testing on Spectacles or in Lens Studio with Device Type Override set to Spectacles.");
                return;
            }
            // Check for RemoteMediaModule for loadResourceAsImageTexture
            if (!this.remoteMediaModule || !this.remoteMediaModule.loadResourceAsImageTexture) {
                log.e("RemoteMediaModule or loadResourceAsImageTexture is not available. Ensure you are testing on Spectacles or in Lens Studio with Device Type Override set to Spectacles.");
                return;
            }
            // Check internet availability
            if (!global.deviceInfoSystem.isInternetAvailable()) {
                log.e("Internet is not available. Cannot load image.");
                return;
            }
            try {
                // Create a DynamicResource from the URL using RemoteServiceModule
                const resource = this.remoteServiceModule.makeResourceFromUrl(url);
                if (!resource) {
                    log.e("Failed to create DynamicResource from URL.");
                    return;
                }
                // Load the resource as an image texture using RemoteMediaModule
                this.remoteMediaModule.loadResourceAsImageTexture(resource, (texture) => {
                    if (texture) {
                        // Apply the texture to the image component
                        this.slideImage.mainMaterial.mainPass.baseTex = texture;
                        log.d("Slide image loaded successfully.");
                    }
                    else {
                        log.w("Failed to load slide image texture.");
                    }
                }, (error) => {
                    log.e("Error loading image: " + error);
                });
            }
            catch (error) {
                log.e("Error in loadImageFromUrl: " + error);
            }
        }
        // Check for changes in the Google Slides presentation
        async checkForRemoteSlideChanges() {
            if (!this.hasValidCredentials)
                return;
            try {
                // The Google Slides API does not have a "currentSlide" endpoint
                // Instead, you need to fetch the entire presentation and compare slides
                const response = await this.internetModule.fetch(`https://slides.googleapis.com/v1/presentations/${this.presentationId}`, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        Accept: "application/json"
                    }
                });
                if (response.status === 200) {
                    const data = await response.json();
                    const remoteSlides = data.slides || [];
                    const remoteSlideCount = remoteSlides.length;
                    // Check if the slide count or content has changed
                    if (remoteSlideCount !== this.slideCount) {
                        log.d("Remote slide count changed. Updating slides...");
                        this.slides = remoteSlides;
                        this.slideCount = remoteSlideCount;
                        this.loadSlideContent(this.currentSlideIndex);
                    }
                }
                else {
                    await this.logResponseError(response); // Log detailed error
                }
            }
            catch (error) {
                log.e("Error checking for remote slide changes: " + error);
            }
        }
        // Public methods for manual control
        // Go to a specific slide
        goToSlide(index) {
            if (index >= 0 && index < this.slideCount) {
                this.loadSlideContent(index);
                if (this.syncNavigationToGoogle) {
                    this.goToSlideInGoogle(index);
                }
            }
        }
        // Navigate to a specific slide in Google Slides
        async goToSlideInGoogle(index) {
            if (!this.hasValidCredentials || index < 0 || index >= this.slideCount) {
                log.w("Cannot go to slide. Either credentials are invalid or index is out of bounds.");
                return;
            }
            try {
                // Create a URL to the specific slide in presentation mode
                const presentationUrl = `https://docs.google.com/presentation/d/${this.presentationId}/present?slide=${index + 1}`;
                // Make a request to the URL to navigate to the specific slide
                if (global.deviceInfoSystem.isInternetAvailable()) {
                    try {
                        const response = await this.internetModule.fetch(presentationUrl, {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${this.accessToken}`,
                                Accept: "application/json"
                            }
                        });
                        if (response.status === 200) {
                            log.d(`Successfully navigated to slide ${index + 1} in presentation mode`);
                            this.currentSlideIndex = index;
                        }
                        else {
                            log.w(`Failed to navigate to slide: ${response.status}`);
                        }
                    }
                    catch (error) {
                        log.e("Error navigating to slide: " + error);
                    }
                }
                else {
                    log.e("Internet is not available. Cannot navigate to slide.");
                }
            }
            catch (error) {
                log.e("Error going to slide in Google Slides: " + error);
            }
        }
        // Go to next slide
        next() {
            if (this.currentSlideIndex < this.slideCount - 1) {
                this.loadSlideContent(this.currentSlideIndex + 1);
                if (this.syncNavigationToGoogle) {
                    this.moveToNextSlideInGoogle(); // Sync with Google Slides
                    this.webSocketController.next(); // Sync with WebSocket
                }
            }
        }
        // Go to previous slide
        previous() {
            if (this.currentSlideIndex > 0) {
                this.loadSlideContent(this.currentSlideIndex - 1);
                if (this.syncNavigationToGoogle) {
                    this.moveToPreviousSlideInGoogle(); // Sync with Google Slides
                    this.webSocketController.previous(); // Sync with WebSocket
                }
            }
        }
        // Send a keyboard shortcut to Google Slides presentation mode
        async sendKeyboardShortcut(key) {
            if (!this.hasValidCredentials) {
                log.w("Cannot send keyboard shortcut. Invalid credentials.");
                return;
            }
            try {
                // Create a URL to the presentation in presentation mode with the current slide
                const presentationUrl = `https://docs.google.com/presentation/d/${this.presentationId}/present?slide=${this.currentSlideIndex + 1}`;
                // Make a request to the URL to ensure we're in the right slide
                if (global.deviceInfoSystem.isInternetAvailable()) {
                    try {
                        const response = await this.internetModule.fetch(presentationUrl, {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${this.accessToken}`,
                                Accept: "application/json"
                            }
                        });
                        if (response.status === 200) {
                            log.d(`Successfully accessed slide ${this.currentSlideIndex + 1} in presentation mode`);
                        }
                        else {
                            log.w(`Failed to access slide: ${response.status}`);
                        }
                    }
                    catch (error) {
                        log.e("Error accessing slide: " + error);
                    }
                }
                else {
                    log.e("Internet is not available. Cannot access presentation.");
                    return;
                }
            }
            catch (error) {
                log.e("Error sending keyboard shortcut: " + error);
            }
        }
        // Move to the next slide in Google Slides
        async moveToNextSlideInGoogle() {
            if (!this.hasValidCredentials || this.currentSlideIndex >= this.slideCount - 1) {
                log.w("Cannot move to the next slide. Either credentials are invalid or already on the last slide.");
                return;
            }
            try {
                // Calculate the next slide index
                const nextSlideIndex = this.currentSlideIndex + 1;
                // Navigate directly to the next slide using the goToSlideInGoogle method
                await this.goToSlideInGoogle(nextSlideIndex);
                log.d(`Successfully moved to the next slide (index ${nextSlideIndex}) in Google Slides.`);
            }
            catch (error) {
                log.e("Error moving to the next slide in Google Slides: " + error);
            }
        }
        // Move to the previous slide in Google Slides
        async moveToPreviousSlideInGoogle() {
            if (!this.hasValidCredentials || this.currentSlideIndex <= 0) {
                log.w("Cannot move to the previous slide. Either credentials are invalid or already on the first slide.");
                return;
            }
            try {
                // Calculate the previous slide index
                const previousSlideIndex = this.currentSlideIndex - 1;
                // Navigate directly to the previous slide using the goToSlideInGoogle method
                await this.goToSlideInGoogle(previousSlideIndex);
                log.d(`Successfully moved to the previous slide (index ${previousSlideIndex}) in Google Slides.`);
            }
            catch (error) {
                log.e("Error moving to the previous slide in Google Slides: " + error);
            }
        }
    };
    __setFunctionName(_classThis, "GoogleSlideBridge");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GoogleSlideBridge = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GoogleSlideBridge = _classThis;
})();
exports.GoogleSlideBridge = GoogleSlideBridge;
//# sourceMappingURL=GoogleSlideBridge.js.map