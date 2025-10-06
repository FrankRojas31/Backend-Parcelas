import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class PersonaRepository {
  // Obtener todas las personas
  async getAll() {
    return await prisma.tbl_Persona.findMany({
      where: { borrado: false },
      include: {
        Tbl_Usuarios: {
          where: { borrado: false },
          include: {
            Tbl_Roles: true
          }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });
  }

  // Obtener persona por ID
  async getById(id: number) {
    return await prisma.tbl_Persona.findUnique({
      where: { id },
      include: {
        Tbl_Usuarios: {
          where: { borrado: false },
          include: {
            Tbl_Roles: true
          }
        }
      }
    });
  }

  // Buscar personas por nombre
  async searchByName(nombre: string) {
    return await prisma.tbl_Persona.findMany({
      where: {
        OR: [
          { nombre: { contains: nombre } },
          { apellido_paterno: { contains: nombre } },
          { apellido_materno: { contains: nombre } }
        ],
        borrado: false
      },
      include: {
        Tbl_Usuarios: {
          where: { borrado: false }
        }
      }
    });
  }

  // Crear persona
  async create(data: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono?: string;
    direccion?: string;
    fecha_nacimiento?: Date;
  }) {
    return await prisma.tbl_Persona.create({
      data
    });
  }

  // Actualizar persona
  async update(id: number, data: Partial<{
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono: string;
    direccion: string;
    fecha_nacimiento: Date;
  }>) {
    return await prisma.tbl_Persona.update({
      where: { id },
      data
    });
  }

  // Borrado lógico
  async softDelete(id: number) {
    return await prisma.tbl_Persona.update({
      where: { id },
      data: { borrado: true }
    });
  }

  // Borrado físico
  async hardDelete(id: number) {
    return await prisma.tbl_Persona.delete({
      where: { id }
    });
  }
}
