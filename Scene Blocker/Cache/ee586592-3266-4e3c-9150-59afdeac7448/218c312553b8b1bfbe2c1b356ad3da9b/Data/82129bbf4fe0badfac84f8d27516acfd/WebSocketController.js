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
exports.WebSocketController = void 0;
var __selfType = requireType("./WebSocketController");
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
const log = new NativeLogger_1.default("WebSocketController");
let WebSocketController = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var WebSocketController = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.internetModule = require("LensStudio:InternetModule");
            this.serverUrl = this.serverUrl;
            this.statusText = this.statusText;
            this.autoConnect = this.autoConnect;
            this.maxReconnectAttempts = this.maxReconnectAttempts;
            this.reconnectInterval = this.reconnectInterval;
            this.isConnected = false;
            this.reconnectAttempts = 0;
            this.reconnectTimer = 0;
            this.isReconnecting = false;
            // Track last received command
            this.lastCommand = "";
            this.lastCommandTime = 0;
        }
        __initialize() {
            super.__initialize();
            this.internetModule = require("LensStudio:InternetModule");
            this.serverUrl = this.serverUrl;
            this.statusText = this.statusText;
            this.autoConnect = this.autoConnect;
            this.maxReconnectAttempts = this.maxReconnectAttempts;
            this.reconnectInterval = this.reconnectInterval;
            this.isConnected = false;
            this.reconnectAttempts = 0;
            this.reconnectTimer = 0;
            this.isReconnecting = false;
            // Track last received command
            this.lastCommand = "";
            this.lastCommandTime = 0;
        }
        onAwake() {
            this.createEvent("OnStartEvent").bind(() => {
                if (this.autoConnect) {
                    this.connect();
                }
            });
            this.createEvent("UpdateEvent").bind(() => {
                this.update();
            });
        }
        update() {
            // Handle reconnection if needed
            if (this.isReconnecting) {
                this.reconnectTimer -= getDeltaTime();
                if (this.reconnectTimer <= 0) {
                    this.attemptReconnect();
                }
            }
        }
        // Connect to the WebSocket server
        connect() {
            if (this.isConnected) {
                log.d("Already connected to WebSocket server");
                return;
            }
            if (!this.internetModule) {
                log.e("Internet Module is not assigned. Please assign it in the Inspector.");
                this.updateStatus("Error: No Internet Module");
                return;
            }
            log.d(`Connecting to WebSocket server: ${this.serverUrl}`);
            this.updateStatus("Connecting...");
            try {
                // Create WebSocket using the Internet Module
                this.webSocket = this.internetModule.createWebSocket(this.serverUrl);
                this.webSocket.binaryType = "blob";
                // Set up event handlers
                this.webSocket.onopen = (event) => {
                    log.d("WebSocket connection established");
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.isReconnecting = false;
                    this.updateStatus("Connected");
                };
                this.webSocket.onmessage = (message) => {
                    log.d(`Received message: ${message}`);
                    this.handleMessage(message);
                };
                this.webSocket.onclose = () => {
                    log.d("WebSocket connection closed");
                    this.isConnected = false;
                    this.updateStatus("Disconnected");
                    // Start reconnection process
                    if (!this.isReconnecting) {
                        this.startReconnection();
                    }
                };
                this.webSocket.onerror = (event) => {
                    log.e("WebSocket error");
                    this.updateStatus("Connection error");
                };
            }
            catch (error) {
                log.e(`Error creating WebSocket: ${error}`);
                this.updateStatus("Connection failed");
                // Start reconnection process
                if (!this.isReconnecting) {
                    this.startReconnection();
                }
            }
        }
        // Disconnect from the WebSocket server
        disconnect() {
            if (!this.isConnected || !this.webSocket) {
                log.d("Not connected to WebSocket server");
                return;
            }
            log.d("Disconnecting from WebSocket server");
            this.isReconnecting = false; // Stop any reconnection attempts
            try {
                this.webSocket.close();
                this.webSocket = null;
                this.isConnected = false;
                this.updateStatus("Disconnected");
            }
            catch (error) {
                log.e(`Error disconnecting: ${error}`);
            }
        }
        // Check if WebSocket is connected
        isWebSocketConnected() {
            return this.isConnected;
        }
        // Send a generic message to the WebSocket server
        sendMessage(messageObj) {
            if (!this.isConnected || !this.webSocket) {
                log.w("Cannot send message: Not connected to WebSocket server");
                return false;
            }
            try {
                const message = JSON.stringify(messageObj);
                log.d(`Sending message: ${message}`);
                this.webSocket.send(message);
                return true;
            }
            catch (error) {
                log.e(`Error sending message: ${error}`);
                return false;
            }
        }
        // Send a command to the WebSocket server
        sendCommand(command) {
            return this.sendMessage({
                type: "command",
                command: command
            });
        }
        // Send a "next" command
        next() {
            return this.sendCommand("next");
        }
        // Send a "previous" command
        previous() {
            return this.sendCommand("previous");
        }
        // Check if a "next" command was received
        wasNextCommandReceived(sinceTime = 0) {
            return this.lastCommand === "next" && this.lastCommandTime > sinceTime;
        }
        // Check if a "previous" command was received
        wasPreviousCommandReceived(sinceTime = 0) {
            return this.lastCommand === "previous" && this.lastCommandTime > sinceTime;
        }
        // Get the last command received
        getLastCommand() {
            return {
                command: this.lastCommand,
                timestamp: this.lastCommandTime
            };
        }
        // Clear the last command (useful after processing a command)
        clearLastCommand() {
            this.lastCommand = "";
            this.lastCommandTime = 0;
        }
        // Handle incoming messages
        handleMessage(data) {
            try {
                // Parse the message data
                let messageData = data;
                // If data is a string, parse it as JSON
                if (typeof data === "string") {
                    messageData = JSON.parse(data);
                }
                // If data is a MessageEvent (from WebSocket), extract the data property
                else if (data && data.data) {
                    const dataStr = data.data.toString();
                    messageData = JSON.parse(dataStr);
                }
                log.d(`Processing message: ${JSON.stringify(messageData)}`);
                if (messageData.type === "command") {
                    log.d(`Received command: ${messageData.command}`);
                    // Process specific commands
                    switch (messageData.command) {
                        case "next":
                            // Store the command and timestamp
                            this.lastCommand = "next";
                            this.lastCommandTime = Date.now() / 1000; // Convert to seconds
                            log.d("Received next command");
                            break;
                        case "previous":
                            // Store the command and timestamp
                            this.lastCommand = "previous";
                            this.lastCommandTime = Date.now() / 1000; // Convert to seconds
                            log.d("Received previous command");
                            break;
                        default:
                            log.d(`Unknown command: ${messageData.command}`);
                            break;
                    }
                }
            }
            catch (error) {
                log.e(`Error processing message: ${error}`);
            }
        }
        // Start the reconnection process
        startReconnection() {
            if (this.isReconnecting) {
                return;
            }
            this.isReconnecting = true;
            this.reconnectAttempts = 0;
            this.reconnectTimer = this.reconnectInterval;
            log.d("Starting reconnection process");
            this.updateStatus("Reconnecting...");
        }
        // Attempt to reconnect to the WebSocket server
        attemptReconnect() {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                log.d("Maximum reconnection attempts reached");
                this.isReconnecting = false;
                this.updateStatus("Reconnection failed");
                return;
            }
            this.reconnectAttempts++;
            log.d(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.updateStatus(`Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.connect();
            // Set timer for next attempt if this one fails
            this.reconnectTimer = this.reconnectInterval;
        }
        // Update the status text
        updateStatus(status) {
            if (this.statusText) {
                this.statusText.text = status;
            }
        }
    };
    __setFunctionName(_classThis, "WebSocketController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WebSocketController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WebSocketController = _classThis;
})();
exports.WebSocketController = WebSocketController;
//# sourceMappingURL=WebSocketController.js.map