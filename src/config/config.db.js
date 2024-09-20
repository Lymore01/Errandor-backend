const envFile = `.env.${process.env.NODE_ENV} || development`
require("dotenv").config({ path: envFile })
const mongoose = require("mongoose")
const colors = require("colors/safe")

const uri = process.env.MONGODB_URI;

const connectDb = async () =>{
    try {
        await mongoose.connect(uri)
    } catch (error) {
        console.error.bind(console, colors.red(`MongoDB connection error: ${error}`));
        process.exit(1)
    }
}

connectDb();

module.exports = mongoose.connection;