import { Request, Response } from 'express';
import { ParcelasMongoService } from '../../services/api/ParcelasMongo.Service';
import { ResponseHelperClass } from '../../types/api/ResponseHelper';
import { ObjectId } from 'mongodb';

const parcelasMongoService = new ParcelasMongoService();

export class ParcelasMongoController {
  // GET /api/parcelas-mongo - Obtener todas las parcelas de MongoDB
  async getAll(req: Request, res: Response) {
    try {
      const parcelas = await parcelasMongoService.getAllParcelasMongo();
      return ResponseHelperClass.success(res, parcelas, 'Parcelas de MongoDB obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/parcelas-mongo/:id - Obtener parcela por ID
  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return ResponseHelperClass.error(res, 'ID de parcela es requerido', 400);
      }

      const parcela = await parcelasMongoService.getParcelaMongoById(id);
      return ResponseHelperClass.success(res, parcela, 'Parcela obtenida exitosamente');
    } catch (error: any) {
      // Si el error es de ID inválido, devolver 400 en lugar de 404
      if (error.message.includes('ID inválido') || error.message.includes('ObjectId')) {
        return ResponseHelperClass.error(res, error.message, 400);
      }
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // GET /api/parcelas-mongo/coordinates - Obtener parcelas por coordenadas
  async getByCoordinates(req: Request, res: Response) {
    try {
      const { latMin, latMax, lonMin, lonMax } = req.query;

      if (!latMin || !latMax || !lonMin || !lonMax) {
        return ResponseHelperClass.error(res, 'Se requieren las coordenadas mínimas y máximas', 400);
      }

      const parcelas = await parcelasMongoService.getParcelasByCoordinates(
        parseFloat(latMin as string),
        parseFloat(latMax as string),
        parseFloat(lonMin as string),
        parseFloat(lonMax as string)
      );

      return ResponseHelperClass.success(res, parcelas, 'Parcelas obtenidas por coordenadas');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/parcelas-mongo/date-range - Obtener parcelas por rango de fechas
  async getByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return ResponseHelperClass.error(res, 'Se requieren fecha de inicio y fin', 400);
      }

      const parcelas = await parcelasMongoService.getParcelasByDateRange(
        startDate as string,
        endDate as string
      );

      return ResponseHelperClass.success(res, parcelas, 'Parcelas obtenidas por rango de fechas');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/parcelas-mongo/value-range - Obtener parcelas por rango de valores
  async getByValueRange(req: Request, res: Response) {
    try {
      const { minValue, maxValue } = req.query;

      if (!minValue || !maxValue) {
        return ResponseHelperClass.error(res, 'Se requieren valor mínimo y máximo', 400);
      }

      const parcelas = await parcelasMongoService.getParcelasByValueRange(
        parseFloat(minValue as string),
        parseFloat(maxValue as string)
      );

      return ResponseHelperClass.success(res, parcelas, 'Parcelas obtenidas por rango de valores');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/parcelas-mongo/unit/:unit - Obtener parcelas por unidad
  async getByUnit(req: Request, res: Response) {
    try {
      const unit = req.params.unit;
      const parcelas = await parcelasMongoService.getParcelasByUnit(unit);
      return ResponseHelperClass.success(res, parcelas, `Parcelas obtenidas por unidad: ${unit}`);
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/parcelas-mongo/stats - Obtener estadísticas
  async getStats(req: Request, res: Response) {
    try {
      const stats = await parcelasMongoService.getParcelasStats();
      return ResponseHelperClass.success(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/parcelas-mongo/filter - Filtrar parcelas por múltiples criterios
  async filter(req: Request, res: Response) {
    try {
      const filters = req.query;
      const parcelas = await parcelasMongoService.filterParcelas(filters as any);
      return ResponseHelperClass.success(res, parcelas, 'Parcelas filtradas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // POST /api/parcelas-mongo - Crear nueva parcela
  async create(req: Request, res: Response) {
    try {
      const { value, unit, timestamp, coords, type } = req.body;

      if (!value || !unit || !coords || !coords.lat || !coords.lon || !type) {
        return ResponseHelperClass.error(res, 'Valor, unidad, coordenadas y tipo son requeridos', 400);
      }

      const validTypes = ['temperatura', 'humedad', 'lluvia', 'radiacion_solar'];
      if (!validTypes.includes(type)) {
        return ResponseHelperClass.error(res, `Tipo de sensor inválido. Tipos válidos: ${validTypes.join(', ')}`, 400);
      }

      const parcela = await parcelasMongoService.createParcelaMongo({
        value: parseFloat(value),
        unit,
        timestamp: timestamp ? new Date(timestamp) : undefined,
        coords: {
          lat: parseFloat(coords.lat),
          lon: parseFloat(coords.lon)
        },
        type
      });

      return ResponseHelperClass.success(res, parcela, 'Parcela creada exitosamente', 201);
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // PUT /api/parcelas-mongo/:id - Actualizar parcela
  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return ResponseHelperClass.error(res, 'ID de parcela es requerido', 400);
      }

      const { value, unit, timestamp, coords } = req.body;

      const updateData: any = {};
      if (value !== undefined) updateData.value = parseFloat(value);
      if (unit) updateData.unit = unit;
      if (timestamp) updateData.timestamp = new Date(timestamp);
      if (coords) {
        updateData.coords = {
          lat: coords.lat ? parseFloat(coords.lat) : undefined,
          lon: coords.lon ? parseFloat(coords.lon) : undefined
        };
      }

      const parcela = await parcelasMongoService.updateParcelaMongo(id, updateData);
      return ResponseHelperClass.success(res, parcela, 'Parcela actualizada exitosamente');
    } catch (error: any) {
      if (error.message.includes('ID inválido') || error.message.includes('ObjectId')) {
        return ResponseHelperClass.error(res, error.message, 400);
      }
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // DELETE /api/parcelas-mongo/:id - Eliminar parcela (borrado lógico)
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return ResponseHelperClass.error(res, 'ID de parcela es requerido', 400);
      }

      await parcelasMongoService.deleteParcelaMongo(id);
      return ResponseHelperClass.success(res, null, 'Parcela eliminada exitosamente');
    } catch (error: any) {
      if (error.message.includes('ID inválido') || error.message.includes('ObjectId')) {
        return ResponseHelperClass.error(res, error.message, 400);
      }
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // GET /api/parcelas-mongo/utils/example-id - Generar ObjectId de ejemplo
  async getExampleId(req: Request, res: Response) {
    try {
      const exampleId = new ObjectId().toString();
      return ResponseHelperClass.success(res, {
        exampleId,
        description: 'Este es un ejemplo de ObjectId válido para MongoDB',
        format: '24 caracteres hexadecimales',
        usage: `Usa este formato en las URLs: /api/parcelas-mongo/${exampleId}`
      }, 'ObjectId de ejemplo generado');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/parcelas-mongo/utils/validate-id/:id - Validar formato de ObjectId
  async validateId(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const isValid = ObjectId.isValid(id) && (id.length === 24);
      
      return ResponseHelperClass.success(res, {
        id,
        isValid,
        length: id.length,
        expectedLength: 24,
        message: isValid ? 'ID válido' : 'ID inválido - debe ser hexadecimal de 24 caracteres'
      }, 'Validación completada');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }
}