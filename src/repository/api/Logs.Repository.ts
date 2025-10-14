import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class LogsRepository {
  // Obtener todos los logs
  async getAll(limit?: number) {
    return await prisma.tbl_Logs.findMany({
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true,
            Tbl_Roles: true
          }
        }
      },
      orderBy: { fecha: 'desc' },
      take: limit
    });
  }

  // Obtener log por ID
  async getById(id: bigint) {
    return await prisma.tbl_Logs.findUnique({
      where: { id_log: id },
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

  // Obtener logs por usuario
  async getByUsuario(id_usuario: number, limit?: number) {
    return await prisma.tbl_Logs.findMany({
      where: { id_usuario },
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true
          }
        }
      },
      orderBy: { fecha: 'desc' },
      take: limit
    });
  }

  // Obtener logs por acción
  async getByAccion(accion: string, limit?: number) {
    return await prisma.tbl_Logs.findMany({
      where: { accion },
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true
          }
        }
      },
      orderBy: { fecha: 'desc' },
      take: limit
    });
  }

  // Obtener logs por entidad
  async getByEntidad(entidad: string, limit?: number) {
    return await prisma.tbl_Logs.findMany({
      where: { entidad },
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true
          }
        }
      },
      orderBy: { fecha: 'desc' },
      take: limit
    });
  }

  // Obtener logs por fecha
  async getByFecha(fechaInicio: Date, fechaFin: Date) {
    return await prisma.tbl_Logs.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        }
      },
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
  }

  // Crear log
  async create(data: {
    id_usuario?: number;
    accion: string;
    descripcion?: string;
    entidad?: string;
    id_entidad_afectada?: number;
    ip_origen?: string;
    user_agent?: string;
  }) {
    return await prisma.tbl_Logs.create({
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

  // Obtener logs de parcelas eliminadas
  async getParcelasEliminadas(limit?: number) {
    const logs = await prisma.tbl_Logs.findMany({
      where: {
        OR: [
          {
            accion: 'ELIMINAR',
            entidad: 'PARCELA'
          },
          {
            accion: 'ELIMINAR_PARCELA',
            entidad: 'Parcelas'
          }
        ]
      },
      include: {
        Tbl_Usuarios: {
          include: {
            Tbl_Persona: true,
            Tbl_Roles: true
          }
        }
      },
      orderBy: { fecha: 'desc' },
      take: limit
    });

    // Convertir BigInt a string para serialización JSON
    return logs.map(log => ({
      ...log,
      id_log: log.id_log.toString()
    }));
  }

  // Borrado físico (los logs normalmente no se borran)
  async hardDelete(id: bigint) {
    return await prisma.tbl_Logs.delete({
      where: { id_log: id }
    });
  }
}
