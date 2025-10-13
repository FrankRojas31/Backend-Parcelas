import { pool_mongo } from "../../connection/mongo";
import { SensorData, MongoSensorData } from "../../types/external/Sensors.type";
import { ObjectId } from "mongodb";

export class ParcelasMongoRepository {
  private collection = pool_mongo.collection<SensorData>('parcelas');

  // Validar si el ID es un ObjectId válido
  private isValidObjectId(id: string): boolean {
    return ObjectId.isValid(id) && (id.length === 24);
  }

  // Obtener todas las parcelas de MongoDB
  async getAll() {
    try {
      return await this.collection.find({ isDeleted: { $ne: true } }).toArray();
    } catch (error) {
      throw new Error(`Error al obtener parcelas de MongoDB: ${error}`);
    }
  }

  // Obtener parcela por ID
  async getById(id: string) {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error('ID inválido: debe ser un ObjectId válido de 24 caracteres hexadecimales');
      }

      return await this.collection.findOne({ 
        _id: new ObjectId(id),
        isDeleted: { $ne: true }
      });
    } catch (error) {
      throw new Error(`Error al obtener parcela por ID: ${error}`);
    }
  }

  // Obtener parcelas por coordenadas (rango)
  async getByCoordinates(latMin: number, latMax: number, lonMin: number, lonMax: number) {
    try {
      return await this.collection.find({
        isDeleted: { $ne: true },
        "coords.lat": { $gte: latMin, $lte: latMax },
        "coords.lon": { $gte: lonMin, $lte: lonMax }
      }).toArray();
    } catch (error) {
      throw new Error(`Error al obtener parcelas por coordenadas: ${error}`);
    }
  }

  // Obtener parcelas por rango de fechas
  async getByDateRange(startDate: Date, endDate: Date) {
    try {
      return await this.collection.find({
        isDeleted: { $ne: true },
        timestamp: { $gte: startDate, $lte: endDate }
      }).toArray();
    } catch (error) {
      throw new Error(`Error al obtener parcelas por fecha: ${error}`);
    }
  }

  // Obtener parcelas por valor (sensores)
  async getByValueRange(minValue: number, maxValue: number) {
    try {
      return await this.collection.find({
        isDeleted: { $ne: true },
        value: { $gte: minValue, $lte: maxValue }
      }).toArray();
    } catch (error) {
      throw new Error(`Error al obtener parcelas por valor: ${error}`);
    }
  }

  // Obtener parcelas por unidad
  async getByUnit(unit: string) {
    try {
      return await this.collection.find({
        isDeleted: { $ne: true },
        unit: unit
      }).toArray();
    } catch (error) {
      throw new Error(`Error al obtener parcelas por unidad: ${error}`);
    }
  }

  // Crear nueva parcela
  async create(data: SensorData) {
    try {
      const result = await this.collection.insertOne(data);
      return await this.collection.findOne({ _id: result.insertedId });
    } catch (error) {
      throw new Error(`Error al crear parcela: ${error}`);
    }
  }

  // Actualizar parcela
  async update(id: string, data: Partial<SensorData>) {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error('ID inválido: debe ser un ObjectId válido de 24 caracteres hexadecimales');
      }

      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      if (result.matchedCount === 0) {
        throw new Error('Parcela no encontrada');
      }
      return await this.collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      throw new Error(`Error al actualizar parcela: ${error}`);
    }
  }

  // Borrado lógico
  async softDelete(id: string) {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error('ID inválido: debe ser un ObjectId válido de 24 caracteres hexadecimales');
      }

      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isDeleted: true } }
      );
      if (result.matchedCount === 0) {
        throw new Error('Parcela no encontrada');
      }
      return result;
    } catch (error) {
      throw new Error(`Error al eliminar parcela: ${error}`);
    }
  }

  // Borrado físico
  async hardDelete(id: string) {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error('ID inválido: debe ser un ObjectId válido de 24 caracteres hexadecimales');
      }

      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        throw new Error('Parcela no encontrada');
      }
      return result;
    } catch (error) {
      throw new Error(`Error al eliminar parcela: ${error}`);
    }
  }

  // Obtener estadísticas
  async getStats() {
    try {
      const stats = await this.collection.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: "$unit",
            count: { $sum: 1 },
            avgValue: { $avg: "$value" },
            minValue: { $min: "$value" },
            maxValue: { $max: "$value" }
          }
        }
      ]).toArray();
      return stats;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error}`);
    }
  }
}