import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    
    // productId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Product",
    //     required: true,
    // },
})

const Review = mongoose.model("Review", reviewSchema);

export default Review;



