import { Request, Response } from "express";
import { GetDataSensors, GetSensorDataByType, GetSensorStats } from "../../repository/external/Sensors.Repository";
import { getAggregatedSensorData, getSensorsSummary } from "../../services/external/Sensors.Service";
import type { SensorQueryParams } from "../../types/external/Sensors.type";

// Obtener todos los datos de sensores con filtros
export const getSensors = async (req: Request, res: Response) => {
    try {
        const { type, startDate, endDate, limit, page } = req.query;
        
        const params: SensorQueryParams = {
            type: type as string,
            startDate: startDate as string,
            endDate: endDate as string,
            limit: limit ? parseInt(limit as string) : undefined,
            page: page ? parseInt(page as string) : undefined
        };
        
        const result = await GetDataSensors(params);
        
        res.status(200).json({
            success: true,
            message: "Datos de sensores obtenidos exitosamente",
            data: result.data,
            total: result.total,
            page: params.page || 1,
            limit: params.limit || 100
        });
    } catch (error) {
        console.error("Error en getSensors:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
};

// Obtener datos de sensores por tipo específico
export const getSensorsByType = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const { startDate, endDate, limit } = req.query;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                message: "El tipo de sensor es requerido"
            });
        }
        
        // Validar tipos permitidos
        const validTypes = ["temperatura", "humedad", "lluvia"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Tipo de sensor no válido. Tipos permitidos: ${validTypes.join(", ")}`
            });
        }
        
        const result = await GetSensorDataByType(
            type,
            startDate as string,
            endDate as string,
            limit ? parseInt(limit as string) : undefined
        );
        
        res.status(200).json({
            success: true,
            message: `Datos de sensores de ${type} obtenidos exitosamente`,
            data: result,
            type,
            count: result.length
        });
    } catch (error) {
        console.error(`Error en getSensorsByType para tipo ${req.params.type}:`, error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
};

// Obtener estadísticas de sensores
export const getSensorStats = async (req: Request, res: Response) => {
    try {
        const result = await GetSensorStats();
        
        res.status(200).json({
            success: true,
            message: "Estadísticas de sensores obtenidas exitosamente",
            data: result
        });
    } catch (error) {
        console.error("Error en getSensorStats:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
};

// Obtener datos agregados por días
export const getAggregatedData = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const { days } = req.query;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                message: "El tipo de sensor es requerido"
            });
        }
        
        const validTypes = ["temperatura", "humedad", "lluvia"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Tipo de sensor no válido. Tipos permitidos: ${validTypes.join(", ")}`
            });
        }
        
        const daysCount = days ? parseInt(days as string) : 7;
        const result = await getAggregatedSensorData(type, daysCount);
        
        res.status(200).json({
            success: true,
            message: `Datos agregados de ${type} obtenidos exitosamente`,
            data: result,
            type,
            days: daysCount
        });
    } catch (error) {
        console.error(`Error en getAggregatedData para tipo ${req.params.type}:`, error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
};

// Obtener resumen completo de sensores
export const getSensorsSummaryController = async (req: Request, res: Response) => {
    try {
        const result = await getSensorsSummary();
        
        res.status(200).json({
            success: true,
            message: "Resumen de sensores obtenido exitosamente",
            data: result
        });
    } catch (error) {
        console.error("Error en getSensorsSummary:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
};