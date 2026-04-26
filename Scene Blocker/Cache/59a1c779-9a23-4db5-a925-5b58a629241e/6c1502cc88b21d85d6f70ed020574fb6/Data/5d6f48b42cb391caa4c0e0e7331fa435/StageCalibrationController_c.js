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
// @input SceneObject stageRoot {"hint":"Root object that contains your blocking waypoints/path visuals"}
// @input SceneObject cameraObject {"hint":"Camera or device-tracked object used for calibration reference"}
// @input AssignableType calibrateButton {"hint":"Optional pinch button that triggers recalibration"}
// @input bool autoCalibrateOnStart = true {"hint":"Auto-calibrate once on start"}
// @input float forwardDistance = 160 {"hint":"Distance in front of user to place stage origin (cm)"}
// @input float xOffset {"hint":"Horizontal offset from center (cm)"}
// @input float yOffset {"hint":"Vertical offset from detected floor level (cm)"}
// @input bool keepCurrentY = true {"hint":"If true, keep current stage Y instead of using floor projection"}
// @input bool useCameraRelativeY = true {"hint":"If true, place stage using camera height + Y offset below"}
// @input float cameraRelativeYOffset = -120 {"hint":"When using camera-relative Y, stage is placed this much below camera (cm)"}
// @input bool debugLogs = true {"hint":"Enable debug logs in logger"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/PublicSpeaker/Scripts/StageCalibrationController");
Object.setPrototypeOf(script, Module.StageCalibrationController.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("stageRoot", []);
    checkUndefined("cameraObject", []);
    checkUndefined("autoCalibrateOnStart", []);
    checkUndefined("forwardDistance", []);
    checkUndefined("xOffset", []);
    checkUndefined("yOffset", []);
    checkUndefined("keepCurrentY", []);
    checkUndefined("useCameraRelativeY", []);
    checkUndefined("cameraRelativeYOffset", []);
    checkUndefined("debugLogs", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
