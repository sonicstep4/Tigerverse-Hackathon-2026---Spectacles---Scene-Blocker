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
// @input AssignableType presentationSwitcher {"hint":"Presentation switcher used for scene line progression"}
// @input SceneObject waypointRoot {"hint":"Parent containing waypoint children in blocking order"}
// @input float firstContentSlideIndex = 1 {"hint":"First slide index that should map to waypoint 0 (intro slides come before this)"}
// @input Component.RenderMeshVisual pathVisual {"hint":"Render mesh visual that draws the floor track"}
// @input SceneObject targetMarker {"hint":"Optional marker object that is moved to the current target waypoint"}
// @input SceneObject playerReference {"hint":"Optional player/camera reference for dynamic follow path start"}
// @input float pathWidth = 45 {"hint":"Path width in centimeters"}
// @input float pathHeight = 6 {"hint":"Path thickness/height in centimeters"}
// @input float pathCapLength = 12 {"hint":"Rounded cap length at each end (cm)"}
// @input float pathCapSegments = 4 {"hint":"Rounded cap smoothness segments"}
// @input float floorYOffset = 8 {"hint":"Vertical offset to avoid z-fighting with the floor"}
// @input float pathLift {"hint":"Additional vertical lift applied directly to final path (cm)"}
// @input float targetYOffset = 4 {"hint":"Target marker vertical offset in centimeters"}
// @input float targetScale = 0.75 {"hint":"Target marker world scale multiplier"}
// @input float extendPastPlayer = 20 {"hint":"Extend path backward from player by this amount (cm)"}
// @input float extendPastTarget = 30 {"hint":"Extend path past target by this amount (cm)"}
// @input bool lockPathToGroundPlane = true {"hint":"Keep path locked to the ground plane of the current target"}
// @input bool usePlayerEstimatedGroundPlane = true {"hint":"Use player height to estimate floor plane for the path"}
// @input float playerToFloorOffset = -140 {"hint":"Estimated floor offset below player/camera in cm"}
// @input bool pulsePathColor = true {"hint":"Animate path color pulse for better visibility"}
// @input float pulseSpeed = 1.2 {"hint":"Pulse speed (cycles per second)"}
// @input bool scrollPathTexture = true {"hint":"Animate texture UV scroll along the path"}
// @input float textureScrollSpeed = 0.35 {"hint":"Texture scroll speed (UV units per second)"}
// @input float textureScrollU {"hint":"Texture scroll direction on U axis"}
// @input float textureScrollV = -1 {"hint":"Texture scroll direction on V axis"}
// @input vec4 pulseColorA = {0.1,0.9,1,1} {"hint":"Primary pulse color"}
// @input vec4 pulseColorB = {1,1,0.2,1} {"hint":"Secondary pulse color"}
// @input bool debugLogs {"hint":"Enable debug logs for target/path updates"}
// @input float debugLogInterval = 1 {"hint":"How often (seconds) to print update logs"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/PublicSpeaker/Scripts/BlockingGuideController");
Object.setPrototypeOf(script, Module.BlockingGuideController.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("presentationSwitcher", []);
    checkUndefined("waypointRoot", []);
    checkUndefined("firstContentSlideIndex", []);
    checkUndefined("pathVisual", []);
    checkUndefined("pathWidth", []);
    checkUndefined("pathHeight", []);
    checkUndefined("pathCapLength", []);
    checkUndefined("pathCapSegments", []);
    checkUndefined("floorYOffset", []);
    checkUndefined("pathLift", []);
    checkUndefined("targetYOffset", []);
    checkUndefined("targetScale", []);
    checkUndefined("extendPastPlayer", []);
    checkUndefined("extendPastTarget", []);
    checkUndefined("lockPathToGroundPlane", []);
    checkUndefined("usePlayerEstimatedGroundPlane", []);
    checkUndefined("playerToFloorOffset", []);
    checkUndefined("pulsePathColor", []);
    checkUndefined("pulseSpeed", []);
    checkUndefined("scrollPathTexture", []);
    checkUndefined("textureScrollSpeed", []);
    checkUndefined("textureScrollU", []);
    checkUndefined("textureScrollV", []);
    checkUndefined("pulseColorA", []);
    checkUndefined("pulseColorB", []);
    checkUndefined("debugLogs", []);
    checkUndefined("debugLogInterval", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
