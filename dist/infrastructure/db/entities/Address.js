"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var addressSchema = new mongoose_1.default.Schema({
    line_1: { type: String, required: true },
    line_2: { type: String },
    city: { type: String, required: true },
    phone: { type: String, required: true },
});
exports.default = mongoose_1.default.model("Address", addressSchema);
//# sourceMappingURL=Address.js.map