import { Request, Response } from 'express';
import { ParcelasServiceSQL } from '../../services/api/ParcelasSQL.Service';
import { ParcelasMongoRepository } from '../../repository/api/ParcelasMongo.Repository';
import { ResponseHelperClass } from '../../types/api/ResponseHelper';

const parcelasService = new ParcelasServiceSQL();
const parcelasMongoRepo = new ParcelasMongoRepository();

export class ParcelasSQLController {
  // GET /api/parcelas-sql - Obtener todas las parcelas
  async getAll(req: Request, res: Response) {
    try {
      const parcelas = await parcelasService.getAllParcelas();
      return ResponseHelperClass.success(res, parcelas, 'Parcelas obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/parcelas-sql/:id - Obtener parcela por ID
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const parcela = await parcelasService.getParcelaById(id);
      return ResponseHelperClass.success(res, parcela, 'Parcela obtenida exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // GET /api/parcelas-sql/usuario/:id_usuario - Obtener parcelas por usuario
  async getByUsuario(req: Request, res: Response) {
    try {
      const id_usuario = parseInt(req.params.id_usuario);
      const parcelas = await parcelasService.getParcelasByUsuario(id_usuario);
      return ResponseHelperClass.success(res, parcelas, 'Parcelas obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/parcelas-sql/search/:nombre - Buscar parcelas por nombre
  async searchByName(req: Request, res: Response) {
    try {
      const nombre = req.params.nombre;
      const parcelas = await parcelasService.searchParcelasByName(nombre);
      return ResponseHelperClass.success(res, parcelas, 'Búsqueda completada exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // POST /api/parcelas-sql - Crear nueva parcela
  async create(req: Request, res: Response) {
    try {
      const { nombre, id_usuario, parcelaMg_Id } = req.body;

      if (!nombre || !id_usuario || !parcelaMg_Id) {
        return ResponseHelperClass.error(res, 'Todos los campos son requeridos (nombre, id_usuario, parcelaMg_Id)', 400);
      }

      const parcela = await parcelasService.createParcela({
        nombre,
        id_usuario: parseInt(id_usuario),
        parcelaMg_Id
      });

      return ResponseHelperClass.success(res, parcela, 'Parcela creada exitosamente', 201);
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // PUT /api/parcelas-sql/:id - Actualizar parcela
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { nombre, id_usuario, parcelaMg_Id } = req.body;

      const updateData: any = {};
      if (nombre) updateData.nombre = nombre;
      if (id_usuario) updateData.id_usuario = parseInt(id_usuario);
      if (parcelaMg_Id) updateData.parcelaMg_Id = parcelaMg_Id;

      const parcela = await parcelasService.updateParcela(id, updateData);
      return ResponseHelperClass.success(res, parcela, 'Parcela actualizada exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // DELETE /api/parcelas-sql/:id - Eliminar parcela (borrado lógico)
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await parcelasService.deleteParcela(id);
      return ResponseHelperClass.success(res, null, 'Parcela eliminada exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // GET /api/parcelas-sql/table - Obtener parcelas para tabla (con información de responsables y coordenadas de MongoDB)
  async getForTable(req: Request, res: Response) {
    try {
      const parcelasSQL = await parcelasService.getAllParcelas();
      
      // Obtener datos de MongoDB para cada parcela que tenga parcelaMg_Id
      const parcelasTabla = await Promise.all(
        parcelasSQL.map(async (parcelaSQL: any) => {
          let mongoData: any = null;
          
          // Si tiene parcelaMg_Id, obtener datos de MongoDB
          if (parcelaSQL.parcelaMg_Id) {
            try {
              mongoData = await parcelasMongoRepo.getById(parcelaSQL.parcelaMg_Id);
            } catch (error) {
              console.error(`Error al obtener datos de MongoDB para ${parcelaSQL.parcelaMg_Id}:`, error);
            }
          }
          
          // Construir estructura de sensores desde MongoDB si existe
          let sensoresStructure = null;
          if (mongoData) {
            const sensorType = mongoData.type || 'temperatura';
            sensoresStructure = {
              [sensorType]: [{
                value: mongoData.value || 0,
                unit: mongoData.unit || (
                  mongoData.type === 'humedad' ? '%' : 
                  mongoData.type === 'lluvia' ? 'mm' : 
                  mongoData.type === 'radiacion_solar' ? 'W/m²' : 
                  '°C'
                ),
                timestamp: mongoData.timestamp || new Date(),
                coords: mongoData.coords || { lat: 0, lon: 0 },
                type: sensorType
              }]
            };
          }

          return {
            id: parcelaSQL.id,
            nombre: parcelaSQL.nombre,
            parcelaMg_Id: parcelaSQL.parcelaMg_Id,
            fecha_creacion: parcelaSQL.fecha_creacion,
            borrado: parcelaSQL.borrado,
            // Datos de MongoDB si existen
            coords: mongoData?.coords || null,
            sensores: sensoresStructure,
            timestamp: mongoData?.timestamp || null,
            isDeleted: mongoData?.isDeleted || false,
            // Estructura de responsable adaptada
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
            // Mantener la estructura SQL original para referencia
            Tbl_Usuarios: parcelaSQL.Tbl_Usuarios
          };
        })
      );
      
      return ResponseHelperClass.success(res, parcelasTabla, 'Parcelas para tabla obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }
}
