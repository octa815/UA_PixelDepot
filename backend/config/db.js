// backend/config/db.js
import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true); // Preparación para Mongoose 7
    const conn = await mongoose.connect(config.mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Salir con error si no se puede conectar
  }
};

export default connectDB;