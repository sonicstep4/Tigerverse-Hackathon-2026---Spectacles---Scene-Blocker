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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">SpeechUI – speech bubble with microphone button</span><br/><span style=\"color: #94A3B8; font-size: 11px;\">Follows the main camera and shows ASR transcription text.</span>"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">References</span>"}
// @input SceneObject mainCamObj {"hint":"Main camera scene object used to position the speech UI"}
// @input SceneObject speecBocAnchor {"hint":"Anchor for the speech bubble popup"}
// @input Component.RenderMeshVisual micRend {"hint":"Render mesh for the microphone icon with animated shader"}
// @input Component.Text speechText {"hint":"Text component displaying the transcribed speech"}
// @input AssignableType asrVoiceController {"hint":"ASR voice controller for starting and stopping transcription"}
// @input Component.ColliderComponent speechButtonCollider {"hint":"Collider for enabling and disabling the speech button tap area"}
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
var Module = require("../../../../../Modules/Src/Packages/GuidedInstructions.lspkg/Scripts/SpeechUI");
Object.setPrototypeOf(script, Module.SpeechUI.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("mainCamObj", []);
    checkUndefined("speecBocAnchor", []);
    checkUndefined("micRend", []);
    checkUndefined("speechText", []);
    checkUndefined("asrVoiceController", []);
    checkUndefined("speechButtonCollider", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
