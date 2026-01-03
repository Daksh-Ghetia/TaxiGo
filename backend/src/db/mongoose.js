const mongoose = require('mongoose');
const env = require('../config/env');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
    } catch (error) {
        console.log('MongoDB connection failed ' + error);
        throw error;
    }
}

module.exports = connectDB;