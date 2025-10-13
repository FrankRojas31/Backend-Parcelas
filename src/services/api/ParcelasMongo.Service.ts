import { ParcelasMongoRepository } from '../../repository/api/ParcelasMongo.Repository';
import { SensorData, SensorType } from '../../types/external/Sensors.type';
import { ObjectId } from 'mongodb';

const parcelasMongoRepo = new ParcelasMongoRepository();

export class ParcelasMongoService {
  // Validar si el ID es un ObjectId válido
  private isValidObjectId(id: string): boolean {
    return ObjectId.isValid(id) && (id.length === 24);
  }

  // Obtener todas las parcelas de MongoDB
  async getAllParcelasMongo() {
    try {
      return await parcelasMongoRepo.getAll();
    } catch (error) {
      throw new Error(`Error al obtener parcelas de MongoDB: ${error}`);
    }
  }

  // Obtener parcela por ID
  async getParcelaMongoById(id: string) {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('ID es requerido y debe ser una cadena');
      }

      if (!this.isValidObjectId(id)) {
        throw new Error('ID inválido: debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)');
      }

      const parcela = await parcelasMongoRepo.getById(id);
      if (!parcela) {
        throw new Error('Parcela no encontrada');
      }
      return parcela;
    } catch (error) {
      throw new Error(`Error al obtener parcela: ${error}`);
    }
  }

  // Obtener parcelas por coordenadas
  async getParcelasByCoordinates(latMin: number, latMax: number, lonMin: number, lonMax: number) {
    try {
      return await parcelasMongoRepo.getByCoordinates(latMin, latMax, lonMin, lonMax);
    } catch (error) {
      throw new Error(`Error al obtener parcelas por coordenadas: ${error}`);
    }
  }

  // Obtener parcelas por rango de fechas
  async getParcelasByDateRange(startDate: string, endDate: string) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return await parcelasMongoRepo.getByDateRange(start, end);
    } catch (error) {
      throw new Error(`Error al obtener parcelas por fecha: ${error}`);
    }
  }

  // Obtener parcelas por valor (sensores)
  async getParcelasByValueRange(minValue: number, maxValue: number) {
    try {
      return await parcelasMongoRepo.getByValueRange(minValue, maxValue);
    } catch (error) {
      throw new Error(`Error al obtener parcelas por valor: ${error}`);
    }
  }

  // Obtener parcelas por unidad
  async getParcelasByUnit(unit: string) {
    try {
      return await parcelasMongoRepo.getByUnit(unit);
    } catch (error) {
      throw new Error(`Error al obtener parcelas por unidad: ${error}`);
    }
  }

  // Crear nueva parcela
  async createParcelaMongo(data: {
    value: number;
    unit: string;
    timestamp?: Date;
    coords: {
      lat: number;
      lon: number;
    };
    type: SensorType;
  }) {
    try {
      const parcelaData: SensorData = {
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp || new Date(),
        coords: data.coords,
        type: data.type,
        isDeleted: false
      };

      return await parcelasMongoRepo.create(parcelaData);
    } catch (error) {
      throw new Error(`Error al crear parcela: ${error}`);
    }
  }

  // Actualizar parcela
  async updateParcelaMongo(id: string, data: Partial<{
    value: number;
    unit: string;
    timestamp: Date;
    coords: {
      lat: number;
      lon: number;
    };
  }>) {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('ID es requerido y debe ser una cadena');
      }

      if (!this.isValidObjectId(id)) {
        throw new Error('ID inválido: debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)');
      }

      return await parcelasMongoRepo.update(id, data);
    } catch (error) {
      throw new Error(`Error al actualizar parcela: ${error}`);
    }
  }

  // Borrado lógico
  async deleteParcelaMongo(id: string) {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('ID es requerido y debe ser una cadena');
      }

      if (!this.isValidObjectId(id)) {
        throw new Error('ID inválido: debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)');
      }

      return await parcelasMongoRepo.softDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar parcela: ${error}`);
    }
  }

  // Obtener estadísticas
  async getParcelasStats() {
    try {
      return await parcelasMongoRepo.getStats();
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error}`);
    }
  }

  // Filtrar parcelas por múltiples criterios
  async filterParcelas(filters: {
    unit?: string;
    minValue?: number;
    maxValue?: number;
    startDate?: string;
    endDate?: string;
    latMin?: number;
    latMax?: number;
    lonMin?: number;
    lonMax?: number;
  }) {
    try {
      let parcelas = await this.getAllParcelasMongo();

      // Filtrar por unidad
      if (filters.unit) {
        parcelas = parcelas.filter(p => p.unit === filters.unit);
      }

      // Filtrar por valor
      if (filters.minValue !== undefined || filters.maxValue !== undefined) {
        parcelas = parcelas.filter(p => {
          if (filters.minValue !== undefined && p.value < filters.minValue) return false;
          if (filters.maxValue !== undefined && p.value > filters.maxValue) return false;
          return true;
        });
      }

      // Filtrar por fecha
      if (filters.startDate || filters.endDate) {
        parcelas = parcelas.filter(p => {
          const timestamp = new Date(p.timestamp);
          if (filters.startDate && timestamp < new Date(filters.startDate)) return false;
          if (filters.endDate && timestamp > new Date(filters.endDate)) return false;
          return true;
        });
      }

      // Filtrar por coordenadas
      if (filters.latMin !== undefined || filters.latMax !== undefined || 
          filters.lonMin !== undefined || filters.lonMax !== undefined) {
        parcelas = parcelas.filter(p => {
          if (filters.latMin !== undefined && p.coords.lat < filters.latMin) return false;
          if (filters.latMax !== undefined && p.coords.lat > filters.latMax) return false;
          if (filters.lonMin !== undefined && p.coords.lon < filters.lonMin) return false;
          if (filters.lonMax !== undefined && p.coords.lon > filters.lonMax) return false;
          return true;
        });
      }

      return parcelas;
    } catch (error) {
      throw new Error(`Error al filtrar parcelas: ${error}`);
    }
  }
}