"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var colorSchema = new mongoose_1.default.Schema({
    colors: {
        type: String,
        required: true
    },
    hex: {
        type: String,
        required: true
    },
});
var Color = mongoose_1.default.model("Color", colorSchema);
exports.default = Color;
//# sourceMappingURL=Color.js.map