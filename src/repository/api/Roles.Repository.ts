import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class RolesRepository {
  // Obtener todos los roles
  async getAll() {
    return await prisma.tbl_Roles.findMany({
      where: { borrado: false },
      include: {
        Tbl_Usuarios: {
          where: { borrado: false },
          include: {
            Tbl_Persona: true
          }
        }
      }
    });
  }

  // Obtener rol por ID
  async getById(id: number) {
    return await prisma.tbl_Roles.findUnique({
      where: { id },
      include: {
        Tbl_Usuarios: {
          where: { borrado: false },
          include: {
            Tbl_Persona: true
          }
        }
      }
    });
  }

  // Obtener rol por nombre
  async getByName(nombre: string) {
    return await prisma.tbl_Roles.findUnique({
      where: { nombre }
    });
  }

  // Crear rol
  async create(data: { nombre: string }) {
    return await prisma.tbl_Roles.create({
      data
    });
  }

  // Actualizar rol
  async update(id: number, data: { nombre: string }) {
    return await prisma.tbl_Roles.update({
      where: { id },
      data
    });
  }

  // Borrado lógico
  async softDelete(id: number) {
    return await prisma.tbl_Roles.update({
      where: { id },
      data: { borrado: true }
    });
  }

  // Borrado físico
  async hardDelete(id: number) {
    return await prisma.tbl_Roles.delete({
      where: { id }
    });
  }
}
