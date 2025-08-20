import mongoose from "mongoose";

interface OrderDoc {
  user: mongoose.Types.ObjectId | string;
  orderItems: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    name: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    line_1: string;
    line_2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    validate: {
      validator: function(v: any) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid product ID format'
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be greater than 0'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer'
    }
  },
  price: {
    type: Number,
    required: true,
    min: [0.01, 'Price must be greater than 0']
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
});

const ShippingAddressSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true, 
    maxlength: 50,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true, 
    maxlength: 50,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    maxlength: 100,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: true, 
    maxlength: 15,
    trim: true
  },
  line_1: { 
    type: String, 
    required: true, 
    maxlength: 100,
    trim: true
  },
  line_2: { 
    type: String, 
    maxlength: 100,
    trim: true
  },
  city: { 
    type: String, 
    required: true, 
    maxlength: 50,
    trim: true
  },
  state: { 
    type: String, 
    required: true, 
    maxlength: 50,
    trim: true
  },
  postalCode: { 
    type: String, 
    required: true, 
    maxlength: 20,
    trim: true
  },
  country: { 
    type: String, 
    required: true, 
    maxlength: 50,
    trim: true,
    default: "US"
  }
});

const OrderSchema = new mongoose.Schema<OrderDoc>({
  // User reference (changed from userId to user for clarity)
  user: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true, 
    index: true 
  },

  // Order items with product reference
  orderItems: {
    type: [OrderItemSchema],
    required: true,
    validate: {
      validator: function(items: any[]) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },

  // Shipping address - required
  shippingAddress: {
    type: ShippingAddressSchema,
    required: true
  },

  // Total amount - required
  totalAmount: {
    type: Number,
    required: true,
    min: [0.01, 'Total amount must be greater than 0'],
    validate: {
      validator: function(total: number) {
        // Verify total matches sum of items
        if (this.orderItems) {
          const calculatedTotal = this.orderItems.reduce((sum: number, item: any) => {
            return sum + (item.price * item.quantity);
          }, 0);
          return Math.abs(total - calculatedTotal) < 0.01; // Allow for floating point precision
        }
        return true;
      },
      message: 'Total amount must match sum of order items'
    }
  },

  // Order status (changed from orderStatus to status)
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },

  // Payment status (changed from paymentMethod to paymentStatus)
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  
  // Stripe payment intent tracking
  paymentIntentId: {
    type: String,
    index: true,
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}, { 
  versionKey: false,
  timestamps: true 
});

// Pre-save middleware to update updatedAt
OrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;