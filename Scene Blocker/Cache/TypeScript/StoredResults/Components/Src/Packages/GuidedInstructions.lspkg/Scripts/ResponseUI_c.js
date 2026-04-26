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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">ResponseUI – AI response bubble and world labels</span><br/><span style=\"color: #94A3B8; font-size: 11px;\">Manages the response bubble and instantiates world-space labels from Gemini output.</span>"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">References</span>"}
// @input Component.Text responseAIText {"hint":"Text component displaying the AI response message"}
// @input Asset.ObjectPrefab worldLabelPrefab {"hint":"Prefab for label world objects"}
// @input Asset.ObjectPrefab worldArrowPrefab {"hint":"Prefab for arrow world objects"}
// @input SceneObject responseUIObj {"hint":"Root scene object for the response UI bubble"}
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
var Module = require("../../../../../Modules/Src/Packages/GuidedInstructions.lspkg/Scripts/ResponseUI");
Object.setPrototypeOf(script, Module.ResponseUI.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("responseAIText", []);
    checkUndefined("worldLabelPrefab", []);
    checkUndefined("worldArrowPrefab", []);
    checkUndefined("responseUIObj", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
