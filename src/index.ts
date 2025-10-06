import express from "express";
import cors from "cors";
import { pool_mssql } from "./connection/mssql";
import { connectMongo } from "./connection/mongo";
import router from "./routes/route";

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use("/api", router);
const PORT = process.env.PORT || 3000;

async function InitServer() {
  try {
    await pool_mssql.connect();
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al inicializar el servidor:", error);
    process.exit(1);
  }
}

InitServer();