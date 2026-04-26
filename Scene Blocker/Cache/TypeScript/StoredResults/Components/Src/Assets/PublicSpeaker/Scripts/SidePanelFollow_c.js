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
// @input float forwardDistance = 70 {"hint":"Distance in front of the user (cm)"}
// @input float sideOffset = 45 {"hint":"Horizontal side offset from user center (cm). Positive=right, Negative=left"}
// @input float verticalOffset = -20 {"hint":"Vertical offset relative to camera (cm)"}
// @input float positionLerpSpeed = 8 {"hint":"Position smoothing speed (higher = snappier)"}
// @input float rotationLerpSpeed = 10 {"hint":"Rotation smoothing speed (higher = snappier)"}
// @input bool yawOnlyFacing = true {"hint":"If true, panel keeps upright and only yaws to face user"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/PublicSpeaker/Scripts/SidePanelFollow");
Object.setPrototypeOf(script, Module.SidePanelFollow.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("forwardDistance", []);
    checkUndefined("sideOffset", []);
    checkUndefined("verticalOffset", []);
    checkUndefined("positionLerpSpeed", []);
    checkUndefined("rotationLerpSpeed", []);
    checkUndefined("yawOnlyFacing", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
