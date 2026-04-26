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
// @input Component.RenderMeshVisual pathVisual {"hint":"Render mesh visual that draws the floor track"}
// @input SceneObject targetMarker {"hint":"Optional marker object that is moved to the current target waypoint"}
// @input SceneObject playerReference {"hint":"Optional player/camera reference for dynamic follow path start"}
// @input float pathWidth = 45 {"hint":"Path width in centimeters"}
// @input float floorYOffset = 2 {"hint":"Vertical offset to avoid z-fighting with the floor"}
// @input bool lockPathToGroundPlane = true {"hint":"Keep path locked to the ground plane of the current target"}
// @input bool debugLogs {"hint":"Enable debug logs for target/path updates"}
// @input float debugLogInterval = 1 {"hint":"How often (seconds) to print update logs"}
// @input bool spawnDebugBeacons {"hint":"Spawn visible debug beacons at each waypoint"}
// @input Asset.ObjectPrefab debugBeaconPrefab {"hint":"Optional prefab used as waypoint debug beacon"}
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
    checkUndefined("pathVisual", []);
    checkUndefined("pathWidth", []);
    checkUndefined("floorYOffset", []);
    checkUndefined("lockPathToGroundPlane", []);
    checkUndefined("debugLogs", []);
    checkUndefined("debugLogInterval", []);
    checkUndefined("spawnDebugBeacons", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
