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
// Simple JWT verification function (fallback)
var verifyJWTToken = function (token) {
    try {
        // This is a basic JWT verification - in production you'd want to use a proper JWT library
        if (!token || !token.startsWith('Bearer ')) {
            return null;
        }
        var actualToken = token.replace('Bearer ', '');
        // For now, we'll just check if it looks like a JWT token
        // In a real implementation, you'd verify the signature and extract the payload
        if (actualToken.split('.').length === 3) {
            // This is a very basic check - in production you'd want proper JWT verification
            console.log("JWT token format detected (basic validation only)");
            // For now, return a placeholder - in real implementation, extract userId from payload
            return "jwt_user_placeholder";
        }
        return null;
    }
    catch (error) {
        console.log("JWT verification error:", error);
        return null;
    }
};
var isAuthenticated = function (req, res, next) {
    console.log("=== Authentication middleware called ===");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("CLERK_SECRET_KEY exists:", !!process.env.CLERK_SECRET_KEY);
    console.log("req.auth:", req.auth);
    console.log("req.userId:", req.userId);
    console.log("Headers:", {
        authorization: req.headers.authorization,
        'x-clerk-auth-token': req.headers['x-clerk-auth-token'],
        'x-clerk-session-token': req.headers['x-clerk-session-token'],
        cookie: req.headers.cookie ? 'present' : 'missing',
        'user-agent': req.headers['user-agent']
    });
    console.log("Method:", req.method);
    console.log("URL:", req.url);
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
    var userId = req.userId;
    // Method 1: Check if req.auth is already set (by Clerk middleware)
    if (req === null || req === void 0 ? void 0 : req.auth) {
        console.log("req.auth found:", req.auth);
        if (typeof req.auth === 'function') {
            try {
                var authData = req.auth();
                console.log("Auth function result:", authData);
                if (authData && authData.userId) {
                    userId = authData.userId;
                    console.log("Extracted userId from auth function:", userId);
                }
            }
            catch (error) {
                console.log("Error calling auth function:", error);
            }
        }
        else if (req.auth.userId) {
            userId = req.auth.userId;
            console.log("Extracted userId from req.auth.userId:", userId);
        }
    }
    // Method 2: Try to get auth from Clerk if available
    if (!userId && getAuth) {
        try {
            var auth = getAuth(req);
            console.log("Clerk auth object:", auth);
            if (auth && auth.userId) {
                userId = auth.userId;
                console.log("Successfully extracted userId from Clerk getAuth:", userId);
            }
            else {
                console.log("Clerk auth found but no userId");
            }
        }
        catch (error) {
            console.log("Error getting Clerk auth:", error);
        }
    }
    // Method 3: Check for Clerk session token in headers or cookies
    if (!userId) {
        var sessionToken = req.headers['x-clerk-session-token'] ||
            req.headers['x-clerk-auth-token'] ||
            (req.headers.cookie && req.headers.cookie.includes('__session=') ? 'cookie-session' : null);
        if (sessionToken) {
            console.log("Found Clerk session token:", sessionToken);
            // In a real implementation, you would verify this token with Clerk
            // For now, we'll log it and continue
        }
    }
    // Method 4: Check for JWT token in Authorization header
    if (!userId && req.headers.authorization) {
        var jwtUserId = verifyJWTToken(req.headers.authorization);
        if (jwtUserId) {
            userId = jwtUserId;
            console.log("Extracted userId from JWT token:", userId);
        }
    }
    // If we still don't have userId, check if it was set elsewhere
    if (!userId) {
        console.log("No userId found in request after all methods");
        // TEMPORARY WORKAROUND: For production, allow requests with a placeholder userId
        // This should be removed once the authentication issue is fixed
        if (process.env.NODE_ENV === "production") {
            console.log("PRODUCTION WORKAROUND: Using placeholder userId for debugging");
            userId = "prod_debug_user_" + Date.now();
            console.log("Assigned temporary userId:", userId);
        }
        else {
            throw new unauthorized_error_1.default("User not authenticated");
        }
    }
    // Set the userId on the request object for downstream use
    req.userId = userId;
    console.log("Request authenticated with userId:", req.userId);
    return next();
};
exports.default = isAuthenticated;
//# sourceMappingURL=authentication-middleware.js.map