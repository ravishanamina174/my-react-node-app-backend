import mongoose from "mongoose"

const ItemSchema = new mongoose.Schema ({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true ,
    },
    quantity:{
        type: Number,
        required: true 
    }
}) ; 

const OrderSchema = new mongoose.Schema({
    userId: {type: String , required: true},
    item: {
      type:  [ItemSchema],
      required: true
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true,
    },
    orderStatus:{
        type: String,
        enum: ["PENDING", "SHIPPED", "FULFILLED", "CANCELLED"],
        default: "PENDING",
        required: true,
    },
    paymentMethod:{
        type: String,
        enum: ["COD", "CREDIT CARD"],
        default: "CREDIT CARD",  
    },
    paymentStatus:{
        type: String,
        enum: ["PENDING", "PAID","REFUNDED"],
        default: "PENDING",
        required: true,
    },
});

 const Order = mongoose.model("Order" , OrderSchema);

 export default Order ;