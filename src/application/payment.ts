import { Request, Response } from "express";
import util from "util";
import Order from "../infrastructure/db/entities/Order";
import stripe from "../infrastructure/stripe";
import Product from "../infrastructure/db/entities/Product";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

interface Product {
  _id: string;
  stock: number;
  stripePriceId: string;
  name: string;
}

async function fulfillCheckout(sessionId: string) {
  // Set your secret key. Remember to switch to your live secret key in production.
  // See your keys here: https://dashboard.stripe.com/apikeys
  console.log("Fulfilling Checkout Session " + sessionId);

  // Make this function safe to run multiple times,
  // even concurrently, with the same session ID

  // Make sure fulfillment hasn't already been
  // peformed for this Checkout Session

  // Retrieve the Checkout Session from the API with line_items expanded
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  console.log(
    util.inspect(checkoutSession, false, null, true /* enable colors */)
  );

  const order = await Order.findById(
    checkoutSession.metadata?.orderId
  ).populate<{
    orderItems: { product: Product; quantity: number }[];
  }>("orderItems.product");
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentStatus !== "pending") {
    throw new Error("Payment is not pending");
  }

  if (order.status !== "pending") {
    throw new Error("Order is not pending");
  }

  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be peformed
  if (checkoutSession.payment_status !== "unpaid") {
    //  Perform fulfillment of the line items
    //  Record/save fulfillment status for this
    order.orderItems.forEach(async (item) => {
      const product = item.product;
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    });

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: "paid",
      status: "processing",
    });
  }
}

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;
    
    // Get userId from the authenticated request (set by middleware)
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    if (!orderId || !amount) {
      return res.status(400).json({ error: "orderId and amount are required" });
    }
    
    // Validate amount is a positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number in cents" });
    }
    
    // Find the order and ensure it belongs to the user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    if (order.user.toString() !== userId) { // Changed from userId to user
      return res.status(403).json({ error: "Unauthorized - cannot access another user's order" });
    }
    
    // Check if order is in pending status
    if (order.paymentStatus !== "pending") { // Changed from PENDING to pending
      return res.status(400).json({ error: "Order is not in pending status" });
    }
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // in cents
      currency: 'usd',
      metadata: {
        orderId: orderId
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Update order with payment intent ID
    await Order.findByIdAndUpdate(orderId, {
      paymentIntentId: paymentIntent.id,
      paymentStatus: "pending"
    });
    
    // Return client secret to frontend
    res.json({
      clientSecret: paymentIntent.client_secret
    });
    
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: "Failed to create payment intent",
      details: error.message 
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    
    // Handle checkout session events (existing functionality)
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillCheckout(event.data.object.id);
      res.status(200).send();
      return;
    }
    
    // Handle payment intent events (new functionality)
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;
      
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
          status: "processing" // Changed from CONFIRMED to processing
        });
        console.log(`Order ${orderId} payment succeeded`);
      }
      
      res.status(200).send();
      return;
    }
    
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;
      
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "failed" // Changed from FAILED to failed
        });
        console.log(`Order ${orderId} payment failed`);
      }
      
      res.status(200).send();
      return;
    }
    
    // For other events, just acknowledge receipt
    res.status(200).send();
    
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  const orderId = req.body.orderId;
  console.log("body", req.body);
  
  // Get userId from the authenticated request (set by middleware)
  const userId = (req as any).userId;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const order = await Order.findById(orderId).populate<{
    orderItems: { product: Product; quantity: number }[];
  }>("orderItems.product");

  if (!order) {
    throw new Error("Order not found");
  }
  
  // Ensure user can only access their own orders
  if (order.user !== userId) { // Changed from userId to user
    throw new Error("Unauthorized - cannot access another user's order");
  }
  
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: order.orderItems.map((item) => ({
      price: item.product.stripePriceId,
      quantity: item.quantity,
    })),
    mode: "payment",
    return_url: `${FRONTEND_URL}/shop/complete?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      orderId: req.body.orderId,
    },
  });

  res.send({ clientSecret: session.client_secret });
};

export const retrieveSessionStatus = async (req: Request, res: Response) => {
  // Get userId from the authenticated request (set by middleware)
  const userId = (req as any).userId;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const checkoutSession = await stripe.checkout.sessions.retrieve(
    req.query.session_id as string
  );

  const order = await Order.findById(checkoutSession.metadata?.orderId);
  if (!order) {
    throw new Error("Order not found");
  }
  
  // Ensure user can only access their own orders
  if (order.user !== userId) { // Changed from userId to user
    throw new Error("Unauthorized - cannot access another user's order");
  }
  
  res.send({
    status: checkoutSession.status,
    customer_email: checkoutSession.customer_details?.email,
  });
};
