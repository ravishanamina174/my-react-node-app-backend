"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTotalAmount = exports.calculateOrderTotal = exports.validateOrderItems = exports.validateShippingAddress = exports.validateCreateOrder = exports.ValidationErrorResponseSchema = exports.OrderResponseSchema = exports.CreateOrderSchema = exports.OrderItemDBSchema = exports.OrderItemSchema = exports.ShippingAddressSchema = void 0;
var zod_1 = require("zod");
// Shipping Address Validation Schema
exports.ShippingAddressSchema = zod_1.z.object({
    firstName: zod_1.z.string()
        .min(1, "First name is required")
        .max(50, "First name must be 50 characters or less")
        .trim(),
    lastName: zod_1.z.string()
        .min(1, "Last name is required")
        .max(50, "Last name must be 50 characters or less")
        .trim(),
    email: zod_1.z.string()
        .min(1, "Email is required")
        .email("Please enter a valid email")
        .max(100, "Email must be 100 characters or less")
        .trim()
        .toLowerCase(),
    phone: zod_1.z.string()
        .min(1, "Phone is required")
        .max(15, "Phone must be 15 characters or less")
        .trim(),
    line_1: zod_1.z.string()
        .min(1, "Address line 1 is required")
        .max(100, "Address line 1 must be 100 characters or less")
        .trim(),
    line_2: zod_1.z.string()
        .max(100, "Address line 2 must be 100 characters or less")
        .trim()
        .optional(),
    city: zod_1.z.string()
        .min(1, "City is required")
        .max(50, "City must be 50 characters or less")
        .trim(),
    state: zod_1.z.string()
        .min(1, "State is required")
        .max(50, "State must be 50 characters or less")
        .trim(),
    postalCode: zod_1.z.string()
        .min(1, "Postal code is required")
        .max(20, "Postal code must be 20 characters or less")
        .trim(),
    country: zod_1.z.string()
        .min(1, "Country is required")
        .max(50, "Country must be 50 characters or less")
        .trim()
        .default("US")
});
// Order Item Validation Schema (for creation - frontend sends productId)
exports.OrderItemSchema = zod_1.z.object({
    productId: zod_1.z.string() // Frontend sends productId, we'll transform to product
        .min(1, "Product ID is required")
        .refine(function (val) { return /^[0-9a-fA-F]{24}$/.test(val); }, {
        message: "Invalid MongoDB ObjectId format"
    }),
    quantity: zod_1.z.number()
        .int("Quantity must be an integer")
        .positive("Quantity must be greater than 0"),
    price: zod_1.z.number()
        .positive("Price must be greater than 0"),
    name: zod_1.z.string()
        .min(1, "Product name is required")
        .trim()
});
// Order Item Schema (for database - uses product reference)
exports.OrderItemDBSchema = zod_1.z.object({
    product: zod_1.z.string() // MongoDB ObjectId reference
        .min(1, "Product reference is required")
        .refine(function (val) { return /^[0-9a-fA-F]{24}$/.test(val); }, {
        message: "Invalid MongoDB ObjectId format"
    }),
    quantity: zod_1.z.number()
        .int("Quantity must be an integer")
        .positive("Quantity must be greater than 0"),
    price: zod_1.z.number()
        .positive("Price must be greater than 0"),
    name: zod_1.z.string()
        .min(1, "Product name is required")
        .trim()
});
// Complete Order Validation Schema (for creation)
exports.CreateOrderSchema = zod_1.z.object({
    shippingAddress: exports.ShippingAddressSchema,
    orderItems: zod_1.z.array(exports.OrderItemSchema)
        .min(1, "Order must contain at least one item"),
    totalAmount: zod_1.z.number()
        .positive("Total amount must be greater than 0"),
    orderStatus: zod_1.z.string().optional(),
    paymentStatus: zod_1.z.string().optional()
});
// Response Schema for successful order creation
exports.OrderResponseSchema = zod_1.z.object({
    _id: zod_1.z.string(),
    user: zod_1.z.string(),
    shippingAddress: exports.ShippingAddressSchema,
    orderItems: zod_1.z.array(exports.OrderItemDBSchema),
    totalAmount: zod_1.z.number(),
    status: zod_1.z.string(),
    paymentStatus: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Error Response Schema
exports.ValidationErrorResponseSchema = zod_1.z.object({
    error: zod_1.z.string(),
    details: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        message: zod_1.z.string()
    }))
});
// Validation functions
var validateCreateOrder = function (data) {
    return exports.CreateOrderSchema.parse(data);
};
exports.validateCreateOrder = validateCreateOrder;
var validateShippingAddress = function (data) {
    return exports.ShippingAddressSchema.parse(data);
};
exports.validateShippingAddress = validateShippingAddress;
var validateOrderItems = function (data) {
    return zod_1.z.array(exports.OrderItemSchema).parse(data);
};
exports.validateOrderItems = validateOrderItems;
// Helper function to calculate total from order items
var calculateOrderTotal = function (orderItems) {
    return orderItems.reduce(function (total, item) { return total + (item.price * item.quantity); }, 0);
};
exports.calculateOrderTotal = calculateOrderTotal;
// Helper function to validate total amount matches order items
var validateTotalAmount = function (totalAmount, orderItems) {
    var calculatedTotal = (0, exports.calculateOrderTotal)(orderItems);
    return Math.abs(totalAmount - calculatedTotal) < 0.01; // Allow for floating point precision
};
exports.validateTotalAmount = validateTotalAmount;
//# sourceMappingURL=order-validation.js.map