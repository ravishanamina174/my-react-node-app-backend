"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var validation_error_1 = __importDefault(require("../../domain/errors/validation-error"));
var not_found_error_1 = __importDefault(require("../../domain/errors/not-found-error"));
var unauthorized_error_1 = __importDefault(require("../../domain/errors/unauthorized-error"));
var globalErrorHandlingMiddleware = function (err, req, res, next) {
    // Log the full error for debugging in development
    // Do not leak internals to clients; keep responses minimal
    // eslint-disable-next-line no-console
    console.error("Unhandled error:", err);
    var message = (err === null || err === void 0 ? void 0 : err.message) || "Internal server error";
    if (err instanceof validation_error_1.default) {
        res.status(400).json({ message: message });
    }
    else if (err instanceof not_found_error_1.default) {
        res.status(404).json({ message: message });
    }
    else if (err instanceof unauthorized_error_1.default) {
        res.status(401).json({ message: message });
    }
    else {
        res.status(500).json({ message: message });
    }
};
exports.default = globalErrorHandlingMiddleware;
//# sourceMappingURL=global-error-handling-middleware.js.map