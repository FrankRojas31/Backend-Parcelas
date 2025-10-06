import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI || '';

export const connectMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw error;
  }
};

export const pool_mongo = mongoose.connection;