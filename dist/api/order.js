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
exports.orderRouter = void 0;
var express_1 = __importDefault(require("express"));
var order_1 = require("./../application/order");
var authentication_middleware_1 = __importDefault(require("./middleware/authentication-middleware"));
var authorization_middleware_1 = require("./middleware/authorization-middleware");
var Order_1 = __importDefault(require("../infrastructure/db/entities/Order"));
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
var clerkClient;
var getAuth;
if (isClerkAvailable()) {
    try {
        var clerk = require("@clerk/express");
        clerkClient = clerk.clerkClient;
        getAuth = clerk.getAuth;
    }
    catch (error) {
        console.log("Clerk import failed, using fallback authentication");
    }
}
else {
    console.log("Clerk not available, using fallback authentication");
}
exports.orderRouter = express_1.default.Router();
exports.orderRouter.route("/").post(authentication_middleware_1.default, order_1.createOrder);
// Debug endpoint to test orders without authentication
exports.orderRouter.get("/debug/all", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var orders, transformedOrders, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Order_1.default.find({})
                        .populate({
                        path: "orderItems.product",
                        select: "name images image stock price"
                    })
                        .sort({ createdAt: -1 })
                        .lean()];
            case 1:
                orders = _a.sent();
                transformedOrders = orders.map(function (order) {
                    // Transform orderItems to ensure product data is available
                    var transformedOrderItems = order.orderItems.map(function (item) { return ({
                        _id: item._id,
                        product: item.product || {
                            _id: item.product,
                            name: item.name,
                            price: item.price,
                            images: []
                        },
                        quantity: item.quantity,
                        price: item.price,
                        name: item.name
                    }); });
                    return __assign(__assign({}, order), { orderItems: transformedOrderItems, 
                        // Calculate total for verification
                        calculatedTotal: order.orderItems.reduce(function (sum, item) {
                            return sum + (item.price * item.quantity);
                        }, 0), totalMatches: Math.abs(order.totalAmount - order.orderItems.reduce(function (sum, item) {
                            return sum + (item.price * item.quantity);
                        }, 0)) < 0.01 });
                });
                res.json({
                    success: true,
                    count: transformedOrders.length,
                    orders: transformedOrders
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Test endpoint to verify authentication middleware
exports.orderRouter.get("/debug/auth-test", authentication_middleware_1.default, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            res.json({
                success: true,
                message: "Authentication middleware working",
                reqUserId: req.userId,
                reqAuth: req.auth,
                nodeEnv: process.env.NODE_ENV
            });
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); });
// Temporary test endpoint for specific user orders
exports.orderRouter.get("/debug/user/:userId", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, orders, transformedOrders, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                return [4 /*yield*/, Order_1.default.find({ user: userId }) // Changed from userId to user
                        .populate({
                        path: "orderItems.product",
                        select: "name images image stock price"
                    })
                        .sort({ createdAt: -1 })
                        .lean()];
            case 1:
                orders = _a.sent();
                transformedOrders = orders.map(function (order) {
                    // Transform orderItems to ensure product data is available
                    var transformedOrderItems = order.orderItems.map(function (item) { return ({
                        _id: item._id,
                        product: item.product || {
                            _id: item.product,
                            name: item.name,
                            price: item.price,
                            images: []
                        },
                        quantity: item.quantity,
                        price: item.price,
                        name: item.name
                    }); });
                    return __assign(__assign({}, order), { orderItems: transformedOrderItems, 
                        // Calculate total for verification
                        calculatedTotal: order.orderItems.reduce(function (sum, item) {
                            return sum + (item.price * item.quantity);
                        }, 0), totalMatches: Math.abs(order.totalAmount - order.orderItems.reduce(function (sum, item) {
                            return sum + (item.price * item.quantity);
                        }, 0)) < 0.01 });
                });
                res.json({
                    success: true,
                    userId: userId,
                    count: transformedOrders.length,
                    orders: transformedOrders
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
//getUserOrders
// GET /api/orders/myorders
exports.orderRouter.get("/myorders", authentication_middleware_1.default, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, auth, allOrders, transformedOrders_1, groups_1, orders, transformedOrders, groups, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                console.log("myorders endpoint called");
                console.log("req.auth:", req.auth);
                console.log("req.userId:", req.userId);
                console.log("NODE_ENV:", process.env.NODE_ENV);
                userId = void 0;
                // Try to get userId from Clerk if available
                if (getAuth) {
                    try {
                        auth = getAuth(req);
                        userId = auth.userId;
                        console.log("Got userId from Clerk:", userId);
                    }
                    catch (error) {
                        console.log("Clerk getAuth failed, using fallback");
                    }
                }
                // Fallback for development mode or when Clerk is not available
                if (!userId) {
                    userId = req.userId;
                    console.log("Using fallback userId:", userId);
                }
                if (!(process.env.NODE_ENV !== "production" && userId === "dev_user_123")) return [3 /*break*/, 2];
                console.log("Development mode: returning all orders for mock user");
                return [4 /*yield*/, Order_1.default.find({})
                        .populate({
                        path: "orderItems.product",
                        select: "name images image stock price"
                    })
                        .sort({ createdAt: -1 })
                        .lean()];
            case 1:
                allOrders = _a.sent();
                transformedOrders_1 = allOrders.map(function (order) {
                    // Transform orderItems to ensure product data is available
                    var transformedOrderItems = order.orderItems.map(function (item) { return ({
                        _id: item._id,
                        product: item.product || {
                            _id: item.product,
                            name: item.name,
                            price: item.price,
                            images: []
                        },
                        quantity: item.quantity,
                        price: item.price,
                        name: item.name
                    }); });
                    return __assign(__assign({}, order), { orderItems: transformedOrderItems });
                });
                groups_1 = groupByDate(transformedOrders_1);
                return [2 /*return*/, res.json({
                        success: true,
                        orders: transformedOrders_1,
                        groups: groups_1,
                        message: "Development mode: returning all orders for mock user"
                    })];
            case 2:
                if (!userId) {
                    return [2 /*return*/, res.json({ success: true, orders: [] })];
                }
                return [4 /*yield*/, Order_1.default.find({ user: userId }) // Changed from userId to user
                        .populate({
                        path: "orderItems.product",
                        select: "name images image stock price"
                    })
                        .sort({ createdAt: -1 })
                        .lean()];
            case 3:
                orders = _a.sent();
                transformedOrders = orders.map(function (order) {
                    // Transform orderItems to ensure product data is available
                    var transformedOrderItems = order.orderItems.map(function (item) { return ({
                        _id: item._id,
                        product: item.product || {
                            _id: item.product,
                            name: item.name,
                            price: item.price,
                            images: []
                        },
                        quantity: item.quantity,
                        price: item.price,
                        name: item.name
                    }); });
                    return __assign(__assign({}, order), { orderItems: transformedOrderItems });
                });
                groups = groupByDate(transformedOrders);
                return [2 /*return*/, res.json({ success: true, orders: transformedOrders, groups: groups })];
            case 4:
                error_3 = _a.sent();
                console.log("Error in myorders:", error_3);
                next(error_3);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// GET /api/orders/allorders
exports.orderRouter.get("/allorders", authentication_middleware_1.default, authorization_middleware_1.isAdmin, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var rawOrders, clerkEnabled_1, userMap_1, uniqueUserIds, userEntries, orders, groups, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, Order_1.default.find({})
                        .populate({
                        path: "orderItems.product",
                        select: "name images image stock price"
                    })
                        .sort({ createdAt: -1 })
                        .lean()];
            case 1:
                rawOrders = _a.sent();
                clerkEnabled_1 = Boolean(process.env.CLERK_SECRET_KEY && process.env.NODE_ENV === "production");
                userMap_1 = {};
                if (!(clerkEnabled_1 && clerkClient)) return [3 /*break*/, 3];
                uniqueUserIds = Array.from(new Set(rawOrders.map(function (o) { return o.user; }).filter(Boolean)));
                return [4 /*yield*/, Promise.all(uniqueUserIds.map(function (id) { return __awaiter(void 0, void 0, void 0, function () {
                        var u, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, clerkClient.users.getUser(String(id))];
                                case 1:
                                    u = _b.sent();
                                    return [2 /*return*/, [id, { firstName: u.firstName || "", lastName: u.lastName || "" }]];
                                case 2:
                                    _a = _b.sent();
                                    return [2 /*return*/, [id, { firstName: "", lastName: "" }]];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 2:
                userEntries = _a.sent();
                userMap_1 = Object.fromEntries(userEntries);
                _a.label = 3;
            case 3:
                orders = rawOrders.map(function (o) {
                    // Transform orderItems to ensure product data is available
                    var transformedOrderItems = o.orderItems.map(function (item) { return ({
                        _id: item._id,
                        product: item.product || {
                            _id: item.product,
                            name: item.name,
                            price: item.price,
                            images: []
                        },
                        quantity: item.quantity,
                        price: item.price,
                        name: item.name
                    }); });
                    // Calculate total for this order (should match totalAmount)
                    var calculatedTotal = 0;
                    if (o.orderItems && o.orderItems.length > 0) {
                        calculatedTotal = o.orderItems.reduce(function (sum, item) {
                            return sum + (item.price * item.quantity);
                        }, 0);
                    }
                    return __assign(__assign({}, o), { user: clerkEnabled_1 ? userMap_1[String(o.user)] || { firstName: "", lastName: "" } : (o.user || { firstName: "", lastName: "" }), orderItems: transformedOrderItems, calculatedTotal: calculatedTotal, totalMatches: Math.abs(o.totalAmount - calculatedTotal) < 0.01 });
                });
                groups = groupByDate(orders);
                return [2 /*return*/, res.json({ success: true, orders: orders, groups: groups })];
            case 4:
                error_4 = _a.sent();
                next(error_4);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Parameterized route must come LAST
exports.orderRouter.route("/:id").get(order_1.getOrder);
function groupByDate(orders) {
    var map = new Map();
    for (var _i = 0, orders_1 = orders; _i < orders_1.length; _i++) {
        var o = orders_1[_i];
        var d = new Date(o.createdAt);
        var key = d.toISOString().slice(0, 10);
        if (!map.has(key))
            map.set(key, []);
        map.get(key).push(o);
    }
    map.forEach(function (list) { return list.sort(function (a, b) { return +new Date(b.createdAt) - +new Date(a.createdAt); }); });
    var entries = Array.from(map.entries());
    entries.sort(function (_a, _b) {
        var aDate = _a[0];
        var bDate = _b[0];
        return +new Date(bDate) - +new Date(aDate);
    });
    return entries.map(function (_a) {
        var date = _a[0], group = _a[1];
        return ({ date: date, orders: group });
    });
}
//# sourceMappingURL=order.js.map