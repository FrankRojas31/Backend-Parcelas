import { LogsRepository } from '../../repository/api/Logs.Repository';

const logsRepo = new LogsRepository();

export class LogsService {
  // Obtener todos los logs
  async getAllLogs(limit?: number) {
    try {
      return await logsRepo.getAll(limit);
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
      return log;
    } catch (error) {
      throw new Error(`Error al obtener log: ${error}`);
    }
  }

  // Obtener logs por usuario
  async getLogsByUsuario(id_usuario: number, limit?: number) {
    try {
      return await logsRepo.getByUsuario(id_usuario, limit);
    } catch (error) {
      throw new Error(`Error al obtener logs del usuario: ${error}`);
    }
  }

  // Obtener logs por acción
  async getLogsByAccion(accion: string, limit?: number) {
    try {
      return await logsRepo.getByAccion(accion, limit);
    } catch (error) {
      throw new Error(`Error al obtener logs por acción: ${error}`);
    }
  }

  // Obtener logs por entidad
  async getLogsByEntidad(entidad: string, limit?: number) {
    try {
      return await logsRepo.getByEntidad(entidad, limit);
    } catch (error) {
      throw new Error(`Error al obtener logs por entidad: ${error}`);
    }
  }

  // Obtener logs por rango de fechas
  async getLogsByFecha(fechaInicio: string, fechaFin: string) {
    try {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return await logsRepo.getByFecha(inicio, fin);
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
      return await logsRepo.create(data);
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

  // Eliminar log (normalmente no se hace)
  async deleteLog(id: bigint) {
    try {
      return await logsRepo.hardDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar log: ${error}`);
    }
  }
}
