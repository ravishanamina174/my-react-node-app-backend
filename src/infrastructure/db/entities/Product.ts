import mongoose from "mongoose";




const productSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: { 
     type: String,
      required: true
    },
  image: {
      type: String,
      required: true,
    },
    stock:{
      type: Number,
      required: true
    },  
  price: { 
    type: Number, 
    required: true
    },
  reviews: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Review",
    default: [],           // required: true,
  }

});

const Product = mongoose.model("Product", productSchema);

export default Product;