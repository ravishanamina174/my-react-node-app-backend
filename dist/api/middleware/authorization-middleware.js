"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
// import UnauthorizedError from "../../domain/errors/unauthorized-error";
var forbidden_error_1 = __importDefault(require("../../domain/errors/forbidden-error"));
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
        console.log("Clerk import failed in authorization middleware");
    }
}
var isAdmin = function (req, res, next) {
    var _a, _b;
    // In development mode, allow admin access
    if (process.env.NODE_ENV !== "production") {
        return next();
    }
    // Only check admin status if Clerk is available
    if (getAuth) {
        try {
            var auth = getAuth(req);
            var userIsAdmin = ((_b = (_a = auth.sessionClaims) === null || _a === void 0 ? void 0 : _a.metadata) === null || _b === void 0 ? void 0 : _b.role) === "admin";
            if (!userIsAdmin) {
                throw new forbidden_error_1.default("Forbidden");
            }
        }
        catch (error) {
            console.log("Clerk getAuth failed in authorization middleware");
            throw new forbidden_error_1.default("Forbidden");
        }
    }
    next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=authorization-middleware.js.map