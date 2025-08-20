"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var color_1 = require("../application/color");
var authentication_middleware_1 = __importDefault(require("./middleware/authentication-middleware"));
var authorization_middleware_1 = require("./middleware/authorization-middleware");
var colorRouter = express_1.default.Router();
// GET /api/colors
colorRouter.get("/", color_1.getAllColors);
// POST /api/colors  (protected)
colorRouter.post("/", authentication_middleware_1.default, authorization_middleware_1.isAdmin, color_1.createColor);
// /api/colors/:id
colorRouter
    .route("/:id")
    .get(color_1.getColorById)
    .put(authentication_middleware_1.default, authorization_middleware_1.isAdmin, color_1.updateColorById)
    .delete(authentication_middleware_1.default, authorization_middleware_1.isAdmin, color_1.deleteColorById);
exports.default = colorRouter;
//# sourceMappingURL=color.js.map