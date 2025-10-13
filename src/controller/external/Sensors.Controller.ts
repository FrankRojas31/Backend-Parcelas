import { Request, Response } from 'express';
import { SensorsService } from '../../services/external/Sensors.Service';
import { ResponseHelperClass } from '../../types/api/ResponseHelper';
import { SensorType } from '../../types/external/Sensors.type';

const sensorsService = new SensorsService();

export class SensorsController {
  // GET /api/external/sensors - Obtener todos los sensores separados por tipo
  async getAll(req: Request, res: Response) {
    try {
      const sensors = await sensorsService.getAllSensors();
      return ResponseHelperClass.success(res, sensors, 'Sensores obtenidos exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/external/sensors/grouped - Obtener sensores agrupados por coordenadas
  async getGrouped(req: Request, res: Response) {
    try {
      const groupedSensors = await sensorsService.getGroupedSensors();
      return ResponseHelperClass.success(res, groupedSensors, 'Sensores agrupados obtenidos exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/external/sensors/type/:type - Obtener sensores por tipo
  async getByType(req: Request, res: Response) {
    try {
      const type = req.params.type as SensorType;
      const sensors = await sensorsService.getSensorsByType(type);
      return ResponseHelperClass.success(res, sensors, `Sensores de tipo ${type} obtenidos exitosamente`);
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // GET /api/external/sensors/coordinates - Obtener sensores por coordenadas
  async getByCoordinates(req: Request, res: Response) {
    try {
      const { lat, lon, tolerance } = req.query;

      if (!lat || !lon) {
        return ResponseHelperClass.error(res, 'Las coordenadas lat y lon son requeridas', 400);
      }

      const sensors = await sensorsService.getSensorsByCoordinates(
        parseFloat(lat as string),
        parseFloat(lon as string),
        tolerance ? parseFloat(tolerance as string) : undefined
      );

      if (!sensors) {
        return ResponseHelperClass.success(res, null, 'No se encontraron sensores en las coordenadas especificadas');
      }

      return ResponseHelperClass.success(res, sensors, 'Sensores obtenidos por coordenadas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // GET /api/external/sensors/coordinates/unique - Obtener coordenadas únicas
  async getUniqueCoordinates(req: Request, res: Response) {
    try {
      const coordinates = await sensorsService.getUniqueCoordinates();
      return ResponseHelperClass.success(res, coordinates, 'Coordenadas únicas obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/external/sensors/stats - Obtener estadísticas de sensores
  async getStats(req: Request, res: Response) {
    try {
      const stats = await sensorsService.getSensorStats();
      return ResponseHelperClass.success(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/external/sensors/filter/:type - Filtrar sensores por valor
  async filterByValue(req: Request, res: Response) {
    try {
      const type = req.params.type as SensorType;
      const { minValue, maxValue } = req.query;

      const sensors = await sensorsService.filterSensorsByValue(
        type,
        minValue ? parseFloat(minValue as string) : undefined,
        maxValue ? parseFloat(maxValue as string) : undefined
      );

      return ResponseHelperClass.success(res, sensors, `Sensores de ${type} filtrados exitosamente`);
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // GET /api/external/sensors/date-range - Obtener sensores por rango de fechas
  async getByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return ResponseHelperClass.error(res, 'Las fechas startDate y endDate son requeridas', 400);
      }

      const sensors = await sensorsService.getSensorsByDateRange(
        startDate as string,
        endDate as string
      );

      return ResponseHelperClass.success(res, sensors, 'Sensores obtenidos por rango de fechas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // GET /api/external/sensors/types - Obtener tipos de sensores disponibles
  async getAvailableTypes(req: Request, res: Response) {
    try {
      const types = ['temperatura', 'humedad', 'lluvia', 'radiacion_solar'];
      const typesInfo = {
        types,
        description: {
          temperatura: 'Sensores de temperatura ambiente',
          humedad: 'Sensores de humedad relativa',
          lluvia: 'Pluviómetros para medir precipitación',
          radiacion_solar: 'Sensores de radiación solar'
        },
        units: {
          temperatura: '°C',
          humedad: '%',
          lluvia: 'mm',
          radiacion_solar: 'W/m²'
        }
      };

      return ResponseHelperClass.success(res, typesInfo, 'Tipos de sensores disponibles');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }
}
