import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGODB_URL =
      process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/test";
    await mongoose.connect(MONGODB_URL);
    console.log("connected to the database");
  } catch (error) {
    if (error instanceof Error) {
      console.error("mongodb connection failed", error.message);
    }
  }
};

export  {connectDB};


