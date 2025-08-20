"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var review_1 = require("../application/review");
var reviewRouter = express_1.default.Router();
reviewRouter.route("/").post(review_1.createReview);
exports.default = reviewRouter;
//# sourceMappingURL=review.js.map