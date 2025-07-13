import mongoose from "mongoose";

const connectDB = async () => {
    try {
       const MONGODB_URL = process.env.MONGODB_URL;
     if (!MONGODB_URL) { 
        throw new Error("mongodb connection string is not defined");
     }
     await mongoose.connect(MONGODB_URL);

     
     console.log("connected to the database");
    } catch (error) {
        if (error instanceof Error) {  
            console.error("mongodb connection failed", error.message);
            process.exit(1);
        }
    }
};

export  {connectDB};


