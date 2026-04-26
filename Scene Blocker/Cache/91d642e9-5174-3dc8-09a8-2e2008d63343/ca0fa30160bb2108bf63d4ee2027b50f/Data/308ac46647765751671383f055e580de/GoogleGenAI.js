"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gemini = exports.GoogleGenAI = void 0;
/**
 * Specs Inc. 2026
 * Unified client for all Google GenAI APIs. Provides centralized access to Gemini (multimodal AI),
 * Lyria (music/vocal generation), and Imagen (image generation/editing) services with consistent
 * interfaces and backwards compatibility for existing implementations.
 */
const Gemini_1 = require("./Gemini");
Object.defineProperty(exports, "Gemini", { enumerable: true, get: function () { return Gemini_1.Gemini; } });
const Lyria_1 = require("./Lyria");
const Imagen_1 = require("./Imagen");
class GoogleGenAI {
}
exports.GoogleGenAI = GoogleGenAI;
/**
 * Access to Gemini API for text and multimodal generation
 */
GoogleGenAI.Gemini = Gemini_1.Gemini;
/**
 * Access to Lyria API for music and vocal generation
 */
GoogleGenAI.Lyria = Lyria_1.Lyria;
/**
 * Access to Imagen API for image generation and editing
 */
GoogleGenAI.Imagen = Imagen_1.Imagen;
//# sourceMappingURL=GoogleGenAI.js.map