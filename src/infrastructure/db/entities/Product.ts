import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stripePriceId: {
    type: String,
    required: true,
  },
  // Legacy single image field (optional for backward compatibility)
  image: {
    type: String,
    required: false,
  },
  // New images array field (primary field for multiple images)
  images: {
    type: [String],
    required: false,
    default: [],
    validate: {
      validator: function(images: string[]) {
        return images.length > 0;
      },
      message: 'At least one image is required'
    }
  },
  stock: {
    type: Number,
    required: true,
  },
  // reviews: {
  //   type: [mongoose.Schema.Types.ObjectId],
  //   ref: "Review",
  //   default: [],
  //   required: false,
  // },
  colorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Color",
    required: false,
  },
  // colors: {
  //   type: [mongoose.Schema.Types.ObjectId],
  //   ref: "Color",
  //   default: [],
  //   required: false,
  // },
});

const Product = mongoose.model("Product", productSchema);

export default Product;