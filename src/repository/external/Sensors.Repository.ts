import type { SensorResponse } from "../../types/external/Sensors.type";

export const GetDataSensors = async () => {
    
    try {
        const result = await fetch( process.env.API_EXTERNAL_URL || '');
        const data: SensorResponse = await result.json();
        return data;
    } catch (error) {
        throw new Error("Error al obtener datos de sensores: " + error);
    }
};