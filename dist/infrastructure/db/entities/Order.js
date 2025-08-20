"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var OrderItemSchema = new mongoose_1.default.Schema({
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        validate: {
            validator: function (v) {
                return mongoose_1.default.Types.ObjectId.isValid(v);
            },
            message: 'Invalid product ID format'
        }
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be greater than 0'],
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be an integer'
        }
    },
    price: {
        type: Number,
        required: true,
        min: [0.01, 'Price must be greater than 0']
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
});
var ShippingAddressSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    email: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: true,
        maxlength: 15,
        trim: true
    },
    line_1: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },
    line_2: {
        type: String,
        maxlength: 100,
        trim: true
    },
    city: {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    state: {
        type: String,
        required: true,
        maxlength: 50,
        trim: true
    },
    postalCode: {
        type: String,
        required: true,
        maxlength: 20,
        trim: true
    },
    country: {
        type: String,
        required: true,
        maxlength: 50,
        trim: true,
        default: "US"
    }
});
var OrderSchema = new mongoose_1.default.Schema({
    // User reference (changed from userId to user for clarity)
    user: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: true,
        index: true
    },
    // Order items with product reference
    orderItems: {
        type: [OrderItemSchema],
        required: true,
        validate: {
            validator: function (items) {
                return items && items.length > 0;
            },
            message: 'Order must contain at least one item'
        }
    },
    // Shipping address - required
    shippingAddress: {
        type: ShippingAddressSchema,
        required: true
    },
    // Total amount - required
    totalAmount: {
        type: Number,
        required: true,
        min: [0.01, 'Total amount must be greater than 0'],
        validate: {
            validator: function (total) {
                // Verify total matches sum of items
                if (this.orderItems) {
                    var calculatedTotal = this.orderItems.reduce(function (sum, item) {
                        return sum + (item.price * item.quantity);
                    }, 0);
                    return Math.abs(total - calculatedTotal) < 0.01; // Allow for floating point precision
                }
                return true;
            },
            message: 'Total amount must match sum of order items'
        }
    },
    // Order status (changed from orderStatus to status)
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
    // Payment status (changed from paymentMethod to paymentStatus)
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    },
    // Stripe payment intent tracking
    paymentIntentId: {
        type: String,
        index: true,
    },
    // Timestamps
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});
// Pre-save middleware to update updatedAt
OrderSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
var Order = mongoose_1.default.model("Order", OrderSchema);
exports.default = Order;
//# sourceMappingURL=Order.js.map