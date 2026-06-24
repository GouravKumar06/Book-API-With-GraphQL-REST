const dotenv = require('dotenv');
dotenv.config()

const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log("MongoDB Connected");
    } catch (error) {
        console.log("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;