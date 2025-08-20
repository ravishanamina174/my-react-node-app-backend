import { Request, Response, NextFunction } from "express";
import Color from "../infrastructure/db/entities/Color";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";

// Get all colors
const getAllColors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const colors = await Color.find().sort({ name: 1 });
    res.json({
      success: true,
      data: colors
    });
  } catch (error) {
    next(error);
  }
};

// Get color by ID
const getColorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      throw new NotFoundError("Color not found");
    }
    res.json(color);
  } catch (error) {
    next(error);
  }
};

// Create a new color
const createColor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, hex } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new ValidationError("Color name is required and must be a non-empty string");
    }

    if (!hex || typeof hex !== "string" || hex.trim().length === 0) {
      throw new ValidationError("Color hex code is required and must be a non-empty string");
    }

    const newColor = await Color.create({ 
      name: name.trim(), 
      hex: hex.trim() 
    });
    res.status(201).json(newColor);
  } catch (error) {
    next(error);
  }
};

// Update color by ID
const updateColorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, hex } = req.body;
    
    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      throw new ValidationError("Color name must be a non-empty string");
    }

    if (hex !== undefined && (typeof hex !== "string" || hex.trim().length === 0)) {
      throw new ValidationError("Color hex code must be a non-empty string");
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (hex !== undefined) updateData.hex = hex.trim();

    const updated = await Color.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updated) {
      throw new NotFoundError("Color not found");
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete color by ID
const deleteColorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedColor = await Color.findByIdAndDelete(req.params.id);
    if (!deletedColor) {
      throw new NotFoundError("Color not found");
    }
    res.status(200).json({ message: "Color deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { getAllColors, getColorById, createColor, updateColorById, deleteColorById };
