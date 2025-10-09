import { Router } from "express";
import { 
    getSensors, 
    getSensorsByType, 
    getSensorStats, 
    getAggregatedData, 
    getSensorsSummaryController 
} from "../../controller/external/Sensors.Controller";

const router = Router();

// Rutas para sensores
router.get("/sensors", getSensors);
router.get("/sensors/stats", getSensorStats);
router.get("/sensors/summary", getSensorsSummaryController);
router.get("/sensors/:type", getSensorsByType);
router.get("/sensors/:type/aggregated", getAggregatedData);

export default router;
