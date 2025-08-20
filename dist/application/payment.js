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
exports.retrieveSessionStatus = exports.createCheckoutSession = exports.handleWebhook = exports.createPaymentIntent = void 0;
var util_1 = __importDefault(require("util"));
var Order_1 = __importDefault(require("../infrastructure/db/entities/Order"));
var stripe_1 = __importDefault(require("../infrastructure/stripe"));
var Product_1 = __importDefault(require("../infrastructure/db/entities/Product"));
var endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
var FRONTEND_URL = process.env.FRONTEND_URL;
function fulfillCheckout(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var checkoutSession, order;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Set your secret key. Remember to switch to your live secret key in production.
                    // See your keys here: https://dashboard.stripe.com/apikeys
                    console.log("Fulfilling Checkout Session " + sessionId);
                    return [4 /*yield*/, stripe_1.default.checkout.sessions.retrieve(sessionId, {
                            expand: ["line_items"],
                        })];
                case 1:
                    checkoutSession = _b.sent();
                    console.log(util_1.default.inspect(checkoutSession, false, null, true /* enable colors */));
                    return [4 /*yield*/, Order_1.default.findById((_a = checkoutSession.metadata) === null || _a === void 0 ? void 0 : _a.orderId).populate("orderItems.product")];
                case 2:
                    order = _b.sent();
                    if (!order) {
                        throw new Error("Order not found");
                    }
                    if (order.paymentStatus !== "pending") {
                        throw new Error("Payment is not pending");
                    }
                    if (order.status !== "pending") {
                        throw new Error("Order is not pending");
                    }
                    if (!(checkoutSession.payment_status !== "unpaid")) return [3 /*break*/, 4];
                    //  Perform fulfillment of the line items
                    //  Record/save fulfillment status for this
                    order.orderItems.forEach(function (item) { return __awaiter(_this, void 0, void 0, function () {
                        var product;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    product = item.product;
                                    return [4 /*yield*/, Product_1.default.findByIdAndUpdate(product._id, {
                                            $inc: { stock: -item.quantity },
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Order_1.default.findByIdAndUpdate(order._id, {
                            paymentStatus: "paid",
                            status: "processing",
                        })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
var createPaymentIntent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, orderId, amount, userId, order, paymentIntent, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, orderId = _a.orderId, amount = _a.amount;
                userId = req.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ error: "User not authenticated" })];
                }
                if (!orderId || !amount) {
                    return [2 /*return*/, res.status(400).json({ error: "orderId and amount are required" })];
                }
                // Validate amount is a positive number
                if (typeof amount !== 'number' || amount <= 0) {
                    return [2 /*return*/, res.status(400).json({ error: "Amount must be a positive number in cents" })];
                }
                return [4 /*yield*/, Order_1.default.findById(orderId)];
            case 1:
                order = _b.sent();
                if (!order) {
                    return [2 /*return*/, res.status(404).json({ error: "Order not found" })];
                }
                if (order.user.toString() !== userId) { // Changed from userId to user
                    return [2 /*return*/, res.status(403).json({ error: "Unauthorized - cannot access another user's order" })];
                }
                // Check if order is in pending status
                if (order.paymentStatus !== "pending") { // Changed from PENDING to pending
                    return [2 /*return*/, res.status(400).json({ error: "Order is not in pending status" })];
                }
                return [4 /*yield*/, stripe_1.default.paymentIntents.create({
                        amount: amount, // in cents
                        currency: 'usd',
                        metadata: {
                            orderId: orderId
                        },
                        automatic_payment_methods: {
                            enabled: true,
                        },
                    })];
            case 2:
                paymentIntent = _b.sent();
                // Update order with payment intent ID
                return [4 /*yield*/, Order_1.default.findByIdAndUpdate(orderId, {
                        paymentIntentId: paymentIntent.id,
                        paymentStatus: "pending"
                    })];
            case 3:
                // Update order with payment intent ID
                _b.sent();
                // Return client secret to frontend
                res.json({
                    clientSecret: paymentIntent.client_secret
                });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                console.error('Error creating payment intent:', error_1);
                res.status(500).json({
                    error: "Failed to create payment intent",
                    details: error_1.message
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.createPaymentIntent = createPaymentIntent;
var handleWebhook = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, sig, event, paymentIntent, orderId, paymentIntent, orderId, err_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                payload = req.body;
                sig = req.headers["stripe-signature"];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 10, , 11]);
                event = stripe_1.default.webhooks.constructEvent(payload, sig, endpointSecret);
                if (!(event.type === "checkout.session.completed" ||
                    event.type === "checkout.session.async_payment_succeeded")) return [3 /*break*/, 3];
                return [4 /*yield*/, fulfillCheckout(event.data.object.id)];
            case 2:
                _c.sent();
                res.status(200).send();
                return [2 /*return*/];
            case 3:
                if (!(event.type === "payment_intent.succeeded")) return [3 /*break*/, 6];
                paymentIntent = event.data.object;
                orderId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.orderId;
                if (!orderId) return [3 /*break*/, 5];
                return [4 /*yield*/, Order_1.default.findByIdAndUpdate(orderId, {
                        paymentStatus: "paid",
                        status: "processing" // Changed from CONFIRMED to processing
                    })];
            case 4:
                _c.sent();
                console.log("Order ".concat(orderId, " payment succeeded"));
                _c.label = 5;
            case 5:
                res.status(200).send();
                return [2 /*return*/];
            case 6:
                if (!(event.type === "payment_intent.payment_failed")) return [3 /*break*/, 9];
                paymentIntent = event.data.object;
                orderId = (_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.orderId;
                if (!orderId) return [3 /*break*/, 8];
                return [4 /*yield*/, Order_1.default.findByIdAndUpdate(orderId, {
                        paymentStatus: "failed" // Changed from FAILED to failed
                    })];
            case 7:
                _c.sent();
                console.log("Order ".concat(orderId, " payment failed"));
                _c.label = 8;
            case 8:
                res.status(200).send();
                return [2 /*return*/];
            case 9:
                // For other events, just acknowledge receipt
                res.status(200).send();
                return [3 /*break*/, 11];
            case 10:
                err_1 = _c.sent();
                console.error('Webhook error:', err_1);
                res.status(400).send("Webhook Error: ".concat(err_1.message));
                return [2 /*return*/];
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.handleWebhook = handleWebhook;
var createCheckoutSession = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, userId, order, session;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                orderId = req.body.orderId;
                console.log("body", req.body);
                userId = req.userId;
                if (!userId) {
                    throw new Error("User not authenticated");
                }
                return [4 /*yield*/, Order_1.default.findById(orderId).populate("orderItems.product")];
            case 1:
                order = _a.sent();
                if (!order) {
                    throw new Error("Order not found");
                }
                // Ensure user can only access their own orders
                if (order.user !== userId) { // Changed from userId to user
                    throw new Error("Unauthorized - cannot access another user's order");
                }
                return [4 /*yield*/, stripe_1.default.checkout.sessions.create({
                        ui_mode: "embedded",
                        line_items: order.orderItems.map(function (item) { return ({
                            price: item.product.stripePriceId,
                            quantity: item.quantity,
                        }); }),
                        mode: "payment",
                        return_url: "".concat(FRONTEND_URL, "/shop/complete?session_id={CHECKOUT_SESSION_ID}"),
                        metadata: {
                            orderId: req.body.orderId,
                        },
                    })];
            case 2:
                session = _a.sent();
                res.send({ clientSecret: session.client_secret });
                return [2 /*return*/];
        }
    });
}); };
exports.createCheckoutSession = createCheckoutSession;
var retrieveSessionStatus = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, checkoutSession, order;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                userId = req.userId;
                if (!userId) {
                    throw new Error("User not authenticated");
                }
                return [4 /*yield*/, stripe_1.default.checkout.sessions.retrieve(req.query.session_id)];
            case 1:
                checkoutSession = _c.sent();
                return [4 /*yield*/, Order_1.default.findById((_a = checkoutSession.metadata) === null || _a === void 0 ? void 0 : _a.orderId)];
            case 2:
                order = _c.sent();
                if (!order) {
                    throw new Error("Order not found");
                }
                // Ensure user can only access their own orders
                if (order.user !== userId) { // Changed from userId to user
                    throw new Error("Unauthorized - cannot access another user's order");
                }
                res.send({
                    status: checkoutSession.status,
                    customer_email: (_b = checkoutSession.customer_details) === null || _b === void 0 ? void 0 : _b.email,
                });
                return [2 /*return*/];
        }
    });
}); };
exports.retrieveSessionStatus = retrieveSessionStatus;
//# sourceMappingURL=payment.js.map