import { NextFunction, Request, Response } from "express";
import Order from "../infrastructure/db/entities/Order";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import ValidationError from "../domain/errors/validation-error";
import { 
  validateCreateOrder, 
  validateTotalAmount, 
  CreateOrderRequest,
  ValidationErrorResponse 
} from "../domain/validation/order-validation";

// Check if Clerk is available without importing it
const isClerkAvailable = () => {
  try {
    require.resolve("@clerk/express");
    return true;
  } catch {
    return false;
  }
};

// Only import Clerk if it's available
let getAuth: any;

if (isClerkAvailable()) {
  try {
    const clerk = require("@clerk/express");
    getAuth = clerk.getAuth;
  } catch (error) {
    console.log("Clerk import failed in application layer");
  }
}

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    
    // Get userId from the authenticated request (set by middleware)
    const userId = (req as any).userId;
    
    console.log("=== Order Creation Debug ===");
    console.log("Request userId:", userId);
    console.log("Request body:", JSON.stringify(data, null, 2));
    console.log("Request headers:", req.headers);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    
    if (!userId) {
      console.log("No userId found in request");
      throw new UnauthorizedError("User not authenticated");
    }

    console.log("Creating order for userId:", userId);

    // Validate the request data using Zod schema
    let validatedData: CreateOrderRequest;
    try {
      validatedData = validateCreateOrder(data);
    } catch (validationError: any) {
      // Convert Zod validation errors to our expected format
      const details: Array<{ field: string; message: string }> = [];
      
      if (validationError.errors) {
        validationError.errors.forEach((err: any) => {
          details.push({
            field: err.path.join('.'),
            message: err.message
          });
        });
      }
      
      return res.status(400).json({
        error: "Validation failed",
        details: details
      } as ValidationErrorResponse);
    }

    // Additional validation: check if total amount matches order items
    if (!validateTotalAmount(validatedData.totalAmount, validatedData.orderItems)) {
      const calculatedTotal = validatedData.orderItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      return res.status(400).json({
        error: "Validation failed",
        details: [{
          field: "totalAmount",
          message: `Total amount (${validatedData.totalAmount}) must match sum of order items (${calculatedTotal})`
        }]
      } as ValidationErrorResponse);
    }

    // Transform orderItems to use 'product' instead of 'productId'
    const transformedOrderItems = validatedData.orderItems.map(item => ({
      product: item.productId, // Map productId to product
      quantity: item.quantity,
      price: item.price,
      name: item.name
    }));

    // Create order with validated data
    const order = await Order.create({
      user: userId, // Changed from userId to user
      orderItems: transformedOrderItems,
      shippingAddress: validatedData.shippingAddress,
      totalAmount: validatedData.totalAmount,
      status: validatedData.orderStatus || "pending", // Changed from orderStatus to status
      paymentStatus: validatedData.paymentStatus || "pending",
    });

    // Populate the created order with related data
    const populatedOrder = await Order.findById(order._id)
      .populate({ 
        path: "orderItems.product", // Changed from orderItems.productId
        select: "name images image stock price" 
      })
      .lean();

    res.status(201).json({
      success: true,
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get userId from the authenticated request (set by middleware)
    const userId = (req as any).userId;
    
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const orderId = req.params.id;

    console.log(`Getting order ${orderId} for userId: ${userId}`);

    const order = await Order.findById(orderId)
      .populate({ 
        path: "orderItems.product", // Changed from orderItems.productId
        select: "name images image stock price" 
      })
      .lean();

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Ensure user can only access their own orders
    if (order.user !== userId) { // Changed from userId to user
      throw new UnauthorizedError("Unauthorized - cannot access another user's order");
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

export { createOrder, getOrder };
