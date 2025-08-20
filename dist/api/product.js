"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var product_1 = require("../application/product");
var authentication_middleware_1 = __importDefault(require("./middleware/authentication-middleware"));
var authorization_middleware_1 = require("./middleware/authorization-middleware");
var productRouter = express_1.default.Router();
productRouter.get("/", product_1.getAllProducts);
productRouter.get("/shop", product_1.getShopProducts);
productRouter.post("/", authentication_middleware_1.default, authorization_middleware_1.isAdmin, product_1.createProduct);
productRouter.get("/search", product_1.getProductsForSearchQuery);
productRouter
    .route("/:id")
    .get(product_1.getProductById)
    .put(product_1.updateProductById)
    .delete(product_1.deleteProductById);
productRouter
    .route("/images")
    .post(product_1.uploadProductImage);
exports.default = productRouter;
//# sourceMappingURL=product.js.map