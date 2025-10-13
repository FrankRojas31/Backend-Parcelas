import { Router } from "express";
import sensorsRoutes from "./Sensors.Routes";

const router = Router();

// Rutas de sensores externos
router.use("/sensors", sensorsRoutes);

export default router;
