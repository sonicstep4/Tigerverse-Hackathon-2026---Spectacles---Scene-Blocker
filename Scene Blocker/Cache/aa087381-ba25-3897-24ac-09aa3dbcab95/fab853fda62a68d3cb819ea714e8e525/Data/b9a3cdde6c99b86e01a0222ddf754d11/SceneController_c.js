if (script.onAwake) {
    script.onAwake();
    return;
}
function checkUndefined(property, showIfData) {
    for (var i = 0; i < showIfData.length; i++) {
        if (showIfData[i][0] && script[showIfData[i][0]] != showIfData[i][1]) {
            return;
        }
    }
    if (script[property] == undefined) {
        throw new Error("Input " + property + " was not provided for the object " + script.getSceneObject().name);
    }
}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">SceneController – main orchestrator</span><br/><span style=\"color: #94A3B8; font-size: 11px;\">Wires together speech, depth, and Gemini API for AR label placement.</span>"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Debug</span>"}
// @input bool showDebugVisuals {"hint":"Show debug visuals in the scene"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">References</span>"}
// @input AssignableType debugVisualizer {"hint":"Visualizes 2D points over the camera frame for debugging"}
// @input AssignableType_1 speechUI {"hint":"Handles speech input and ASR"}
// @input AssignableType_2 gemini {"hint":"Calls to the Gemini API using Smart Gate"}
// @input AssignableType_3 responseUI {"hint":"Displays AI speech output"}
// @input AssignableType_4 loading {"hint":"Loading visual"}
// @input AssignableType_5 depthCache {"hint":"Caches depth frame and converts pixel positions to world space"}
// @input AssignableType_6 guidancePanel {"hint":"Step-by-step guidance panel (optional – leave empty to disable)"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Testing</span>"}
// @input Asset.Texture testTexture {"hint":"Assign a static texture to use instead of the live camera feed. Leave empty for normal on-device operation."}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Logging</span>"}
// @input bool enableLogging {"hint":"Enable general logging"}
// @input bool enableLoggingLifecycle {"hint":"Enable lifecycle logging (onAwake, onStart, onUpdate, onDestroy)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Packages/GuidedInstructions.lspkg/Scripts/SceneController");
Object.setPrototypeOf(script, Module.SceneController.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("showDebugVisuals", []);
    checkUndefined("debugVisualizer", []);
    checkUndefined("speechUI", []);
    checkUndefined("gemini", []);
    checkUndefined("responseUI", []);
    checkUndefined("loading", []);
    checkUndefined("depthCache", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
