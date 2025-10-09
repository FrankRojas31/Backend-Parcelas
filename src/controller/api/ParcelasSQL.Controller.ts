import { Request, Response } from 'express';
import { ParcelasServiceSQL } from '../../services/api/ParcelasSQL.Service';
import { ResponseHelperClass } from '../../types/api/ResponseHelper';

const parcelasService = new ParcelasServiceSQL();

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

  // POST /api/parcelas-sql - Crear nueva parcela asociada a MongoDB
  async create(req: Request, res: Response) {
    try {
      const { parcelaMg_Id, nombre, id_usuario } = req.body;

      if (!parcelaMg_Id || !nombre) {
        return ResponseHelperClass.error(res, 'parcelaMg_Id y nombre son requeridos', 400);
      }

      const parcela = await parcelasService.createParcela({
        parcelaMg_Id,
        nombre,
        id_usuario: id_usuario ? parseInt(id_usuario) : undefined
      });

      return ResponseHelperClass.success(res, parcela, 'Parcela creada exitosamente', 201);
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // GET /api/parcelas-sql/mongo/:parcelaMg_Id - Obtener parcela SQL por ID de MongoDB
  async getByMongoId(req: Request, res: Response) {
    try {
      const parcelaMg_Id = req.params.parcelaMg_Id;
      const parcela = await parcelasService.getParcelaByMongoId(parcelaMg_Id);
      return ResponseHelperClass.success(res, parcela, 'Parcela obtenida exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // PUT /api/parcelas-sql/:id - Actualizar parcela
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { latitud, longitud, nombre, id_usuario } = req.body;

      const updateData: any = {};
      if (latitud) updateData.latitud = latitud;
      if (longitud) updateData.longitud = longitud;
      if (nombre) updateData.nombre = nombre;
      if (id_usuario) updateData.id_usuario = parseInt(id_usuario);

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
      const id_usuario = req.body.id_usuario; // Opcional: ID del usuario que realiza la acción
      await parcelasService.deleteParcela(id, id_usuario);
      return ResponseHelperClass.success(res, null, 'Parcela eliminada exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  async getForTable(req: Request, res: Response) {
    try {
      const parcelas = await parcelasService.getParcelasForTable();
      return ResponseHelperClass.success(res, parcelas, 'Parcelas para tabla obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }
}
