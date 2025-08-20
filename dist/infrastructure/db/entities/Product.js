"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var productSchema = new mongoose_1.default.Schema({
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stripePriceId: {
        type: String,
        required: true,
    },
    // Legacy single image field (optional for backward compatibility)
    image: {
        type: String,
        required: false,
    },
    // New images array field (primary field for multiple images)
    images: {
        type: [String],
        required: false,
        default: [],
        validate: {
            validator: function (images) {
                return images.length > 0;
            },
            message: 'At least one image is required'
        }
    },
    stock: {
        type: Number,
        required: true,
    },
    // reviews: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "Review",
    //   default: [],
    //   required: false,
    // },
    colorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Color",
        required: false,
    },
});
var Product = mongoose_1.default.model("Product", productSchema);
exports.default = Product;
//# sourceMappingURL=Product.js.map