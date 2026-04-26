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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Image-to-3D Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Generate 3D models directly from image URLs</span>"}
// @ui {"widget":"group_start", "label":"Image-to-3D Generation"}
// @input string imageUrl = "https://example.com/image.png" {"hint":"URL of the image to convert to 3D (must be publicly accessible)", "widget":"text_area"}
// @input string prompt = "an object" {"hint":"Optional prompt to guide 3D generation (e.g., 'a toy car', 'a vase')", "widget":"text_area"}
// @input bool refineMesh = true {"hint":"Enable mesh refinement for higher quality (slower)"}
// @input bool useVertexColor {"hint":"Use vertex colors instead of textures"}
// @ui {"widget":"group_end"}
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Display Configuration</span>"}
// @input Component.Image sourceImage {"hint":"Image component to display the source image"}
// @input SceneObject baseMeshRoot {"hint":"Parent object for base mesh"}
// @input SceneObject refinedMeshRoot {"hint":"Parent object for refined mesh"}
// @input Asset.Material modelMat {"hint":"Material to apply to generated meshes"}
// @input Component.Text hintText {"hint":"Text component for status messages"}
// @input bool runOnTap {"hint":"Enable generation on tap/pinch"}
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
var Module = require("../../../../../../Modules/Src/Packages/RemoteServiceGateway.lspkg/HostedSnap/Examples/ExampleSnap3DImageTo3D");
Object.setPrototypeOf(script, Module.ExampleSnap3DImageTo3D.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("imageUrl", []);
    checkUndefined("prompt", []);
    checkUndefined("refineMesh", []);
    checkUndefined("useVertexColor", []);
    checkUndefined("sourceImage", []);
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
