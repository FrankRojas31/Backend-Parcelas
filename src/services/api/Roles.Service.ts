import { RolesRepository } from '../../repository/api/Roles.Repository';

const rolesRepo = new RolesRepository();

export class RolesService {
  // Obtener todos los roles
  async getAllRoles() {
    try {
      return await rolesRepo.getAll();
    } catch (error) {
      throw new Error(`Error al obtener roles: ${error}`);
    }
  }

  // Obtener rol por ID
  async getRolById(id: number) {
    try {
      const rol = await rolesRepo.getById(id);
      if (!rol || rol.borrado) {
        throw new Error('Rol no encontrado');
      }
      return rol;
    } catch (error) {
      throw new Error(`Error al obtener rol: ${error}`);
    }
  }

  // Obtener rol por nombre
  async getRolByName(nombre: string) {
    try {
      const rol = await rolesRepo.getByName(nombre);
      if (!rol || rol.borrado) {
        throw new Error('Rol no encontrado');
      }
      return rol;
    } catch (error) {
      throw new Error(`Error al obtener rol: ${error}`);
    }
  }

  // Crear rol
  async createRol(data: { nombre: string }) {
    try {
      // Verificar si el rol ya existe
      const existingRol = await rolesRepo.getByName(data.nombre);
      if (existingRol && !existingRol.borrado) {
        throw new Error('El rol ya existe');
      }

      return await rolesRepo.create(data);
    } catch (error) {
      throw new Error(`Error al crear rol: ${error}`);
    }
  }

  // Actualizar rol
  async updateRol(id: number, data: { nombre: string }) {
    try {
      const rol = await rolesRepo.getById(id);
      if (!rol || rol.borrado) {
        throw new Error('Rol no encontrado');
      }

      // Verificar si el nuevo nombre ya existe
      const existingRol = await rolesRepo.getByName(data.nombre);
      if (existingRol && existingRol.id !== id && !existingRol.borrado) {
        throw new Error('El nombre del rol ya existe');
      }

      return await rolesRepo.update(id, data);
    } catch (error) {
      throw new Error(`Error al actualizar rol: ${error}`);
    }
  }

  // Borrado lógico
  async deleteRol(id: number) {
    try {
      const rol = await rolesRepo.getById(id);
      if (!rol || rol.borrado) {
        throw new Error('Rol no encontrado');
      }
      return await rolesRepo.softDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar rol: ${error}`);
    }
  }
}
