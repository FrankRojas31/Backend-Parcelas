import { Request, Response } from 'express';
import { RolesService } from '../../services/api/Roles.Service';
import { ResponseHelperClass } from '../../types/api/ResponseHelper';

const rolesService = new RolesService();

export class RolesController {
  // GET /api/roles - Obtener todos los roles
  async getAll(req: Request, res: Response) {
    try {
      const roles = await rolesService.getAllRoles();
      return ResponseHelperClass.success(res, roles, 'Roles obtenidos exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/roles/:id - Obtener rol por ID
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const rol = await rolesService.getRolById(id);
      return ResponseHelperClass.success(res, rol, 'Rol obtenido exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // GET /api/roles/nombre/:nombre - Obtener rol por nombre
  async getByName(req: Request, res: Response) {
    try {
      const nombre = req.params.nombre;
      const rol = await rolesService.getRolByName(nombre);
      return ResponseHelperClass.success(res, rol, 'Rol obtenido exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // POST /api/roles - Crear nuevo rol
  async create(req: Request, res: Response) {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return ResponseHelperClass.error(res, 'El nombre del rol es requerido', 400);
      }

      const rol = await rolesService.createRol({ nombre });
      return ResponseHelperClass.success(res, rol, 'Rol creado exitosamente', 201);
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // PUT /api/roles/:id - Actualizar rol
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { nombre } = req.body;

      if (!nombre) {
        return ResponseHelperClass.error(res, 'El nombre del rol es requerido', 400);
      }

      const rol = await rolesService.updateRol(id, { nombre });
      return ResponseHelperClass.success(res, rol, 'Rol actualizado exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // DELETE /api/roles/:id - Eliminar rol (borrado lógico)
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await rolesService.deleteRol(id);
      return ResponseHelperClass.success(res, null, 'Rol eliminado exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }
}
