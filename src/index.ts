import "dotenv/config";
import express from "express";
import productRouter from "./api/product";
import categoryRouter from "./api/category";
import reviewRouter from "./api/review";
import { connectDB } from "./infrastructure/db/index";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";
import cors from "cors";
import { orderRouter } from "./api/order";
import { clerkMiddleware } from "@clerk/express";
import bodyParser from "body-parser";
import colorRouter from "./api/color";

const app = express();

// Make Clerk optional when env vars are not provided
const CLERK_ENABLED = Boolean(
  process.env.CLERK_SECRET_KEY && 
  process.env.CLERK_PUBLISHABLE_KEY && 
  process.env.NODE_ENV === "production"
);

if (CLERK_ENABLED) {
  app.use(clerkMiddleware());
  console.log("Clerk middleware enabled");
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "Clerk keys not set or not in production; auth middleware disabled. Set CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY and NODE_ENV=production to enable."
  );
}
const FRONTEND_URL = process.env.FRONTEND_URL;
app.use(cors({ origin: FRONTEND_URL ? FRONTEND_URL : "*" }));

// Stripe routes are mounted only if a secret key is present
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (STRIPE_SECRET_KEY) {
  // Dynamic imports avoid crashing startup if Stripe is not configured
  import("./application/payment").then(({ handleWebhook }) => {
    app.post(
      "/api/payments/webhook",
      bodyParser.raw({ type: "application/json" }),
      handleWebhook
    );
  });
  import("./api/payment").then(({ paymentsRouter }) => {
    app.use("/api/payments", paymentsRouter);
  });
} else {
  console.warn("STRIPE_SECRET_KEY not set; payment routes disabled");
}

// Middleware to parse JSON bodies
app.use(express.json()); //It conversts the incomign json payload of a  request into a javascript object found in req.body

app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/orders", orderRouter);
app.use("/api/colors", colorRouter);
app.use(globalErrorHandlingMiddleware);

connectDB();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Simple health check for Postman / uptime checks
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Test endpoint to verify backend is working
app.get("/api/test", (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Test products endpoint (simple version)
app.get("/api/test-products", (req, res) => {
  try {
    // Return some test data
    const testProducts = [
      {
        _id: 'test1',
        name: 'Test Product 1',
        price: 100,
        categoryId: 'test-cat',
        image: 'https://via.placeholder.com/300x300',
        description: 'Test product description'
      },
      {
        _id: 'test2', 
        name: 'Test Product 2',
        price: 200,
        categoryId: 'test-cat',
        image: 'https://via.placeholder.com/300x300',
        description: 'Test product description'
      }
    ];
    
    res.json({
      success: true,
      data: testProducts,
      message: 'Test products loaded successfully'
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Backend error',
      error: error.message
    });
  }
});

// Test orders endpoint to verify orders API
app.get("/api/test-orders", async (req, res) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ success: false, message: "Endpoint not found" });
  }
  
  try {
    const Order = (await import("./infrastructure/db/entities/Order")).default;
    const Address = (await import("./infrastructure/db/entities/Address")).default;
    
    // Get total counts
    const orderCount = await Order.countDocuments();
    const addressCount = await Address.countDocuments();
    
    // Get a sample order
    const sampleOrder = await Order.findOne({})
      .populate({ 
        path: "items.productId", 
        select: "name images image stock price" 
      })
      .populate({ 
        path: "addressId", 
        select: "line_1 line_2 city phone" 
      })
      .lean();
    
    res.json({
      success: true,
      message: 'Orders API test successful',
      data: {
        orderCount,
        addressCount,
        sampleOrder,
        timestamp: new Date().toISOString(),
        warning: "DEVELOPMENT ONLY - This endpoint exposes order data"
      }
    });
    
  } catch (error: any) {
    console.error('Error testing orders:', error);
    res.status(500).json({
      success: false,
      message: 'Orders API test failed',
      error: error.message
    });
  }
});
