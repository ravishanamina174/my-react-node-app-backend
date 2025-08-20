"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsRouter = void 0;
var express_1 = __importDefault(require("express"));
var payment_1 = require("../application/payment");
var authentication_middleware_1 = __importDefault(require("./middleware/authentication-middleware"));
exports.paymentsRouter = express_1.default.Router();
exports.paymentsRouter.route("/create-checkout-session").post(authentication_middleware_1.default, payment_1.createCheckoutSession);
exports.paymentsRouter.route("/session-status").get(authentication_middleware_1.default, payment_1.retrieveSessionStatus);
exports.paymentsRouter.route("/create-payment-intent").post(authentication_middleware_1.default, payment_1.createPaymentIntent);
//# sourceMappingURL=payment.js.map