import mongoose from "mongoose";

// فونكسيون باش نكنكتيو على قاعدة البيانات MongoDB
const connectmongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database Connected !!");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectmongo;
