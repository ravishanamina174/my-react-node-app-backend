import express from "express";
import { createOrder , getOrder } from "./../application/order";
import isAuthenticated from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";
import Order from "../infrastructure/db/entities/Order";

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
let clerkClient: any;
let getAuth: any;

if (isClerkAvailable()) {
  try {
    const clerk = require("@clerk/express");
    clerkClient = clerk.clerkClient;
    getAuth = clerk.getAuth;
  } catch (error) {
    console.log("Clerk import failed, using fallback authentication");
  }
} else {
    console.log("Clerk not available, using fallback authentication");
}

export  const orderRouter = express.Router();

orderRouter.route("/").post(isAuthenticated,createOrder);

// Debug endpoint to test orders without authentication
orderRouter.get("/debug/all", async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate({ 
        path: "orderItems.product", 
        select: "name images image stock price" 
      })
      .sort({ createdAt: -1 })
      .lean();

    // Transform orders to match frontend expectations
    const transformedOrders = orders.map((order: any) => {
      // Transform orderItems to ensure product data is available
      const transformedOrderItems = order.orderItems.map((item: any) => ({
        _id: item._id,
        product: item.product || {
          _id: item.product,
          name: item.name,
          price: item.price,
          images: []
        },
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));

      return {
        ...order,
        orderItems: transformedOrderItems,
        // Calculate total for verification
        calculatedTotal: order.orderItems.reduce((sum: number, item: any) => {
          return sum + (item.price * item.quantity);
        }, 0),
        totalMatches: Math.abs(order.totalAmount - order.orderItems.reduce((sum: number, item: any) => {
          return sum + (item.price * item.quantity);
        }, 0)) < 0.01
      };
    });

    res.json({ 
      success: true, 
      count: transformedOrders.length,
      orders: transformedOrders
    });
  } catch (error) {
    next(error);
  }
});





// Temporary test endpoint for specific user orders
orderRouter.get("/debug/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.find({ user: userId }) // Changed from userId to user
      .populate({ 
        path: "orderItems.product", 
        select: "name images image stock price" 
      })
      .sort({ createdAt: -1 })
      .lean();

    // Transform orders to match frontend expectations
    const transformedOrders = orders.map((order: any) => {
      // Transform orderItems to ensure product data is available
      const transformedOrderItems = order.orderItems.map((item: any) => ({
        _id: item._id,
        product: item.product || {
          _id: item.product,
          name: item.name,
          price: item.price,
          images: []
        },
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));

      return {
        ...order,
        orderItems: transformedOrderItems,
        // Calculate total for verification
        calculatedTotal: order.orderItems.reduce((sum: number, item: any) => {
          return sum + (item.price * item.quantity);
        }, 0),
        totalMatches: Math.abs(order.totalAmount - order.orderItems.reduce((sum: number, item: any) => {
          return sum + (item.price * item.quantity);
        }, 0)) < 0.01
      };
    });

    res.json({ 
      success: true, 
      userId,
      count: transformedOrders.length,
      orders: transformedOrders
    });
  } catch (error) {
    next(error);
  }
});

