import { GetDataSensors, GetGroupedDataSensors, GetSensorsByType, GetSensorsByCoordinates, GetUniqueCoordinates } from '../../repository/external/Sensors.Repository';
import { SensorType, GroupedSensorResponse, SensorData, GroupedSensorData } from '../../types/external/Sensors.type';

export class SensorsService {
  // Obtener todos los datos de sensores separados por tipo
  async getAllSensors() {
    try {
      return await GetDataSensors();
    } catch (error) {
      throw new Error(`Error al obtener todos los sensores: ${error}`);
    }
  }

  // Obtener datos agrupados por coordenadas
  async getGroupedSensors() {
    try {
      return await GetGroupedDataSensors();
    } catch (error) {
      throw new Error(`Error al obtener sensores agrupados: ${error}`);
    }
  }

  // Obtener sensores por tipo específico
  async getSensorsByType(type: SensorType) {
    try {
      const validTypes: SensorType[] = ['temperatura', 'humedad', 'lluvia', 'radiacion_solar'];
      
      if (!validTypes.includes(type)) {
        throw new Error(`Tipo de sensor inválido. Tipos válidos: ${validTypes.join(', ')}`);
      }

      return await GetSensorsByType(type);
    } catch (error) {
      throw new Error(`Error al obtener sensores por tipo: ${error}`);
    }
  }

  // Obtener sensores por coordenadas específicas
  async getSensorsByCoordinates(lat: number, lon: number, tolerance: number = 0.0001) {
    try {
      if (typeof lat !== 'number' || typeof lon !== 'number') {
        throw new Error('Las coordenadas deben ser números válidos');
      }

      if (lat < -90 || lat > 90) {
        throw new Error('La latitud debe estar entre -90 y 90');
      }

      if (lon < -180 || lon > 180) {
        throw new Error('La longitud debe estar entre -180 y 180');
      }

      return await GetSensorsByCoordinates(lat, lon, tolerance);
    } catch (error) {
      throw new Error(`Error al obtener sensores por coordenadas: ${error}`);
    }
  }

  // Obtener todas las coordenadas únicas donde hay sensores
  async getUniqueCoordinates() {
    try {
      return await GetUniqueCoordinates();
    } catch (error) {
      throw new Error(`Error al obtener coordenadas únicas: ${error}`);
    }
  }

  // Obtener estadísticas de sensores por tipo
  async getSensorStats() {
    try {
      const data = await GetDataSensors();
      
      const stats = {
        temperatura: {
          count: data.temperatura?.length || 0,
          avgValue: 0,
          minValue: 0,
          maxValue: 0,
          unit: data.temperatura?.[0]?.unit || '°C'
        },
        humedad: {
          count: data.humedad?.length || 0,
          avgValue: 0,
          minValue: 0,
          maxValue: 0,
          unit: data.humedad?.[0]?.unit || '%'
        },
        lluvia: {
          count: data.lluvia?.length || 0,
          avgValue: 0,
          minValue: 0,
          maxValue: 0,
          unit: data.lluvia?.[0]?.unit || 'mm'
        },
        radiacion_solar: {
          count: data.radiacion_solar?.length || 0,
          avgValue: 0,
          minValue: 0,
          maxValue: 0,
          unit: data.radiacion_solar?.[0]?.unit || 'W/m²'
        }
      };

      // Calcular estadísticas para cada tipo
      Object.keys(stats).forEach(type => {
        const sensors = data[type as SensorType] || [];
        if (sensors.length > 0) {
          const values = sensors.map(s => s.value);
          stats[type as SensorType].avgValue = values.reduce((a, b) => a + b, 0) / values.length;
          stats[type as SensorType].minValue = Math.min(...values);
          stats[type as SensorType].maxValue = Math.max(...values);
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error}`);
    }
  }

  // Filtrar sensores por valor
  async filterSensorsByValue(type: SensorType, minValue?: number, maxValue?: number) {
    try {
      const sensors = await GetSensorsByType(type);
      
      return sensors.filter(sensor => {
        if (minValue !== undefined && sensor.value < minValue) return false;
        if (maxValue !== undefined && sensor.value > maxValue) return false;
        return true;
      });
    } catch (error) {
      throw new Error(`Error al filtrar sensores por valor: ${error}`);
    }
  }

  // Obtener sensores por rango de fechas
  async getSensorsByDateRange(startDate: string, endDate: string) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }

      const data = await GetDataSensors();
      const filteredData = {
        temperatura: data.temperatura?.filter(s => {
          const timestamp = new Date(s.timestamp);
          return timestamp >= start && timestamp <= end;
        }) || [],
        humedad: data.humedad?.filter(s => {
          const timestamp = new Date(s.timestamp);
          return timestamp >= start && timestamp <= end;
        }) || [],
        lluvia: data.lluvia?.filter(s => {
          const timestamp = new Date(s.timestamp);
          return timestamp >= start && timestamp <= end;
        }) || [],
        radiacion_solar: data.radiacion_solar?.filter(s => {
          const timestamp = new Date(s.timestamp);
          return timestamp >= start && timestamp <= end;
        }) || []
      };

      return filteredData;
    } catch (error) {
      throw new Error(`Error al obtener sensores por rango de fechas: ${error}`);
    }
  }
}