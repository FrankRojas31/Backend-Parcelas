import { PersonaRepository } from '../../repository/api/Persona.Repository';

const personaRepo = new PersonaRepository();

export class PersonaService {
  // Obtener todas las personas
  async getAllPersonas() {
    try {
      return await personaRepo.getAll();
    } catch (error) {
      throw new Error(`Error al obtener personas: ${error}`);
    }
  }

  // Obtener persona por ID
  async getPersonaById(id: number) {
    try {
      const persona = await personaRepo.getById(id);
      if (!persona || persona.borrado) {
        throw new Error('Persona no encontrada');
      }
      return persona;
    } catch (error) {
      throw new Error(`Error al obtener persona: ${error}`);
    }
  }

  // Buscar personas por nombre
  async searchPersonasByName(nombre: string) {
    try {
      return await personaRepo.searchByName(nombre);
    } catch (error) {
      throw new Error(`Error al buscar personas: ${error}`);
    }
  }

  // Crear persona
  async createPersona(data: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono?: string;
    direccion?: string;
    fecha_nacimiento?: string;
  }) {
    try {
      const personaData: any = {
        nombre: data.nombre,
        apellido_paterno: data.apellido_paterno,
        apellido_materno: data.apellido_materno,
        telefono: data.telefono,
        direccion: data.direccion
      };

      if (data.fecha_nacimiento) {
        personaData.fecha_nacimiento = new Date(data.fecha_nacimiento);
      }

      return await personaRepo.create(personaData);
    } catch (error) {
      throw new Error(`Error al crear persona: ${error}`);
    }
  }

  // Actualizar persona
  async updatePersona(id: number, data: Partial<{
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono: string;
    direccion: string;
    fecha_nacimiento: string;
  }>) {
    try {
      const persona = await personaRepo.getById(id);
      if (!persona || persona.borrado) {
        throw new Error('Persona no encontrada');
      }

      const updateData: any = { ...data };
      if (data.fecha_nacimiento) {
        updateData.fecha_nacimiento = new Date(data.fecha_nacimiento);
      }

      return await personaRepo.update(id, updateData);
    } catch (error) {
      throw new Error(`Error al actualizar persona: ${error}`);
    }
  }

  // Borrado lógico
  async deletePersona(id: number) {
    try {
      const persona = await personaRepo.getById(id);
      if (!persona || persona.borrado) {
        throw new Error('Persona no encontrada');
      }
      return await personaRepo.softDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar persona: ${error}`);
    }
  }
}
