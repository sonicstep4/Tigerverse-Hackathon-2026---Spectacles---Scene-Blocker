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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">GuidancePanel – step-by-step maintenance guide</span><br/><span style=\"color: #94A3B8; font-size: 11px;\">Content from NespressoKnowledge.ts. Assign buttons below – events wired in code.</span>"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Camera</span>"}
// @input SceneObject mainCamObj {"hint":"Main camera scene object – panel follows this in world space"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Display Texts</span>"}
// @input Component.Text stepCounterText {"hint":"Step counter + phase, e.g. '3 / 15  [DESCALING]'"}
// @input Component.Text stepTitleText {"hint":"Current step title"}
// @input Component.Text stepDescText {"hint":"Current step description, warnings, and time notes"}
// @input Component.Text modeText {"hint":"Current mode indicator: MANUAL or AUTO"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Buttons</span>"}
// @input AssignableType prevButton {"hint":"RectangleButton for going to the previous step"}
// @input AssignableType_1 nextButton {"hint":"RectangleButton for going to the next step"}
// @input AssignableType_2 modeToggleButton {"hint":"RectangleButton to toggle between MANUAL and AUTO mode"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Logging</span>"}
// @input bool enableLogging {"hint":"Enable general logging"}
// @input bool enableLoggingLifecycle {"hint":"Enable lifecycle logging"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Packages/GuidedInstructions.lspkg/Scripts/GuidancePanel");
Object.setPrototypeOf(script, Module.GuidancePanel.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("mainCamObj", []);
    checkUndefined("stepCounterText", []);
    checkUndefined("stepTitleText", []);
    checkUndefined("stepDescText", []);
    checkUndefined("modeText", []);
    checkUndefined("prevButton", []);
    checkUndefined("nextButton", []);
    checkUndefined("modeToggleButton", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
