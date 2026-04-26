"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = delay;
const debounce_1 = require("./debounce");
async function delay(seconds) {
    return new Promise((resolve, reject) => {
        (0, debounce_1.setTimeout)(() => {
            resolve();
        }, seconds * 1000);
    });
}
//# sourceMappingURL=Delay.js.map