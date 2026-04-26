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
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Gemini Live Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Configure real-time multimodal AI interaction with audio and video inputs</span>"}
// @ui {"widget":"group_start", "label":"Setup"}
// @input SceneObject websocketRequirementsObj
// @input AssignableType dynamicAudioOutput
// @input AssignableType_1 microphoneRecorder
// @input Component.Text textDisplay
// @ui {"widget":"group_end"}
// @ui {"widget":"separator"}
// @ui {"widget":"group_start", "label":"Inputs"}
// @input string instructions = "You are a helpful assistant that loves to make puns" {"widget":"text_area"}
// @input bool haveVideoInput
// @ui {"widget":"group_end"}
// @ui {"widget":"separator"}
// @ui {"widget":"group_start", "label":"Outputs"}
// @ui {"widget":"label", "label":"<span style=\"color: yellow;\">⚠️ To prevent audio feedback loop in Lens Studio Editor, use headphones or manage your microphone input.</span>"}
// @input bool haveAudioOutput
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"<span style=\"color: #60A5FA;\">Logging Configuration</span>"}
// @ui {"widget":"label", "label":"<span style=\"color: #94A3B8; font-size: 11px;\">Control logging output for this script instance</span>"}
// @input bool enableLogging {"hint":"Enable general logging (animation cycles, events, etc.)"}
// @input bool enableLoggingLifecycle {"hint":"Enable lifecycle logging (onAwake, onStart, onUpdate, onDestroy, etc.)"}
// @input string voice = "Puck" {"widget":"combobox", "values":[{"label":"Puck", "value":"Puck"}, {"label":"Charon", "value":"Charon"}, {"label":"Kore", "value":"Kore"}, {"label":"Fenrir", "value":"Fenrir"}, {"label":"Aoede", "value":"Aoede"}, {"label":"Leda", "value":"Leda"}, {"label":"Orus", "value":"Orus"}, {"label":"Zephyr", "value":"Zephyr"}], "showIf":"haveAudioOutput", "showIfValue":true}
// @ui {"widget":"group_end"}
// @ui {"widget":"separator"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../Modules/Src/Packages/RemoteServiceGateway.lspkg/HostedExternal/Examples/ExampleGeminiLive");
Object.setPrototypeOf(script, Module.ExampleGeminiLive.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("websocketRequirementsObj", []);
    checkUndefined("dynamicAudioOutput", []);
    checkUndefined("microphoneRecorder", []);
    checkUndefined("textDisplay", []);
    checkUndefined("instructions", []);
    checkUndefined("haveVideoInput", []);
    checkUndefined("haveAudioOutput", []);
    checkUndefined("enableLogging", []);
    checkUndefined("enableLoggingLifecycle", []);
    checkUndefined("voice", [["haveAudioOutput",true]]);
    if (script.onAwake) {
       script.onAwake();
    }
});
