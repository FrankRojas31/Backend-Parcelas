import { ParcelasRepositorySQL } from '../../repository/api/ParcelasSQL.Repository';
import { ParcelasMongoRepository } from '../../repository/api/ParcelasMongo.Repository';
import { LogsService } from './Logs.Service';

const parcelasRepo = new ParcelasRepositorySQL();
const parcelasMongoRepo = new ParcelasMongoRepository();
const logsService = new LogsService();

export class ParcelasServiceSQL {
  // Obtener todas las parcelas
  async getAllParcelas() {
    try {
      return await parcelasRepo.getAll();
    } catch (error) {
      throw new Error(`Error al obtener parcelas: ${error}`);
    }
  }

  // Obtener parcela por ID
  async getParcelaById(id: number) {
    try {
      const parcela = await parcelasRepo.getById(id);
      if (!parcela || parcela.borrado) {
        throw new Error('Parcela no encontrada');
      }
      return parcela;
    } catch (error) {
      throw new Error(`Error al obtener parcela: ${error}`);
    }
  }

  // Obtener parcelas por usuario
  async getParcelasByUsuario(id_usuario: number) {
    try {
      return await parcelasRepo.getByUsuario(id_usuario);
    } catch (error) {
      throw new Error(`Error al obtener parcelas del usuario: ${error}`);
    }
  }

  // Crear parcela
  async createParcela(data: {
    nombre: string;
    id_usuario: number;
    parcelaMg_Id: string;
  }) {
    try {
      return await parcelasRepo.create(data);
    } catch (error) {
      throw new Error(`Error al crear parcela: ${error}`);
    }
  }

  // Actualizar parcela
  async updateParcela(id: number, data: Partial<{
    nombre: string;
    id_usuario: number;
    parcelaMg_Id: string;
  }>) {
    try {
      const parcela = await parcelasRepo.getById(id);
      if (!parcela || parcela.borrado) {
        throw new Error('Parcela no encontrada');
      }
      return await parcelasRepo.update(id, data);
    } catch (error) {
      throw new Error(`Error al actualizar parcela: ${error}`);
    }
  }

  // Borrado lógico
  async deleteParcela(id: number, id_usuario?: number) {
    try {
      const parcela = await parcelasRepo.getById(id);
      if (!parcela || parcela.borrado) {
        throw new Error('Parcela no encontrada');
      }
      
      // Si la parcela tiene un parcelaMg_Id, marcar como eliminado en MongoDB
      if (parcela.parcelaMg_Id) {
        try {
          console.log(`🗑️ Marcando como eliminado en MongoDB: ${parcela.parcelaMg_Id}`);
          await parcelasMongoRepo.softDelete(parcela.parcelaMg_Id);
          console.log(`✅ Parcela MongoDB marcada como eliminada`);
        } catch (mongoError) {
          console.error(`⚠️ Error al eliminar en MongoDB (continuando con SQL):`, mongoError);
          // Continuamos con la eliminación en SQL aunque falle en MongoDB
        }
      }
      
      // Eliminar en SQL Server
      const result = await parcelasRepo.softDelete(id);
      
      // Registrar en logs
      try {
        await logsService.createLog({
          id_usuario: id_usuario || (parcela.id_usuario ?? undefined),
          accion: 'ELIMINAR',
          entidad: 'PARCELA',
          id_entidad_afectada: id,
          descripcion: `Parcela "${parcela.nombre}" eliminada${parcela.parcelaMg_Id ? ' (MongoDB ID: ' + parcela.parcelaMg_Id + ')' : ''}`
        });
        console.log(`📝 Log de eliminación registrado`);
      } catch (logError) {
        console.error(`⚠️ Error al registrar log:`, logError);
        // No fallamos la operación si el log falla
      }
      
      return result;
    } catch (error) {
      throw new Error(`Error al eliminar parcela: ${error}`);
    }
  }

  // Buscar parcelas por nombre
  async searchParcelasByName(nombre: string) {
    try {
      return await parcelasRepo.searchByName(nombre);
    } catch (error) {
      throw new Error(`Error al buscar parcelas: ${error}`);
    }
  }
}
