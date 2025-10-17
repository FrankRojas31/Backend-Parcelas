import express from "express";
import cors from "cors";
import { pool_mssql } from "./connection/mssql";
import { connectMongo } from "./connection/mongo";
import router from "./routes/route";
import { ParcelaService } from "./services/api/Parcela.Service";

const app = express();

app.use(cors({
  origin: '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint for Kubernetes
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "parcela-backend"
  });
});

app.use("/api", router);
const PORT = process.env.PORT || 3000;

async function InitServer() {
  try {
    await pool_mssql.connect();
    await connectMongo();
    
    // Iniciar sincronización automática de parcelas cada 10 segundos
    const parcelaService = ParcelaService();
    parcelaService.startAutoSync();
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Sincronización automática de parcelas activa (cada 10 segundos)`);
    });
  } catch (error) {
    console.error("Error al inicializar el servidor:", error);
    process.exit(1);
  }
}

InitServer();