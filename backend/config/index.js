// backend/config/index.js
import dotenv from 'dotenv';

dotenv.config(); // Carga variables de .env

export default {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
};