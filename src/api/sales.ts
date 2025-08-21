import express from "express";
import isAuthenticated from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";
import Order from "../infrastructure/db/entities/Order";
import Product from "../infrastructure/db/entities/Product";
import Category from "../infrastructure/db/entities/Category";

export const salesRouter = express.Router();

// Helper function to generate date range
const generateDateRange = (days: number) => {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
  }
  
  return dates;
};

// Helper function to create empty daily data structure
const createEmptyDailyData = (dates: string[], categories: string[]) => {
  return dates.map(date => {
    const dayData: any = { day: date };
    categories.forEach(category => {
      dayData[category] = 0;
    });
    return dayData;
  });
};

// GET /api/sales/last7days
salesRouter.get("/last7days", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dateRange = generateDateRange(7);
    
    // Get all categories for consistent data structure
    const categories = await Category.find({}, 'name').lean();
    const categoryNames = categories.map(cat => cat.name);
    
    // MongoDB aggregation pipeline for last 7 days
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "cancelled" } // Exclude cancelled orders
        }
      },
      {
        $unwind: "$orderItems"
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $lookup: {
          from: "categories",
          let: { categoryId: { $toObjectId: "$product.categoryId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$categoryId"] }
              }
            }
          ],
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            category: "$category.name"
          },
          quantity: { $sum: "$orderItems.quantity" }
        }
      },
      {
        $group: {
          _id: "$_id.day",
          categories: {
            $push: {
              category: "$_id.category",
              quantity: "$quantity"
            }
          }
        }
      }
    ];

    const result = await Order.aggregate(pipeline);
    
    // Transform the result to match expected format
    const salesData = createEmptyDailyData(dateRange, categoryNames);
    
    // Fill in actual sales data
    result.forEach((dayData: any) => {
      const dayIndex = salesData.findIndex((item: any) => item.day === dayData._id);
      if (dayIndex !== -1) {
        dayData.categories.forEach((catData: any) => {
          if (salesData[dayIndex].hasOwnProperty(catData.category)) {
            salesData[dayIndex][catData.category] = catData.quantity;
          }
        });
      }
    });

    res.json({
      success: true,
      data: salesData
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/sales/last30days
salesRouter.get("/last30days", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateRange = generateDateRange(30);
    
    // Get all categories for consistent data structure
    const categories = await Category.find({}, 'name').lean();
    const categoryNames = categories.map(cat => cat.name);
    
    // MongoDB aggregation pipeline for last 30 days
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "cancelled" } // Exclude cancelled orders
        }
      },
      {
        $unwind: "$orderItems"
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $lookup: {
          from: "categories",
          let: { categoryId: { $toObjectId: "$product.categoryId" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$categoryId"] }
              }
            }
          ],
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            category: "$category.name"
          },
          quantity: { $sum: "$orderItems.quantity" }
        }
      },
      {
        $group: {
          _id: "$_id.day",
          categories: {
            $push: {
              category: "$_id.category",
              quantity: "$quantity"
            }
          }
        }
      }
    ];

    const result = await Order.aggregate(pipeline);
    
    // Transform the result to match expected format
    const salesData = createEmptyDailyData(dateRange, categoryNames);
    
    // Fill in actual sales data
    result.forEach((dayData: any) => {
      const dayIndex = salesData.findIndex((item: any) => item.day === dayData._id);
      if (dayIndex !== -1) {
        dayData.categories.forEach((catData: any) => {
          if (salesData[dayIndex].hasOwnProperty(catData.category)) {
            salesData[dayIndex][catData.category] = catData.quantity;
          }
        });
      }
    });

    res.json({
      success: true,
      data: salesData
    });

  } catch (error) {
    next(error);
  }
});

export default salesRouter;