//getUserOrders
// GET /api/orders/myorders
orderRouter.get("/myorders", isAuthenticated, async (req, res, next) => {
  try {
    console.log("myorders endpoint called");
    console.log("req.auth:", req.auth);
    console.log("req.userId:", (req as any).userId);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    
    let userId;
    
    // Try to get userId from Clerk if available
    if (getAuth) {
      try {
        const auth = getAuth(req);
        userId = auth.userId;
        console.log("Got userId from Clerk:", userId);
      } catch (error) {
        console.log("Clerk getAuth failed, using fallback");
      }
    }
    
    // Fallback for development mode or when Clerk is not available
    if (!userId) {
      userId = (req as any).userId;
      console.log("Using fallback userId:", userId);
    }
    
    // In development mode, if we have a mock userId, return all orders
    if (process.env.NODE_ENV !== "production" && userId === "dev_user_123") {
      console.log("Development mode: returning all orders for mock user");
      const allOrders = await Order.find({})
        .populate({ 
          path: "orderItems.product", 
          select: "name images image stock price" 
        })
        .sort({ createdAt: -1 })
        .lean();

      // Transform orders to match frontend expectations
      const transformedOrders = allOrders.map((order: any) => {
        // Transform orderItems to ensure product data is available
        const transformedOrderItems = order.orderItems.map((item: any) => ({
          _id: item._id,
          product: item.product || {
            _id: item.product,
            name: item.name,
            price: item.price,
            images: []
          },
          quantity: item.quantity,
          price: item.price,
          name: item.name
        }));

        return {
          ...order,
          orderItems: transformedOrderItems
        };
      });

      const groups = groupByDate(transformedOrders as any[]);
      return res.json({ 
        success: true, 
        orders: transformedOrders, 
        groups,
        message: "Development mode: returning all orders for mock user"
      });
    }
    
    if (!userId) {
      return res.json({ success: true, orders: [] });
    }

    // For production or real users, only return their own orders
    const orders = await Order.find({ user: userId }) // Changed from userId to user
      .populate({ 
        path: "orderItems.product", 
        select: "name images image stock price" 
      })
      .sort({ createdAt: -1 })
      .lean();

    // Transform orders to match frontend expectations
    const transformedOrders = orders.map((order: any) => {
      // Transform orderItems to ensure product data is available
      const transformedOrderItems = order.orderItems.map((item: any) => ({
        _id: item._id,
        product: item.product || {
          _id: item.product,
          name: item.name,
          price: item.price,
          images: []
        },
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));

      return {
        ...order,
        orderItems: transformedOrderItems
      };
    });

    // Frontend expects flat array; include optional grouped format too
    const groups = groupByDate(transformedOrders as any[]);
    return res.json({ success: true, orders: transformedOrders, groups });
  } catch (error) {
    console.log("Error in myorders:", error);
    next(error);
  }
});

// GET /api/orders/allorders
orderRouter.get("/allorders", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const rawOrders = await Order.find({})
      .populate({ 
        path: "orderItems.product", 
        select: "name images image stock price" 
      })
      .sort({ createdAt: -1 })
      .lean();

    const clerkEnabled = Boolean(process.env.CLERK_SECRET_KEY && process.env.NODE_ENV === "production");
    let userMap: Record<string, { firstName: string; lastName: string }> = {};
    
    if (clerkEnabled && clerkClient) {
      const uniqueUserIds = Array.from(new Set(rawOrders.map(o => o.user).filter(Boolean)));
      const userEntries = await Promise.all(
        uniqueUserIds.map(async (id) => {
          try {
            const u = await clerkClient.users.getUser(String(id));
            return [id, { firstName: u.firstName || "", lastName: u.lastName || "" }] as const;
          } catch {
            return [id, { firstName: "", lastName: "" }] as const;
          }
        })
      );
      userMap = Object.fromEntries(userEntries);
    }

    const orders = rawOrders.map((o: any) => {
      // Transform orderItems to ensure product data is available
      const transformedOrderItems = o.orderItems.map((item: any) => ({
        _id: item._id,
        product: item.product || {
          _id: item.product,
          name: item.name,
          price: item.price,
          images: []
        },
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));

      // Calculate total for this order (should match totalAmount)
      let calculatedTotal = 0;
      if (o.orderItems && o.orderItems.length > 0) {
        calculatedTotal = o.orderItems.reduce((sum: number, item: any) => {
          return sum + (item.price * item.quantity);
        }, 0);
      }

      return {
        ...o,
        user: clerkEnabled ? userMap[String(o.user)] || { firstName: "", lastName: "" } : (o.user || { firstName: "", lastName: "" }),
        orderItems: transformedOrderItems,
        calculatedTotal: calculatedTotal,
        totalMatches: Math.abs(o.totalAmount - calculatedTotal) < 0.01
      };
    });

    const groups = groupByDate(orders as any[]);
    return res.json({ success: true, orders, groups });
  } catch (error) {
    next(error);
  }
});

// Parameterized route must come LAST
orderRouter.route("/:id").get(getOrder);

function groupByDate(orders: any[]) {
  const map = new Map<string, any[]>();
  for (const o of orders) {
    const d = new Date(o.createdAt);
    const key = d.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(o);
  }
  map.forEach((list) => list.sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt)));
  const entries: Array<[string, any[]]> = Array.from(map.entries());
  entries.sort(([aDate], [bDate]) => +new Date(bDate) - +new Date(aDate));
  return entries.map(([date, group]) => ({ date, orders: group }));
}