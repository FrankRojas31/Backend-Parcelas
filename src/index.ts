import express from "express";
import { pool_mssql } from "./connection/mssql";
import { connectMongo } from "./connection/mongo";
import router from "./routes/route";

const app = express();
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