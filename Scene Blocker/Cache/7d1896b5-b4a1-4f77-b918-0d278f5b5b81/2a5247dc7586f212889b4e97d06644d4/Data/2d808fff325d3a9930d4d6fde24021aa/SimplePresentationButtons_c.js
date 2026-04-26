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
// @input AssignableType presentationSwitcher {"hint":"Presentation switcher controlled by the buttons"}
// @input AssignableType_1 nextButton {"hint":"Pinch button that advances to the next slide"}
// @input AssignableType_2 previousButton {"hint":"Pinch button that goes to the previous slide"}
// @input Component.Text statusText {"hint":"Optional status text for quick debugging"}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../Modules/Src/Assets/PublicSpeaker/Scripts/SimplePresentationButtons");
Object.setPrototypeOf(script, Module.SimplePresentationButtons.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("presentationSwitcher", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
