import { GetDataSensors, GetSensorDataByType, GetSensorStats } from "../../repository/external/Sensors.Repository";
import type { SensorData, SensorQueryParams } from "../../types/external/Sensors.type";

// Servicio para obtener datos agregados por días
export const getAggregatedSensorData = async (
    type: string,
    days: number = 7
): Promise<{ date: string; avgValue: number; minValue: number; maxValue: number; count: number }[]> => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const data = await GetSensorDataByType(
            type,
            startDate.toISOString(),
            endDate.toISOString()
        );

        // Agrupar por día
        const groupedByDay = data.reduce((acc, reading) => {
            const date = new Date(reading.timestamp).toISOString().split('T')[0];
            
            if (!acc[date]) {
                acc[date] = {
                    date,
                    values: [],
                    count: 0
                };
            }
            
            acc[date].values.push(reading.value);
            acc[date].count++;
            
            return acc;
        }, {} as Record<string, { date: string; values: number[]; count: number }>);

        // Calcular estadísticas por día
        return Object.values(groupedByDay).map(day => ({
            date: day.date,
            avgValue: Number((day.values.reduce((sum, val) => sum + val, 0) / day.values.length).toFixed(2)),
            minValue: Math.min(...day.values),
            maxValue: Math.max(...day.values),
            count: day.count
        })).sort((a, b) => a.date.localeCompare(b.date));

    } catch (error) {
        throw new Error(`Error al obtener datos agregados para ${type}: ` + error);
    }
};

// Servicio para obtener el resumen de todos los tipos de sensores
export const getSensorsSummary = async () => {
    try {
        const stats = await GetSensorStats();
        
        // Obtener datos recientes de cada tipo
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 1); // Último día

        const [tempData, humidityData, rainData] = await Promise.all([
            GetSensorDataByType('temperatura', startDate.toISOString(), endDate.toISOString()),
            GetSensorDataByType('humedad', startDate.toISOString(), endDate.toISOString()),
            GetSensorDataByType('lluvia', startDate.toISOString(), endDate.toISOString())
        ]);

        return {
            summary: {
                totalReadings: stats.totalReadings,
                lastUpdate: new Date().toISOString(),
                activeSensors: stats.stats.length
            },
            types: {
                temperatura: {
                    ...stats.stats.find(s => s._id === 'temperatura') || {},
                    recentReadings: tempData.length,
                    lastValue: tempData[0]?.value || null
                },
                humedad: {
                    ...stats.stats.find(s => s._id === 'humedad') || {},
                    recentReadings: humidityData.length,
                    lastValue: humidityData[0]?.value || null
                },
                lluvia: {
                    ...stats.stats.find(s => s._id === 'lluvia') || {},
                    recentReadings: rainData.length,
                    lastValue: rainData[0]?.value || null
                }
            }
        };
    } catch (error) {
        throw new Error("Error al obtener resumen de sensores: " + error);
    }
};

// Servicio para validar y limpiar datos de sensores
export const validateSensorData = (data: Partial<SensorData>): boolean => {
    if (!data.value || typeof data.value !== 'number') return false;
    if (!data.type || !['temperatura', 'humedad', 'lluvia'].includes(data.type)) return false;
    if (!data.unit || typeof data.unit !== 'string') return false;
    if (!data.timestamp) return false;
    
    // Validar rangos por tipo
    switch (data.type) {
        case 'temperatura':
            return data.value >= -50 && data.value <= 70; // Rango razonable para temperatura
        case 'humedad':
            return data.value >= 0 && data.value <= 100; // Porcentaje
        case 'lluvia':
            return data.value >= 0 && data.value <= 500; // mm de lluvia
        default:
            return false;
    }
};