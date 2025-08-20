import Product from "../infrastructure/db/entities/Product";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";

import { Request, Response, NextFunction } from "express";
import { CreateProductDTO } from "../domain/dto/Product";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import S3 from "../infrastructure/s3";
import stripe from "../infrastructure/stripe";
import Category from "../infrastructure/db/entities/Category";

const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("GET /api/products", req.query);
    const categoryId = req.query.categoryId;
    if (categoryId) {
      const products = await Product.find({ categoryId });
      console.log("products count (filtered)", products.length);
      res.json(products);
    } else {
      const products = await Product.find();
      console.log("products count", products.length);
      res.json(products);
    }
  } catch (error) {
    next(error);
  }
};

const getProductsForSearchQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search } = req.query;
    const results = await Product.aggregate([
      {
        $search: {
          index: "default",
          autocomplete: {
            path: "name",
            query: search,
            tokenOrder: "any",
            fuzzy: {
              maxEdits: 1,
              prefixLength: 2,
              maxExpansions: 256,
            },
          },
          highlight: {
            path: "name",
          },
        },
      },
    ]);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = CreateProductDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    const stripeProduct = await stripe.products.create({
      name: result.data.name,
      description: result.data.description,
      default_price_data: {
        currency: "usd",
        unit_amount: result.data.price * 100,
      },
    });

    await Product.create({ ...result.data, stripePriceId: stripeProduct.default_price });
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews");
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const updateProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const { fileType } = body;

    const id = randomUUID();

    const url = await getSignedUrl(
      S3,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: id,
        ContentType: fileType,
      }),
      {
        expiresIn: 60,
      }
    );

    res.status(200).json({
      url,
      publicURL: `${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${id}`,
    });
  } catch (error) {
    next(error);
  }
};

const getShopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, categoryId, color, sort, limit = 50, page = 1 } = req.query;
    
    // Build filter object
    let filter: any = {};
    
    // Filter by category (supports both slug and direct categoryId)
    if (categoryId) {
      // Direct categoryId parameter
      filter.categoryId = categoryId;
    } else if (category && category !== 'all') {
      // Category slug parameter
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filter.categoryId = categoryDoc._id;
      }
    }
    
    // Filter by color
    if (color && color !== 'all') {
      filter.colorId = color;
    }
    
    // Build sort object
    let sortObj: any = {};
    if (sort === 'price-asc') {
      sortObj.price = 1;
    } else if (sort === 'price-desc') {
      sortObj.price = -1;
    } else {
      sortObj.createdAt = -1; // Default sort by newest
    }
    
    // Pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Execute query with population
    const products = await Product.find(filter)
      .populate('categoryId', 'name slug')
      .populate('colorId', 'name hex')
      .sort(sortObj)
      .limit(parseInt(limit as string))
      .skip(skip);
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(totalProducts / parseInt(limit as string)),
        totalProducts,
        hasNext: skip + products.length < totalProducts,
        hasPrev: parseInt(page as string) > 1
      }
    });
    
  } catch (error) {
    next(error);
  }
};

export {
  createProduct,
  deleteProductById,
  getAllProducts,
  getProductById,
  updateProductById,
  getProductsForSearchQuery,
  uploadProductImage,
  getShopProducts,
};
