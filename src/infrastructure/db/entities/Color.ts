import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
  colors: { 
    type: String,
    required: true 
  },
  hex: { 
    type: String,
    required: true 
  },
});


const Color = mongoose.model("Color", colorSchema);

export default Color;
