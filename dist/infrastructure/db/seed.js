"use strict";
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
exports.seedColors = void 0;
require("dotenv/config");
var index_1 = require("./index");
var Category_1 = __importDefault(require("./entities/Category"));
var Product_1 = __importDefault(require("./entities/Product"));
var stripe_1 = __importDefault(require("../stripe"));
var Color_1 = __importDefault(require("./entities/Color"));
var CATEGORY_NAMES = ["Socks", "Pants", "T-shirts", "Shoes", "Shorts"];
var ADJECTIVES = [
    "Classic", "Sporty", "Elegant", "Comfy", "Trendy", "Cool", "Premium", "Casual", "Bold", "Vivid",
    "Soft", "Durable", "Lightweight", "Cozy", "Modern", "Vintage", "Chic", "Sleek", "Eco", "Urban"
];
var NOUNS = [
    "Runner", "Style", "Fit", "Wear", "Edition", "Line", "Collection", "Piece", "Design", "Model",
    "Comfort", "Edge", "Wave", "Touch", "Look", "Trend", "Vibe", "Aura", "Motion", "Essence"
];
function getRandomName(categoryName) {
    var adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    var noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return "".concat(adj, " ").concat(categoryName, " ").concat(noun);
}
var createProductsForCategory = function (categoryId, categoryName) { return __awaiter(void 0, void 0, void 0, function () {
    var products, i, name, description, price, stripeProduct;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                products = [];
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < 10)) return [3 /*break*/, 4];
                name = getRandomName(categoryName);
                description = "This is a ".concat(categoryName, " that is ").concat(name);
                price = Math.floor(Math.random() * 100) + 10;
                return [4 /*yield*/, stripe_1.default.products.create({
                        name: name,
                        description: description,
                        default_price_data: {
                            currency: "usd",
                            unit_amount: price * 100,
                        },
                    })];
            case 2:
                stripeProduct = _a.sent();
                products.push({
                    categoryId: categoryId,
                    name: name,
                    price: price,
                    description: description,
                    image: "https://via.placeholder.com/150?text=".concat(encodeURIComponent(categoryName)),
                    stock: Math.floor(Math.random() * 50) + 1,
                    reviews: [],
                    stripePriceId: stripeProduct.default_price
                });
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [4 /*yield*/, Product_1.default.insertMany(products)];
            case 5:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var seed = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, CATEGORY_NAMES_1, name, slug, category;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, index_1.connectDB)()];
            case 1:
                _a.sent();
                return [4 /*yield*/, Category_1.default.deleteMany({})];
            case 2:
                _a.sent();
                return [4 /*yield*/, Product_1.default.deleteMany({})];
            case 3:
                _a.sent();
                return [4 /*yield*/, Color_1.default.deleteMany({})];
            case 4:
                _a.sent();
                // Seed colors first
                return [4 /*yield*/, (0, exports.seedColors)()];
            case 5:
                // Seed colors first
                _a.sent();
                _i = 0, CATEGORY_NAMES_1 = CATEGORY_NAMES;
                _a.label = 6;
            case 6:
                if (!(_i < CATEGORY_NAMES_1.length)) return [3 /*break*/, 10];
                name = CATEGORY_NAMES_1[_i];
                slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                return [4 /*yield*/, Category_1.default.create({ name: name, slug: slug })];
            case 7:
                category = _a.sent();
                return [4 /*yield*/, createProductsForCategory(category._id, name)];
            case 8:
                _a.sent();
                console.log("Seeded category: ".concat(name));
                _a.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 6];
            case 10:
                console.log("Seeding complete.");
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); };
// Seed Colors
var seedColors = function () { return __awaiter(void 0, void 0, void 0, function () {
    var colors, _i, colors_1, color, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                colors = [
                    { name: 'Black', hex: '#000000' },
                    { name: 'Navy', hex: '#1e3a8a' },
                    { name: 'Gray', hex: '#6b7280' },
                    { name: 'White', hex: '#ffffff' },
                    { name: 'Red', hex: '#dc2626' },
                    { name: 'Blue', hex: '#3b82f6' },
                    { name: 'Green', hex: '#10b981' },
                    { name: 'Yellow', hex: '#f59e0b' },
                    { name: 'Purple', hex: '#8b5cf6' },
                    { name: 'Pink', hex: '#ec4899' },
                ];
                _i = 0, colors_1 = colors;
                _a.label = 1;
            case 1:
                if (!(_i < colors_1.length)) return [3 /*break*/, 4];
                color = colors_1[_i];
                return [4 /*yield*/, Color_1.default.findOneAndUpdate({ name: color.name }, color, { upsert: true, new: true })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                console.log('Colors seeded successfully');
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error('Error seeding colors:', error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.seedColors = seedColors;
seed().catch(function (err) {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map