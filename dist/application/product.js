"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShopProducts = exports.uploadProductImage = exports.getProductsForSearchQuery = exports.updateProductById = exports.getProductById = exports.getAllProducts = exports.deleteProductById = exports.createProduct = void 0;
var Product_1 = __importDefault(require("../infrastructure/db/entities/Product"));
var validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
var not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
var Product_2 = require("../domain/dto/Product");
var crypto_1 = require("crypto");
var s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
var client_s3_1 = require("@aws-sdk/client-s3");
var s3_1 = __importDefault(require("../infrastructure/s3"));
var stripe_1 = __importDefault(require("../infrastructure/stripe"));
var Category_1 = __importDefault(require("../infrastructure/db/entities/Category"));
var getAllProducts = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var categoryId, products, products, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                console.log("GET /api/products", req.query);
                categoryId = req.query.categoryId;
                if (!categoryId) return [3 /*break*/, 2];
                return [4 /*yield*/, Product_1.default.find({ categoryId: categoryId })];
            case 1:
                products = _a.sent();
                console.log("products count (filtered)", products.length);
                res.json(products);
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, Product_1.default.find()];
            case 3:
                products = _a.sent();
                console.log("products count", products.length);
                res.json(products);
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getAllProducts = getAllProducts;
var getProductsForSearchQuery = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var search, results, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                search = req.query.search;
                return [4 /*yield*/, Product_1.default.aggregate([
                        {
                            $search: {
                                index: "default",
                                autocomplete: {
                                    path: "name",
                                    query: search,
                                    tokenOrder: "any",
                                    fuzzy: {
                                        maxEdits: 1,
                                        prefixLength: 2,
                                        maxExpansions: 256,
                                    },
                                },
                                highlight: {
                                    path: "name",
                                },
                            },
                        },
                    ])];
            case 1:
                results = _a.sent();
                res.json(results);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getProductsForSearchQuery = getProductsForSearchQuery;
var createProduct = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var result, stripeProduct, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                result = Product_2.CreateProductDTO.safeParse(req.body);
                if (!result.success) {
                    throw new validation_error_1.default(result.error.message);
                }
                return [4 /*yield*/, stripe_1.default.products.create({
                        name: result.data.name,
                        description: result.data.description,
                        default_price_data: {
                            currency: "usd",
                            unit_amount: result.data.price * 100,
                        },
                    })];
            case 1:
                stripeProduct = _a.sent();
                return [4 /*yield*/, Product_1.default.create(__assign(__assign({}, result.data), { stripePriceId: stripeProduct.default_price }))];
            case 2:
                _a.sent();
                res.status(201).send();
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                next(error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createProduct = createProduct;
var getProductById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var product, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Product_1.default.findById(req.params.id).populate("reviews")];
            case 1:
                product = _a.sent();
                if (!product) {
                    throw new not_found_error_1.default("Product not found");
                }
                res.json(product);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                next(error_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getProductById = getProductById;
var updateProductById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var product, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Product_1.default.findByIdAndUpdate(req.params.id, req.body, {
                        new: true,
                    })];
            case 1:
                product = _a.sent();
                if (!product) {
                    throw new not_found_error_1.default("Product not found");
                }
                res.status(200).json(product);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                next(error_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateProductById = updateProductById;
var deleteProductById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var product, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Product_1.default.findByIdAndDelete(req.params.id)];
            case 1:
                product = _a.sent();
                if (!product) {
                    throw new not_found_error_1.default("Product not found");
                }
                res.status(200).json({ message: "Product deleted successfully" });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                next(error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteProductById = deleteProductById;
var uploadProductImage = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var body, fileType, id, url, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                body = req.body;
                fileType = body.fileType;
                id = (0, crypto_1.randomUUID)();
                return [4 /*yield*/, (0, s3_request_presigner_1.getSignedUrl)(s3_1.default, new client_s3_1.PutObjectCommand({
                        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
                        Key: id,
                        ContentType: fileType,
                    }), {
                        expiresIn: 60,
                    })];
            case 1:
                url = _a.sent();
                res.status(200).json({
                    url: url,
                    publicURL: "".concat(process.env.CLOUDFLARE_PUBLIC_DOMAIN, "/").concat(id),
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                next(error_7);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.uploadProductImage = uploadProductImage;
var getShopProducts = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, category, categoryId, color, sort, _b, limit, _c, page, filter, categoryDoc, sortObj, skip, products, totalProducts, error_8;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 6, , 7]);
                _a = req.query, category = _a.category, categoryId = _a.categoryId, color = _a.color, sort = _a.sort, _b = _a.limit, limit = _b === void 0 ? 50 : _b, _c = _a.page, page = _c === void 0 ? 1 : _c;
                filter = {};
                if (!categoryId) return [3 /*break*/, 1];
                // Direct categoryId parameter
                filter.categoryId = categoryId;
                return [3 /*break*/, 3];
            case 1:
                if (!(category && category !== 'all')) return [3 /*break*/, 3];
                return [4 /*yield*/, Category_1.default.findOne({ slug: category })];
            case 2:
                categoryDoc = _d.sent();
                if (categoryDoc) {
                    filter.categoryId = categoryDoc._id;
                }
                _d.label = 3;
            case 3:
                // Filter by color
                if (color && color !== 'all') {
                    filter.colorId = color;
                }
                sortObj = {};
                if (sort === 'price-asc') {
                    sortObj.price = 1;
                }
                else if (sort === 'price-desc') {
                    sortObj.price = -1;
                }
                else {
                    sortObj.createdAt = -1; // Default sort by newest
                }
                skip = (parseInt(page) - 1) * parseInt(limit);
                return [4 /*yield*/, Product_1.default.find(filter)
                        .populate('categoryId', 'name slug')
                        .populate('colorId', 'name hex')
                        .sort(sortObj)
                        .limit(parseInt(limit))
                        .skip(skip)];
            case 4:
                products = _d.sent();
                return [4 /*yield*/, Product_1.default.countDocuments(filter)];
            case 5:
                totalProducts = _d.sent();
                res.json({
                    success: true,
                    data: products,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalProducts / parseInt(limit)),
                        totalProducts: totalProducts,
                        hasNext: skip + products.length < totalProducts,
                        hasPrev: parseInt(page) > 1
                    }
                });
                return [3 /*break*/, 7];
            case 6:
                error_8 = _d.sent();
                next(error_8);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.getShopProducts = getShopProducts;
//# sourceMappingURL=product.js.map