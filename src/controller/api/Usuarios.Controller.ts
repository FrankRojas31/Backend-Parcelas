import { Request, Response } from 'express';
import { UsuariosService } from '../../services/api/Usuarios.Service';
import { ResponseHelperClass } from '../../types/api/ResponseHelper';

const usuariosService = new UsuariosService();

export class UsuariosController {
  // GET /api/usuarios - Obtener todos los usuarios
  async getAll(req: Request, res: Response) {
    try {
      const usuarios = await usuariosService.getAllUsuarios();
      return ResponseHelperClass.success(res, usuarios, 'Usuarios obtenidos exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // GET /api/usuarios/:id - Obtener usuario por ID
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const usuario = await usuariosService.getUsuarioById(id);
      return ResponseHelperClass.success(res, usuario, 'Usuario obtenido exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // GET /api/usuarios/username/:username - Obtener usuario por username
  async getByUsername(req: Request, res: Response) {
    try {
      const username = req.params.username;
      const usuario = await usuariosService.getUsuarioByUsername(username);
      return ResponseHelperClass.success(res, usuario, 'Usuario obtenido exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // GET /api/usuarios/email/:email - Obtener usuario por email
  async getByEmail(req: Request, res: Response) {
    try {
      const email = req.params.email;
      const usuario = await usuariosService.getUsuarioByEmail(email);
      return ResponseHelperClass.success(res, usuario, 'Usuario obtenido exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // GET /api/usuarios/role/:id_role - Obtener usuarios por rol
  async getByRole(req: Request, res: Response) {
    try {
      const id_role = parseInt(req.params.id_role);
      const usuarios = await usuariosService.getUsuariosByRole(id_role);
      return ResponseHelperClass.success(res, usuarios, 'Usuarios obtenidos exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 500);
    }
  }

  // POST /api/usuarios - Crear nuevo usuario
  async create(req: Request, res: Response) {
    try {
      const { username, password, email, id_role, id_persona } = req.body;

      if (!username || !password || !email || !id_role || !id_persona) {
        return ResponseHelperClass.error(res, 'Todos los campos son requeridos', 400);
      }

      const usuario = await usuariosService.createUsuario({
        username,
        password,
        email,
        id_role: parseInt(id_role),
        id_persona: parseInt(id_persona)
      });

      return ResponseHelperClass.success(res, usuario, 'Usuario creado exitosamente', 201);
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // PUT /api/usuarios/:id - Actualizar usuario
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { username, password, email, id_role, id_persona } = req.body;

      const updateData: any = {};
      if (username) updateData.username = username;
      if (password) updateData.password = password;
      if (email) updateData.email = email;
      if (id_role) updateData.id_role = parseInt(id_role);
      if (id_persona) updateData.id_persona = parseInt(id_persona);

      const usuario = await usuariosService.updateUsuario(id, updateData);
      return ResponseHelperClass.success(res, usuario, 'Usuario actualizado exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 400);
    }
  }

  // DELETE /api/usuarios/:id - Eliminar usuario (borrado lógico)
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await usuariosService.deleteUsuario(id);
      return ResponseHelperClass.success(res, null, 'Usuario eliminado exitosamente');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 404);
    }
  }

  // POST /api/usuarios/login - Validar credenciales
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return ResponseHelperClass.error(res, 'Username y password son requeridos', 400);
      }

      const usuario = await usuariosService.validateCredentials(username, password);
      return ResponseHelperClass.success(res, usuario, 'Login exitoso');
    } catch (error: any) {
      return ResponseHelperClass.error(res, error.message, 401);
    }
  }
}
