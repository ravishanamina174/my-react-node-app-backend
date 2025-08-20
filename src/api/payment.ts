import express from "express";
import {
  createCheckoutSession,
  retrieveSessionStatus,
  createPaymentIntent
} from "../application/payment";
import isAuthenticated from "./middleware/authentication-middleware";

export const paymentsRouter = express.Router();

paymentsRouter.route("/create-checkout-session").post(isAuthenticated, createCheckoutSession);
paymentsRouter.route("/session-status").get(isAuthenticated, retrieveSessionStatus);
paymentsRouter.route("/create-payment-intent").post(isAuthenticated, createPaymentIntent);