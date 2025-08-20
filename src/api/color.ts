 import express from "express";
import {
  getAllColors,
  createColor,
  getColorById,
  deleteColorById,
  updateColorById,
} from "../application/color";
import isAuthenticated from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

const colorRouter = express.Router();

// GET /api/colors
colorRouter.get("/", getAllColors);

// POST /api/colors  (protected)
colorRouter.post("/", isAuthenticated, isAdmin, createColor);

// /api/colors/:id
colorRouter
  .route("/:id")
  .get(getColorById)
  .put(isAuthenticated, isAdmin, updateColorById)
  .delete(isAuthenticated, isAdmin, deleteColorById);

export default colorRouter;

