import { UsuariosRepository } from '../../repository/api/Usuarios.Repository';
import bcrypt from 'bcrypt';

const usuariosRepo = new UsuariosRepository();

export class UsuariosService {
  // Obtener todos los usuarios
  async getAllUsuarios() {
    try {
      return await usuariosRepo.getAll();
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error}`);
    }
  }

  // Obtener usuario por ID
  async getUsuarioById(id: number) {
    try {
      const usuario = await usuariosRepo.getById(id);
      if (!usuario || usuario.borrado) {
        throw new Error('Usuario no encontrado');
      }
      return usuario;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error}`);
    }
  }

  // Obtener usuario por username
  async getUsuarioByUsername(username: string) {
    try {
      const usuario = await usuariosRepo.getByUsername(username);
      if (!usuario || usuario.borrado) {
        throw new Error('Usuario no encontrado');
      }
      return usuario;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error}`);
    }
  }

  // Obtener usuario por email
  async getUsuarioByEmail(email: string) {
    try {
      const usuario = await usuariosRepo.getByEmail(email);
      if (!usuario || usuario.borrado) {
        throw new Error('Usuario no encontrado');
      }
      return usuario;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error}`);
    }
  }

  // Crear usuario
  async createUsuario(data: {
    username: string;
    password: string;
    email: string;
    id_role: number;
    id_persona: number;
  }) {
    try {
      // Verificar si el username ya existe
      const existingUsername = await usuariosRepo.getByUsername(data.username);
      if (existingUsername && !existingUsername.borrado) {
        throw new Error('El username ya existe');
      }

      // Verificar si el email ya existe
      const existingEmail = await usuariosRepo.getByEmail(data.email);
      if (existingEmail && !existingEmail.borrado) {
        throw new Error('El email ya existe');
      }

      // Hash de la contraseña
      const password_hash = await bcrypt.hash(data.password, 10);

      return await usuariosRepo.create({
        username: data.username,
        password_hash,
        email: data.email,
        id_role: data.id_role,
        id_persona: data.id_persona
      });
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error}`);
    }
  }

  // Actualizar usuario
  async updateUsuario(id: number, data: Partial<{
    username: string;
    password: string;
    email: string;
    id_role: number;
    id_persona: number;
  }>) {
    try {
      const usuario = await usuariosRepo.getById(id);
      if (!usuario || usuario.borrado) {
        throw new Error('Usuario no encontrado');
      }

      const updateData: any = { ...data };

      // Si se proporciona una nueva contraseña, hashearla
      if (data.password) {
        updateData.password_hash = await bcrypt.hash(data.password, 10);
        delete updateData.password;
      }

      return await usuariosRepo.update(id, updateData);
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error}`);
    }
  }

  // Borrado lógico
  async deleteUsuario(id: number) {
    try {
      const usuario = await usuariosRepo.getById(id);
      if (!usuario || usuario.borrado) {
        throw new Error('Usuario no encontrado');
      }
      return await usuariosRepo.softDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error}`);
    }
  }

  // Obtener usuarios por rol
  async getUsuariosByRole(id_role: number) {
    try {
      return await usuariosRepo.getByRole(id_role);
    } catch (error) {
      throw new Error(`Error al obtener usuarios por rol: ${error}`);
    }
  }

  // Validar credenciales (para login)
  async validateCredentials(username: string, password: string) {
    try {
      const usuario = await usuariosRepo.getByUsername(username);
      if (!usuario || usuario.borrado) {
        throw new Error('Credenciales inválidas');
      }

      const isValid = await bcrypt.compare(password, usuario.password_hash);
      if (!isValid) {
        throw new Error('Credenciales inválidas');
      }

      return usuario;
    } catch (error) {
      throw new Error(`Error al validar credenciales: ${error}`);
    }
  }
}
