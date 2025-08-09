import Product from "../infrastructure/db/entities/Product";
import Review from "../infrastructure/db/entities/Review";

import { NextFunction, Request, Response } from "express";

const createReview = async (req:Request, res:Response , next:NextFunction) => {
  try {
    const data = req.body;
    const review = await Review.create({
      review: data.review,
      rating: data.rating,
    });

    const product = await Product.findById(data.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    product.reviews.push(review._id);
    await product.save();

    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export { createReview };
