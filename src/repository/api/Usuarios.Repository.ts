import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class UsuariosRepository {
  // Obtener todos los usuarios
  async getAll() {
    return await prisma.tbl_Usuarios.findMany({
      where: { borrado: false },
      include: {
        Tbl_Roles: true,
        Tbl_Persona: true,
        Tbl_Parcelas: {
          where: { borrado: false }
        },
        Tbl_Logs: true
      }
    });
  }

  // Obtener usuario por ID
  async getById(id: number) {
    return await prisma.tbl_Usuarios.findUnique({
      where: { id },
      include: {
        Tbl_Roles: true,
        Tbl_Persona: true,
        Tbl_Parcelas: {
          where: { borrado: false }
        },
        Tbl_Logs: true
      }
    });
  }

  // Obtener usuario por username
  async getByUsername(username: string) {
    return await prisma.tbl_Usuarios.findUnique({
      where: { username },
      include: {
        Tbl_Roles: true,
        Tbl_Persona: true
      }
    });
  }

  // Obtener usuario por email
  async getByEmail(email: string) {
    return await prisma.tbl_Usuarios.findUnique({
      where: { email },
      include: {
        Tbl_Roles: true,
        Tbl_Persona: true
      }
    });
  }

  // Crear usuario
  async create(data: {
    username: string;
    password_hash: string;
    email: string;
    id_role: number;
    id_persona: number;
  }) {
    return await prisma.tbl_Usuarios.create({
      data,
      include: {
        Tbl_Roles: true,
        Tbl_Persona: true
      }
    });
  }

  // Actualizar usuario
  async update(id: number, data: Partial<{
    username: string;
    password_hash: string;
    email: string;
    id_role: number;
    id_persona: number;
  }>) {
    return await prisma.tbl_Usuarios.update({
      where: { id },
      data,
      include: {
        Tbl_Roles: true,
        Tbl_Persona: true
      }
    });
  }

  // Borrado lógico
  async softDelete(id: number) {
    return await prisma.tbl_Usuarios.update({
      where: { id },
      data: { borrado: true }
    });
  }

  // Borrado físico
  async hardDelete(id: number) {
    return await prisma.tbl_Usuarios.delete({
      where: { id }
    });
  }

  // Obtener usuarios por rol
  async getByRole(id_role: number) {
    return await prisma.tbl_Usuarios.findMany({
      where: { 
        id_role,
        borrado: false 
      },
      include: {
        Tbl_Roles: true,
        Tbl_Persona: true
      }
    });
  }
}
