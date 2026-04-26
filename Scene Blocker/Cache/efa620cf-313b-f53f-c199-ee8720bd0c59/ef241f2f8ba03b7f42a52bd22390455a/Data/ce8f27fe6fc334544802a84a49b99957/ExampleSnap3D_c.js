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
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Generation Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Configure Snap3D generation parameters and display objects</span>"}
// @ui {"widget":"group_start", "label":"Submit and Get Status Example"}
// @input string prompt = "A cute dog wearing a hat" {"widget":"text_area"}
// @input bool refineMesh = true
// @input bool useVertexColor
// @ui {"widget":"group_end"}
// @input Component.Image imageRoot
// @input SceneObject baseMeshRoot
// @input SceneObject refinedMeshRoot
// @input Asset.Material modelMat
// @input Component.Text hintText
// @input bool runOnTap
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Logging Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Control logging output for this script instance</span>"}
// @input bool enableLogging {"hint":"Enable general logging (animation cycles, events, etc.)"}
// @input bool enableLoggingLifecycle {"hint":"Enable lifecycle logging (onAwake, onStart, onUpdate, onDestroy, etc.)"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../Modules/Src/Packages/RemoteServiceGateway.lspkg/HostedSnap/Examples/ExampleSnap3D");
Object.setPrototypeOf(script, Module.ExampleSnap3D.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("prompt", []);
    checkUndefined("refineMesh", []);
    checkUndefined("useVertexColor", []);
    checkUndefined("imageRoot", []);
    checkUndefined("baseMeshRoot", []);
    checkUndefined("refinedMeshRoot", []);
    checkUndefined("modelMat", []);
    checkUndefined("hintText", []);
    checkUndefined("runOnTap", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
