import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class ParcelasRepositorySQL {
  // Obtener todas las parcelas
  async getAll() {
    return await prisma.tbl_Parcelas.findMany({
      where: { borrado: false },
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true,
            Tbl_Roles: true
          }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });
  }

  // Obtener parcela por ID
  async getById(id: number) {
    return await prisma.tbl_Parcelas.findUnique({
      where: { id },
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true,
            Tbl_Roles: true
          }
        }
      }
    });
  }

  // Obtener parcelas por usuario
  async getByUsuario(id_usuario: number) {
    return await prisma.tbl_Parcelas.findMany({
      where: { 
        id_usuario,
        borrado: false 
      },
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true
          }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });
  }

  // Crear parcela
  async create(data: {
    latitud: string;
    longitud: string;
    nombre: string;
    id_usuario: number;
  }) {
    return await prisma.tbl_Parcelas.create({
      data,
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true
          }
        }
      }
    });
  }

  // Actualizar parcela
  async update(id: number, data: Partial<{
    latitud: string;
    longitud: string;
    nombre: string;
    id_usuario: number;
  }>) {
    return await prisma.tbl_Parcelas.update({
      where: { id },
      data,
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true
          }
        }
      }
    });
  }

  // Borrado lógico
  async softDelete(id: number) {
    return await prisma.tbl_Parcelas.update({
      where: { id },
      data: { borrado: true }
    });
  }

  // Borrado físico
  async hardDelete(id: number) {
    return await prisma.tbl_Parcelas.delete({
      where: { id }
    });
  }

  // Buscar parcelas por nombre
  async searchByName(nombre: string) {
    return await prisma.tbl_Parcelas.findMany({
      where: {
        nombre: {
          contains: nombre
        },
        borrado: false
      },
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true
          }
        }
      }
    });
  }
}
