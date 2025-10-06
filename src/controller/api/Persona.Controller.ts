import { Request, Response } from 'express';
import { PersonaService } from '../../services/api/Persona.Service';
import { ResponseHelperClass } from '../../types/api/ResponseHelper';

const personaService = new PersonaService();

export class PersonaController {
  // GET /api/personas - Obtener todas las personas
  async getAll(req: Request, res: Response) {
    try {
      const personas = await personaService.getAllPersonas();
      return ResponseHelperClass.success(res, personas, 'Personas obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/personas/:id - Obtener persona por ID
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const persona = await personaService.getPersonaById(id);
      return ResponseHelperClass.success(res, persona, 'Persona obtenida exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // GET /api/personas/search/:nombre - Buscar personas por nombre
  async searchByName(req: Request, res: Response) {
    try {
      const nombre = req.params.nombre;
      const personas = await personaService.searchPersonasByName(nombre);
      return ResponseHelperClass.success(res, personas, 'Búsqueda completada exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // POST /api/personas - Crear nueva persona
  async create(req: Request, res: Response) {
    try {
      const { 
        nombre, 
        apellido_paterno, 
        apellido_materno, 
        telefono, 
        direccion, 
        fecha_nacimiento 
      } = req.body;

      if (!nombre || !apellido_paterno || !apellido_materno) {
        return ResponseHelperClass.error(
          res, 
          'Nombre, apellido paterno y apellido materno son requeridos', 
          400
        );
      }

      const persona = await personaService.createPersona({
        nombre,
        apellido_paterno,
        apellido_materno,
        telefono,
        direccion,
        fecha_nacimiento
      });

      return ResponseHelperClass.success(res, persona, 'Persona creada exitosamente', 201);
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // PUT /api/personas/:id - Actualizar persona
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { 
        nombre, 
        apellido_paterno, 
        apellido_materno, 
        telefono, 
        direccion, 
        fecha_nacimiento 
      } = req.body;

      const updateData: any = {};
      if (nombre) updateData.nombre = nombre;
      if (apellido_paterno) updateData.apellido_paterno = apellido_paterno;
      if (apellido_materno) updateData.apellido_materno = apellido_materno;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (direccion !== undefined) updateData.direccion = direccion;
      if (fecha_nacimiento !== undefined) updateData.fecha_nacimiento = fecha_nacimiento;

      const persona = await personaService.updatePersona(id, updateData);
      return ResponseHelperClass.success(res, persona, 'Persona actualizada exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // DELETE /api/personas/:id - Eliminar persona (borrado lógico)
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await personaService.deletePersona(id);
      return ResponseHelperClass.success(res, null, 'Persona eliminada exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }
}
