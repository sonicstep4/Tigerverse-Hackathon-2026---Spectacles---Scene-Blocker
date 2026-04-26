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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">TouchDownButton – pinch interaction button</span><br/><span style=\"color: #94A3B8; font-size: 11px;\">Requires an Interactable on the same SceneObject.</span>"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Callbacks</span>"}
// @input bool editEventCallbacks {"hint":"Enable this to add functions from another script to this component's callback events"}
// @ui {"widget":"group_start", "label":"On Button Pinched Callbacks", "showIf":"editEventCallbacks"}
// @input Component.ScriptComponent customFunctionForOnButtonPinchedDown {"hint":"Script component to invoke on pinch down"}
// @input Component.ScriptComponent customFunctionForOnButtonPinchedUp {"hint":"Script component to invoke on pinch up"}
// @input string[] onButtonPinchedDownFunctionNames = {} {"hint":"Function names to call on pinch down"}
// @input string[] onButtonPinchedUpFunctionNames = {} {"hint":"Function names to call on pinch up"}
// @ui {"widget":"group_end"}
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
var Module = require("../../../../../Modules/Src/Packages/GuidedInstructions.lspkg/Scripts/TouchDownButton");
Object.setPrototypeOf(script, Module.TouchDownButton.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("editEventCallbacks", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
