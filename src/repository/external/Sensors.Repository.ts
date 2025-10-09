import { pool_mongo } from "../../connection/mongo";
import type { SensorData, SensorQueryParams, SensorResponse } from "../../types/external/Sensors.type";

// Obtener todos los datos de sensores con filtros opcionales
export const GetDataSensors = async (params?: SensorQueryParams): Promise<SensorResponse> => {
    try {
        // Usar la conexión mongoose directamente - probablemente los datos están en 'parcelas'
        const collection = pool_mongo.collection('parcelas');
        
        // Construir filtro
        const filter: any = { isDeleted: { $ne: true } };
        
        if (params?.type) {
            filter.type = params.type;
        }
        
        if (params?.startDate || params?.endDate) {
            filter.timestamp = {};
            if (params.startDate) {
                filter.timestamp.$gte = params.startDate;
            }
            if (params.endDate) {
                filter.timestamp.$lte = params.endDate;
            }
        }
        
        // Configurar paginación
        const limit = params?.limit || 100;
        const page = params?.page || 1;
        const skip = (page - 1) * limit;
        
        // Obtener datos
        const cursor = collection.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);
            
        const results = await cursor.toArray();
        const total = await collection.countDocuments(filter);
        
        // Convertir ObjectId a string y formatear datos
        const data: SensorData[] = results.map(doc => {
            const value = Number(doc.value);
            return {
                _id: doc._id.toString(),
                value: isNaN(value) ? 0 : value, 
                unit: doc.unit || '',
                timestamp: doc.timestamp,
                coords: {
                    lat: doc.coords?.lat || 0,
                    lng: doc.coords?.lng || doc.coords?.lon || 0 
                },
                type: doc.type,
                isDeleted: doc.isDeleted || false
            };
        });
        
        return {
            data,
            total
        };
    } catch (error) {
        console.error("Error al obtener datos de sensores:", error);
        throw new Error("Error al conectar con la base de datos: " + error);
    }
};

export const GetSensorDataByType = async (
    type: string, 
    startDate?: string, 
    endDate?: string, 
    limit?: number
): Promise<SensorData[]> => {
    try {
        const collection = pool_mongo.collection('parcelas');
        
        // Construir filtro
        const filter: any = { type: type };
        
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) {
                filter.timestamp.$gte = startDate;
            }
            if (endDate) {
                filter.timestamp.$lte = endDate;
            }
        }
        
        const cursor = collection.find(filter)
            .sort({ timestamp: -1 })
            .limit(limit || 100);
            
        const results = await cursor.toArray();
        
        const data: SensorData[] = results.map(doc => {
            const value = Number(doc.value);
            return {
                _id: doc._id.toString(),
                value: isNaN(value) ? 0 : value, 
                unit: doc.unit || '',
                timestamp: doc.timestamp,
                coords: {
                    lat: doc.coords?.lat || 0,
                    lng: doc.coords?.lng || doc.coords?.lon || 0
                },
                type: doc.type,
                isDeleted: doc.isDeleted || false
            };
        });
        
        return data;
    } catch (error) {
        console.error(`Error al obtener datos de sensores tipo ${type}:`, error);
        throw new Error(`Error al obtener datos de ${type}: ` + error);
    }
};

export const GetSensorStats = async () => {
    try {
        const collection = pool_mongo.collection('parcelas');
        
        const pipeline = [
            { $match: { isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    avgValue: { $avg: "$value" },
                    minValue: { $min: "$value" },
                    maxValue: { $max: "$value" },
                    lastUpdate: { $max: "$timestamp" }
                }
            }
        ];
        
        const stats = await collection.aggregate(pipeline).toArray();
        
        return {
            stats,
            totalReadings: await collection.countDocuments({ isDeleted: { $ne: true } })
        };
    } catch (error) {
        console.error("Error al obtener estadísticas de sensores:", error);
        throw new Error("Error al obtener estadísticas: " + error);
    }
};