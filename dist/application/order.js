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
exports.getOrder = exports.createOrder = void 0;
var Order_1 = __importDefault(require("../infrastructure/db/entities/Order"));
var not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
var unauthorized_error_1 = __importDefault(require("../domain/errors/unauthorized-error"));
var order_validation_1 = require("../domain/validation/order-validation");
// Check if Clerk is available without importing it
var isClerkAvailable = function () {
    try {
        require.resolve("@clerk/express");
        return true;
    }
    catch (_a) {
        return false;
    }
};
// Only import Clerk if it's available
var getAuth;
if (isClerkAvailable()) {
    try {
        var clerk = require("@clerk/express");
        getAuth = clerk.getAuth;
    }
    catch (error) {
        console.log("Clerk import failed in application layer");
    }
}
var createOrder = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var data, userId, validatedData, details_1, calculatedTotal, transformedOrderItems, order, populatedOrder, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                data = req.body;
                userId = req.userId;
                if (!userId) {
                    throw new unauthorized_error_1.default("User not authenticated");
                }
                console.log("Creating order for userId:", userId);
                validatedData = void 0;
                try {
                    validatedData = (0, order_validation_1.validateCreateOrder)(data);
                }
                catch (validationError) {
                    details_1 = [];
                    if (validationError.errors) {
                        validationError.errors.forEach(function (err) {
                            details_1.push({
                                field: err.path.join('.'),
                                message: err.message
                            });
                        });
                    }
                    return [2 /*return*/, res.status(400).json({
                            error: "Validation failed",
                            details: details_1
                        })];
                }
                // Additional validation: check if total amount matches order items
                if (!(0, order_validation_1.validateTotalAmount)(validatedData.totalAmount, validatedData.orderItems)) {
                    calculatedTotal = validatedData.orderItems.reduce(function (sum, item) {
                        return sum + (item.price * item.quantity);
                    }, 0);
                    return [2 /*return*/, res.status(400).json({
                            error: "Validation failed",
                            details: [{
                                    field: "totalAmount",
                                    message: "Total amount (".concat(validatedData.totalAmount, ") must match sum of order items (").concat(calculatedTotal, ")")
                                }]
                        })];
                }
                transformedOrderItems = validatedData.orderItems.map(function (item) { return ({
                    product: item.productId, // Map productId to product
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name
                }); });
                return [4 /*yield*/, Order_1.default.create({
                        user: userId, // Changed from userId to user
                        orderItems: transformedOrderItems,
                        shippingAddress: validatedData.shippingAddress,
                        totalAmount: validatedData.totalAmount,
                        status: validatedData.orderStatus || "pending", // Changed from orderStatus to status
                        paymentStatus: validatedData.paymentStatus || "pending",
                    })];
            case 1:
                order = _a.sent();
                return [4 /*yield*/, Order_1.default.findById(order._id)
                        .populate({
                        path: "orderItems.product", // Changed from orderItems.productId
                        select: "name images image stock price"
                    })
                        .lean()];
            case 2:
                populatedOrder = _a.sent();
                res.status(201).json({
                    success: true,
                    order: populatedOrder
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createOrder = createOrder;
var getOrder = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, orderId, order, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                if (!userId) {
                    throw new unauthorized_error_1.default("User not authenticated");
                }
                orderId = req.params.id;
                console.log("Getting order ".concat(orderId, " for userId: ").concat(userId));
                return [4 /*yield*/, Order_1.default.findById(orderId)
                        .populate({
                        path: "orderItems.product", // Changed from orderItems.productId
                        select: "name images image stock price"
                    })
                        .lean()];
            case 1:
                order = _a.sent();
                if (!order) {
                    throw new not_found_error_1.default("Order not found");
                }
                // Ensure user can only access their own orders
                if (order.user !== userId) { // Changed from userId to user
                    throw new unauthorized_error_1.default("Unauthorized - cannot access another user's order");
                }
                res.status(200).json({
                    success: true,
                    order: order
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getOrder = getOrder;
//# sourceMappingURL=order.js.map