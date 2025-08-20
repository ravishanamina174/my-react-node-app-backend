"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var category_1 = require("../application/category");
var authentication_middleware_1 = __importDefault(require("./middleware/authentication-middleware"));
var categoryRouter = express_1.default.Router();
categoryRouter.get("/", category_1.getAllCategories);
categoryRouter.post("/", authentication_middleware_1.default, category_1.createCategory);
categoryRouter
    .route("/:id")
    .get(category_1.getCategoryById)
    .put(category_1.updateCategoryById)
    .delete(category_1.deleteCategoryById);
exports.default = categoryRouter;
//# sourceMappingURL=category.js.map