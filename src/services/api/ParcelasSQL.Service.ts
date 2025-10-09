import { ParcelasRepositorySQL } from '../../repository/api/ParcelasSQL.Repository';
import { FindParcelas } from '../../repository/api/Parcelas.Repository';
import { LogsService } from './Logs.Service';
import { ObjectId } from 'mongodb';

const parcelasRepo = new ParcelasRepositorySQL();
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

  // Crear parcela con asociación a MongoDB
  async createParcela(data: {
    parcelaMg_Id: string;
    nombre: string;
    id_usuario?: number;
  }) {
    try {
      return await parcelasRepo.create(data);
    } catch (error) {
      throw new Error(`Error al crear parcela: ${error}`);
    }
  }

  // Obtener parcela por ID de MongoDB
  async getParcelaByMongoId(parcelaMg_Id: string) {
    try {
      const parcela = await parcelasRepo.getByMongoId(parcelaMg_Id);
      if (!parcela || parcela.borrado) {
        return null; // No encontrada
      }
      return parcela;
    } catch (error) {
      throw new Error(`Error al obtener parcela por MongoDB ID: ${error}`);
    }
  }

  // Actualizar parcela
  async updateParcela(id: number, data: Partial<{
    latitud: string;
    longitud: string;
    nombre: string;
    id_usuario: number;
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
      
      const result = await parcelasRepo.softDelete(id);
      
      // Registrar la eliminación en los logs
      try {
        await logsService.registrarAccion(
          id_usuario,
          'ELIMINAR_PARCELA',
          'Parcelas',
          id,
          `Parcela eliminada: ${parcela.nombre} (MongoDB ID: ${parcela.parcelaMg_Id})`
        );
      } catch (logError) {
        console.warn('Error al registrar log de eliminación:', logError);
        // No lanzar error para no afectar la eliminación principal
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

  // Obtener parcelas SQL con datos de MongoDB para la tabla
  async getParcelasForTable() {
    try {
      // Obtener solo las parcelas SQL (las que tienen responsables)
      const parcelasSQL = await parcelasRepo.getAll();
      
      // Obtener todas las parcelas de MongoDB para poder hacer el match
      const parcelasMongoArray = await FindParcelas();
      
      // Crear un Map para búsqueda rápida por ObjectId
      const parcelasMongoMap = new Map();
      parcelasMongoArray.forEach(parcela => {
        parcelasMongoMap.set(parcela._id.toString(), parcela);
      });

      // Combinar datos SQL con datos de MongoDB
      const parcelasWithData = parcelasSQL.map(parcelaSQL => {
        const parcelaMongo = parcelasMongoMap.get(parcelaSQL.parcelaMg_Id);
        
        if (parcelaMongo) {
          const timestamp = parcelaMongo.timestamp instanceof Date 
            ? parcelaMongo.timestamp.toISOString() 
            : new Date(parcelaMongo.timestamp).toISOString();
            
          return {
            // Datos de la parcela SQL
            id: parcelaSQL.id,
            nombre: parcelaSQL.nombre,
            parcelaMg_Id: parcelaSQL.parcelaMg_Id,
            fecha_creacion: parcelaSQL.fecha_creacion?.toISOString() || new Date().toISOString(),
            
            // Datos del responsable
            responsable: parcelaSQL.Tbl_Usuarios ? {
              id: parcelaSQL.Tbl_Usuarios.id,
              username: parcelaSQL.Tbl_Usuarios.username,
              email: parcelaSQL.Tbl_Usuarios.email,
              persona: parcelaSQL.Tbl_Usuarios.Tbl_Persona ? {
                nombre: parcelaSQL.Tbl_Usuarios.Tbl_Persona.nombre,
                apellido_paterno: parcelaSQL.Tbl_Usuarios.Tbl_Persona.apellido_paterno,
                apellido_materno: parcelaSQL.Tbl_Usuarios.Tbl_Persona.apellido_materno
              } : null
            } : null,

            // Datos de MongoDB (coordenadas y sensores)
            coords: {
              lat: parcelaMongo.coords.lat,
              lon: parcelaMongo.coords.lon
            },
            sensores: {
              temperatura: [{
                value: parcelaMongo.value,
                unit: parcelaMongo.unit,
                timestamp: timestamp,
                coords: parcelaMongo.coords,
                type: "temperatura"
              }]
            },
            timestamp: timestamp,
            isDeleted: parcelaMongo.isDeleted || false
          };
        } else {
          // Si no se encuentra la parcela en MongoDB, devolver datos básicos
          return {
            id: parcelaSQL.id,
            nombre: parcelaSQL.nombre,
            parcelaMg_Id: parcelaSQL.parcelaMg_Id,
            fecha_creacion: parcelaSQL.fecha_creacion?.toISOString() || new Date().toISOString(),
            responsable: parcelaSQL.Tbl_Usuarios ? {
              id: parcelaSQL.Tbl_Usuarios.id,
              username: parcelaSQL.Tbl_Usuarios.username,
              email: parcelaSQL.Tbl_Usuarios.email,
              persona: parcelaSQL.Tbl_Usuarios.Tbl_Persona ? {
                nombre: parcelaSQL.Tbl_Usuarios.Tbl_Persona.nombre,
                apellido_paterno: parcelaSQL.Tbl_Usuarios.Tbl_Persona.apellido_paterno,
                apellido_materno: parcelaSQL.Tbl_Usuarios.Tbl_Persona.apellido_materno
              } : null
            } : null,
            coords: null,
            sensores: null,
            timestamp: null,
            isDeleted: false,
            mongoDataMissing: true
          };
        }
      });

      return parcelasWithData;
    } catch (error) {
      throw new Error(`Error al obtener parcelas para tabla: ${error}`);
    }
  }
}
