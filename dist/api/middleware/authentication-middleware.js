"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var unauthorized_error_1 = __importDefault(require("../../domain/errors/unauthorized-error"));
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
        console.log("Clerk import failed in auth middleware");
    }
}
var isAuthenticated = function (req, res, next) {
    console.log("Authentication middleware called");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("req.auth:", req.auth);
    console.log("req.userId:", req.userId);
    // In development mode, always allow requests to pass
    if (process.env.NODE_ENV !== "production") {
        // For development, set a mock userId if none exists
        if (!req.userId) {
            req.userId = "dev_user_123";
        }
        console.log("Development mode: allowing unauthenticated request with userId:", req.userId);
        return next();
    }
    // Production mode: check for proper authentication
    if (!(req === null || req === void 0 ? void 0 : req.auth)) {
        //! req.auth will only be defined if the request sends a valid session token
        throw new unauthorized_error_1.default("Unauthorized");
    }
    // clerkClient.users.updateUser(req.auth.userId, {
    //   publicMetadata: {
    //   },
    // });
    //! By calling req.auth() or passing the request to getAuth() we can get the auth data from the request
    //! userId can be obtained from the auth object
    // console.log(req.auth());
    // console.log(getAuth(req));
    next();
};
exports.default = isAuthenticated;
//# sourceMappingURL=authentication-middleware.js.map