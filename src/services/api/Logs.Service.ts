import { LogsRepository } from '../../repository/api/Logs.Repository';

const logsRepo = new LogsRepository();

// Helper para convertir BigInt a string y mapear campos
const transformLogData = (log: any) => {
  return {
    ...log,
    id: log.id_log?.toString() || log.id_log,
    id_log: log.id_log?.toString() || log.id_log,
    fecha_creacion: log.fecha, // Mapear el campo fecha a fecha_creacion para el frontend
  };
};

export class LogsService {
  // Obtener todos los logs
  async getAllLogs(limit?: number) {
    try {
      const logs = await logsRepo.getAll(limit);
      return logs.map(transformLogData);
    } catch (error) {
      throw new Error(`Error al obtener logs: ${error}`);
    }
  }

  // Obtener log por ID
  async getLogById(id: bigint) {
    try {
      const log = await logsRepo.getById(id);
      if (!log) {
        throw new Error('Log no encontrado');
      }
      return transformLogData(log);
    } catch (error) {
      throw new Error(`Error al obtener log: ${error}`);
    }
  }

  // Obtener logs por usuario
  async getLogsByUsuario(id_usuario: number, limit?: number) {
    try {
      const logs = await logsRepo.getByUsuario(id_usuario, limit);
      return logs.map(transformLogData);
    } catch (error) {
      throw new Error(`Error al obtener logs del usuario: ${error}`);
    }
  }

  // Obtener logs por acción
  async getLogsByAccion(accion: string, limit?: number) {
    try {
      const logs = await logsRepo.getByAccion(accion, limit);
      return logs.map(transformLogData);
    } catch (error) {
      throw new Error(`Error al obtener logs por acción: ${error}`);
    }
  }

  // Obtener logs por entidad
  async getLogsByEntidad(entidad: string, limit?: number) {
    try {
      const logs = await logsRepo.getByEntidad(entidad, limit);
      return logs.map(transformLogData);
    } catch (error) {
      throw new Error(`Error al obtener logs por entidad: ${error}`);
    }
  }

  // Obtener logs por rango de fechas
  async getLogsByFecha(fechaInicio: string, fechaFin: string) {
    try {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const logs = await logsRepo.getByFecha(inicio, fin);
      return logs.map(transformLogData);
    } catch (error) {
      throw new Error(`Error al obtener logs por fecha: ${error}`);
    }
  }

  // Crear log
  async createLog(data: {
    id_usuario?: number;
    accion: string;
    descripcion?: string;
    entidad?: string;
    id_entidad_afectada?: number;
    ip_origen?: string;
    user_agent?: string;
  }) {
    try {
      const log = await logsRepo.create(data);
      return transformLogData(log);
    } catch (error) {
      throw new Error(`Error al crear log: ${error}`);
    }
  }

  // Registrar acción de usuario (método helper)
  async registrarAccion(
    id_usuario: number | undefined,
    accion: string,
    entidad?: string,
    id_entidad_afectada?: number,
    descripcion?: string,
    ip_origen?: string,
    user_agent?: string
  ) {
    try {
      return await this.createLog({
        id_usuario,
        accion,
        entidad,
        id_entidad_afectada,
        descripcion,
        ip_origen,
        user_agent
      });
    } catch (error) {
      throw new Error(`Error al registrar acción: ${error}`);
    }
  }

  // Obtener logs de parcelas eliminadas
  async getParcelasEliminadas(limit?: number) {
    try {
      const logs = await logsRepo.getByAccion('ELIMINAR_PARCELA', limit);
      return logs.map(transformLogData);
    } catch (error) {
      throw new Error(`Error al obtener historial de parcelas eliminadas: ${error}`);
    }
  }

  // Eliminar log (normalmente no se hace)
  async deleteLog(id: bigint) {
    try {
      return await logsRepo.hardDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar log: ${error}`);
    }
  }
}
