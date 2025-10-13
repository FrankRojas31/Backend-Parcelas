import type { SensorResponse, SensorData, GroupedSensorData, SensorType, GroupedSensorResponse } from "../../types/external/Sensors.type";

export const GetDataSensors = async (): Promise<SensorResponse> => {
    try {
        const result = await fetch(process.env.API_EXTERNAL_URL || '');
        const data: SensorResponse = await result.json();
        
        // Validar que la respuesta tenga todos los tipos de sensores
        if (!data.temperatura) data.temperatura = [];
        if (!data.humedad) data.humedad = [];
        if (!data.lluvia) data.lluvia = [];
        if (!data.radiacion_solar) data.radiacion_solar = [];
        
        return data;
    } catch (error) {
        throw new Error("Error al obtener datos de sensores: " + error);
    }
};

export const GetGroupedDataSensors = async (): Promise<GroupedSensorResponse> => {
    try {
        const data = await GetDataSensors();
        const groupedData = groupSensorsByCoordinates(data);
        
        return {
            data: groupedData,
            total: groupedData.length,
            coordenadas_unicas: groupedData.length
        };
    } catch (error) {
        throw new Error("Error al obtener datos agrupados de sensores: " + error);
    }
};

// Función para agrupar sensores por coordenadas
const groupSensorsByCoordinates = (sensorData: SensorResponse): GroupedSensorData[] => {
    const coordsMap = new Map<string, GroupedSensorData>();
    
    // Procesar cada tipo de sensor
    const sensorTypes: (keyof SensorResponse)[] = ['temperatura', 'humedad', 'lluvia', 'radiacion_solar'];
    
    sensorTypes.forEach(sensorType => {
        const sensors = sensorData[sensorType] || [];
        
        sensors.forEach(sensor => {
            // Crear una clave única para las coordenadas
            const coordKey = `${sensor.coords.lat.toFixed(6)},${sensor.coords.lon.toFixed(6)}`;
            
            // Si no existe el grupo para estas coordenadas, crearlo
            if (!coordsMap.has(coordKey)) {
                coordsMap.set(coordKey, {
                    coords: {
                        lat: sensor.coords.lat,
                        lon: sensor.coords.lon
                    },
                    sensores: {
                        temperatura: [],
                        humedad: [],
                        lluvia: [],
                        radiacion_solar: []
                    },
                    timestamp: sensor.timestamp,
                    isDeleted: false
                });
            }
            
            // Obtener el grupo existente
            const group = coordsMap.get(coordKey)!;
            
            // Agregar el sensor al tipo correspondiente
            if (!group.sensores[sensorType]) {
                group.sensores[sensorType] = [];
            }
            group.sensores[sensorType]!.push({
                ...sensor,
                type: sensorType as SensorType
            });
            
            // Actualizar timestamp al más reciente
            if (new Date(sensor.timestamp) > new Date(group.timestamp)) {
                group.timestamp = sensor.timestamp;
            }
        });
    });
    
    return Array.from(coordsMap.values());
};

// Función para obtener sensores por tipo específico
export const GetSensorsByType = async (type: SensorType): Promise<SensorData[]> => {
    try {
        const data = await GetDataSensors();
        return data[type] || [];
    } catch (error) {
        throw new Error(`Error al obtener sensores de tipo ${type}: ${error}`);
    }
};

// Función para obtener sensores por coordenadas específicas
export const GetSensorsByCoordinates = async (lat: number, lon: number, tolerance: number = 0.0001): Promise<GroupedSensorData | null> => {
    try {
        const groupedData = await GetGroupedDataSensors();
        
        // Buscar el grupo de sensores que coincida con las coordenadas (con tolerancia)
        const matchingGroup = groupedData.data.find(group => {
            const latDiff = Math.abs(group.coords.lat - lat);
            const lonDiff = Math.abs(group.coords.lon - lon);
            return latDiff <= tolerance && lonDiff <= tolerance;
        });
        
        return matchingGroup || null;
    } catch (error) {
        throw new Error(`Error al obtener sensores por coordenadas: ${error}`);
    }
};

// Función para obtener todas las coordenadas únicas
export const GetUniqueCoordinates = async (): Promise<Array<{lat: number, lon: number}>> => {
    try {
        const groupedData = await GetGroupedDataSensors();
        return groupedData.data.map(group => group.coords);
    } catch (error) {
        throw new Error(`Error al obtener coordenadas únicas: ${error}`);
    }
};