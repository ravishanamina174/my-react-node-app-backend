"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
require("dotenv/config");
var express_1 = __importDefault(require("express"));
var product_1 = __importDefault(require("./api/product"));
var category_1 = __importDefault(require("./api/category"));
var review_1 = __importDefault(require("./api/review"));
var index_1 = require("./infrastructure/db/index");
var global_error_handling_middleware_1 = __importDefault(require("./api/middleware/global-error-handling-middleware"));
var cors_1 = __importDefault(require("cors"));
var order_1 = require("./api/order");
var express_2 = require("@clerk/express");
var body_parser_1 = __importDefault(require("body-parser"));
var color_1 = __importDefault(require("./api/color"));
var app = (0, express_1.default)();
// Make Clerk optional when env vars are not provided
var CLERK_ENABLED = Boolean(process.env.CLERK_SECRET_KEY &&
    process.env.CLERK_PUBLISHABLE_KEY &&
    process.env.NODE_ENV === "production");
console.log("=== Environment Configuration Debug ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("CLERK_SECRET_KEY exists:", !!process.env.CLERK_SECRET_KEY);
console.log("CLERK_PUBLISHABLE_KEY exists:", !!process.env.CLERK_PUBLISHABLE_KEY);
console.log("CLERK_ENABLED:", CLERK_ENABLED);
console.log("PORT:", process.env.PORT);
console.log("=====================================");
if (CLERK_ENABLED) {
    try {
        // Configure Clerk middleware with proper options
        app.use((0, express_2.clerkMiddleware)());
        console.log("Clerk middleware enabled with basic configuration");
        console.log("Clerk middleware enabled successfully");
        console.log("CLERK_SECRET_KEY exists:", !!process.env.CLERK_SECRET_KEY);
        console.log("CLERK_PUBLISHABLE_KEY exists:", !!process.env.CLERK_PUBLISHABLE_KEY);
        console.log("NODE_ENV:", process.env.NODE_ENV);
        // Add a test endpoint to verify Clerk middleware is working
        app.get("/test-clerk", function (req, res) {
            console.log("Testing Clerk middleware...");
            console.log("req.auth:", req.auth);
            console.log("req.auth type:", typeof req.auth);
            console.log("req.auth is function:", typeof req.auth === 'function');
            if (req.auth && typeof req.auth === 'function') {
                try {
                    var authData = req.auth();
                    console.log("Auth function result:", authData);
                    res.json({
                        success: true,
                        message: "Clerk middleware working",
                        authData: authData,
                        authType: typeof req.auth
                    });
                }
                catch (error) {
                    console.log("Error calling auth function:", error);
                    res.json({
                        success: false,
                        message: "Error calling auth function",
                        error: error.message,
                        authType: typeof req.auth
                    });
                }
            }
            else {
                res.json({
                    success: false,
                    message: "Clerk middleware not working properly",
                    auth: req.auth,
                    authType: typeof req.auth
                });
            }
        });
    }
    catch (error) {
        console.error("Failed to enable Clerk middleware:", error);
        console.warn("Continuing without Clerk middleware - authentication will fail");
    }
}
else {
    // eslint-disable-next-line no-console
    console.warn("Clerk keys not set or not in production; auth middleware disabled. Set CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY and NODE_ENV=production to enable.");
    console.log("CLERK_SECRET_KEY exists:", !!process.env.CLERK_SECRET_KEY);
    console.log("CLERK_PUBLISHABLE_KEY exists:", !!process.env.CLERK_PUBLISHABLE_KEY);
    console.log("NODE_ENV:", process.env.NODE_ENV);
}
var allowedOrigins = [
    "http://localhost:5173", // local frontend
    "https://my-frontend-r.netlify.app", // deployed frontend
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Stripe routes are mounted only if a secret key is present
var STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (STRIPE_SECRET_KEY) {
    // Dynamic imports avoid crashing startup if Stripe is not configured
    Promise.resolve().then(function () { return __importStar(require("./application/payment")); }).then(function (_a) {
        var handleWebhook = _a.handleWebhook;
        app.post("/api/payments/webhook", body_parser_1.default.raw({ type: "application/json" }), handleWebhook);
    });
    Promise.resolve().then(function () { return __importStar(require("./api/payment")); }).then(function (_a) {
        var paymentsRouter = _a.paymentsRouter;
        app.use("/api/payments", paymentsRouter);
    });
}
else {
    console.warn("STRIPE_SECRET_KEY not set; payment routes disabled");
}
// Middleware to parse JSON bodies
app.use(express_1.default.json()); //It conversts the incomign json payload of a  request into a javascript object found in req.body
app.use("/api/products", product_1.default);
app.use("/api/categories", category_1.default);
app.use("/api/reviews", review_1.default);
app.use("/api/orders", order_1.orderRouter);
app.use("/api/colors", color_1.default);
app.use(global_error_handling_middleware_1.default);
(0, index_1.connectDB)();
var PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
    console.log("Server is running on port ".concat(PORT));
});
// Simple health check for Postman / uptime checks
app.get("/health", function (req, res) {
    res.status(200).json({ status: "ok" });
});
// Authentication health check
app.get("/health/auth", function (req, res) {
    res.status(200).json({
        status: "ok",
        authentication: {
            clerkEnabled: CLERK_ENABLED,
            nodeEnv: process.env.NODE_ENV,
            clerkSecretExists: !!process.env.CLERK_SECRET_KEY,
            clerkPublishableExists: !!process.env.CLERK_PUBLISHABLE_KEY,
            timestamp: new Date().toISOString()
        }
    });
});
// Test endpoint to verify backend is working
app.get("/api/test", function (req, res) {
    res.json({
        message: 'Backend is working!',
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});
// Test products endpoint (simple version)
app.get("/api/test-products", function (req, res) {
    try {
        // Return some test data
        var testProducts = [
            {
                _id: 'test1',
                name: 'Test Product 1',
                price: 100,
                categoryId: 'test-cat',
                image: 'https://via.placeholder.com/300x300',
                description: 'Test product description'
            },
            {
                _id: 'test2',
                name: 'Test Product 2',
                price: 200,
                categoryId: 'test-cat',
                image: 'https://via.placeholder.com/300x300',
                description: 'Test product description'
            }
        ];
        res.json({
            success: true,
            data: testProducts,
            message: 'Test products loaded successfully'
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Backend error',
            error: error.message
        });
    }
});
// Test orders endpoint to verify orders API
app.get("/api/test-orders", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var Order, Address, orderCount, addressCount, sampleOrder, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Only allow in development mode
                if (process.env.NODE_ENV === "production") {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "Endpoint not found" })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("./infrastructure/db/entities/Order")); })];
            case 2:
                Order = (_a.sent()).default;
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("./infrastructure/db/entities/Address")); })];
            case 3:
                Address = (_a.sent()).default;
                return [4 /*yield*/, Order.countDocuments()];
            case 4:
                orderCount = _a.sent();
                return [4 /*yield*/, Address.countDocuments()];
            case 5:
                addressCount = _a.sent();
                return [4 /*yield*/, Order.findOne({})
                        .populate({
                        path: "items.productId",
                        select: "name images image stock price"
                    })
                        .populate({
                        path: "addressId",
                        select: "line_1 line_2 city phone"
                    })
                        .lean()];
            case 6:
                sampleOrder = _a.sent();
                res.json({
                    success: true,
                    message: 'Orders API test successful',
                    data: {
                        orderCount: orderCount,
                        addressCount: addressCount,
                        sampleOrder: sampleOrder,
                        timestamp: new Date().toISOString(),
                        warning: "DEVELOPMENT ONLY - This endpoint exposes order data"
                    }
                });
                return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                console.error('Error testing orders:', error_1);
                res.status(500).json({
                    success: false,
                    message: 'Orders API test failed',
                    error: error_1.message
                });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=index.js.map