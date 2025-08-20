import { z } from "zod";

// Shipping Address Validation Schema
export const ShippingAddressSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less")
    .trim(),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less")
    .trim(),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email")
    .max(100, "Email must be 100 characters or less")
    .trim()
    .toLowerCase(),
  phone: z.string()
    .min(1, "Phone is required")
    .max(15, "Phone must be 15 characters or less")
    .trim(),
  line_1: z.string()
    .min(1, "Address line 1 is required")
    .max(100, "Address line 1 must be 100 characters or less")
    .trim(),
  line_2: z.string()
    .max(100, "Address line 2 must be 100 characters or less")
    .trim()
    .optional(),
  city: z.string()
    .min(1, "City is required")
    .max(50, "City must be 50 characters or less")
    .trim(),
  state: z.string()
    .min(1, "State is required")
    .max(50, "State must be 50 characters or less")
    .trim(),
  postalCode: z.string()
    .min(1, "Postal code is required")
    .max(20, "Postal code must be 20 characters or less")
    .trim(),
  country: z.string()
    .min(1, "Country is required")
    .max(50, "Country must be 50 characters or less")
    .trim()
    .default("US")
});

// Order Item Validation Schema (for creation - frontend sends productId)
export const OrderItemSchema = z.object({
  productId: z.string() // Frontend sends productId, we'll transform to product
    .min(1, "Product ID is required")
    .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
      message: "Invalid MongoDB ObjectId format"
    }),
  quantity: z.number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),
  price: z.number()
    .positive("Price must be greater than 0"),
  name: z.string()
    .min(1, "Product name is required")
    .trim()
});

// Order Item Schema (for database - uses product reference)
export const OrderItemDBSchema = z.object({
  product: z.string() // MongoDB ObjectId reference
    .min(1, "Product reference is required")
    .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
      message: "Invalid MongoDB ObjectId format"
    }),
  quantity: z.number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),
  price: z.number()
    .positive("Price must be greater than 0"),
  name: z.string()
    .min(1, "Product name is required")
    .trim()
});

// Complete Order Validation Schema (for creation)
export const CreateOrderSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  orderItems: z.array(OrderItemSchema)
    .min(1, "Order must contain at least one item"),
  totalAmount: z.number()
    .positive("Total amount must be greater than 0"),
  orderStatus: z.string().optional(),
  paymentStatus: z.string().optional()
});

// Response Schema for successful order creation
export const OrderResponseSchema = z.object({
  _id: z.string(),
  user: z.string(),
  shippingAddress: ShippingAddressSchema,
  orderItems: z.array(OrderItemDBSchema),
  totalAmount: z.number(),
  status: z.string(),
  paymentStatus: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Error Response Schema
export const ValidationErrorResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string()
  }))
});

// Type exports
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderItemDB = z.infer<typeof OrderItemDBSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
export type ValidationErrorResponse = z.infer<typeof ValidationErrorResponseSchema>;

// Validation functions
export const validateCreateOrder = (data: unknown): CreateOrderRequest => {
  return CreateOrderSchema.parse(data);
};

export const validateShippingAddress = (data: unknown): ShippingAddress => {
  return ShippingAddressSchema.parse(data);
};

export const validateOrderItems = (data: unknown): OrderItem[] => {
  return z.array(OrderItemSchema).parse(data);
};

// Helper function to calculate total from order items
export const calculateOrderTotal = (orderItems: OrderItem[]): number => {
  return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Helper function to validate total amount matches order items
export const validateTotalAmount = (totalAmount: number, orderItems: OrderItem[]): boolean => {
  const calculatedTotal = calculateOrderTotal(orderItems);
  return Math.abs(totalAmount - calculatedTotal) < 0.01; // Allow for floating point precision
};
