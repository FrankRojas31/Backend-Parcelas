import { Request, Response } from 'express';
import { LogsService } from '../../services/api/Logs.Service';
import { ResponseHelperClass } from '../../types/api/ResponseHelper';

const logsService = new LogsService();

export class LogsController {
  // GET /api/logs - Obtener todos los logs
  async getAll(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await logsService.getAllLogs(limit);
      return ResponseHelperClass.success(res, logs, 'Logs obtenidos exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/logs/:id - Obtener log por ID
  async getById(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);
      const log = await logsService.getLogById(id);
      return ResponseHelperClass.success(res, log, 'Log obtenido exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // GET /api/logs/usuario/:id_usuario - Obtener logs por usuario
  async getByUsuario(req: Request, res: Response) {
    try {
      const id_usuario = parseInt(req.params.id_usuario);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await logsService.getLogsByUsuario(id_usuario, limit);
      return ResponseHelperClass.success(res, logs, 'Logs obtenidos exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/logs/accion/:accion - Obtener logs por acción
  async getByAccion(req: Request, res: Response) {
    try {
      const accion = req.params.accion;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await logsService.getLogsByAccion(accion, limit);
      return ResponseHelperClass.success(res, logs, 'Logs obtenidos exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/logs/entidad/:entidad - Obtener logs por entidad
  async getByEntidad(req: Request, res: Response) {
    try {
      const entidad = req.params.entidad;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await logsService.getLogsByEntidad(entidad, limit);
      return ResponseHelperClass.success(res, logs, 'Logs obtenidos exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/logs/fecha - Obtener logs por rango de fechas
  async getByFecha(req: Request, res: Response) {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
        return ResponseHelperClass.error(res, 'Las fechas de inicio y fin son requeridas', 400);
      }

      const logs = await logsService.getLogsByFecha(
        fechaInicio as string,
        fechaFin as string
      );
      return ResponseHelperClass.success(res, logs, 'Logs obtenidos exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // POST /api/logs - Crear nuevo log
  async create(req: Request, res: Response) {
    try {
      const { 
        id_usuario, 
        accion, 
        descripcion, 
        entidad, 
        id_entidad_afectada, 
        ip_origen, 
        user_agent 
      } = req.body;

      if (!accion) {
        return ResponseHelperClass.error(res, 'La acción es requerida', 400);
      }

      const log = await logsService.createLog({
        id_usuario: id_usuario ? parseInt(id_usuario) : undefined,
        accion,
        descripcion,
        entidad,
        id_entidad_afectada: id_entidad_afectada ? parseInt(id_entidad_afectada) : undefined,
        ip_origen: ip_origen || req.ip,
        user_agent: user_agent || req.get('user-agent')
      });

      return ResponseHelperClass.success(res, log, 'Log creado exitosamente', 201);
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // GET /api/logs/parcelas-eliminadas - Obtener historial de parcelas eliminadas
  async getParcelasEliminadas(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await logsService.getParcelasEliminadas(limit);
      return ResponseHelperClass.success(res, logs, 'Historial de parcelas eliminadas obtenido exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // DELETE /api/logs/:id - Eliminar log (raramente usado)
  async delete(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);
      await logsService.deleteLog(id);
      return ResponseHelperClass.success(res, null, 'Log eliminado exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }
}
