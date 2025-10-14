import { ParcelasRepositorySQL } from '../../repository/api/ParcelasSQL.Repository';

const parcelasRepo = new ParcelasRepositorySQL();

export class ParcelasServiceSQL {
  // Obtener todas las parcelas
  async getAllParcelas() {
    try {
      return await parcelasRepo.getAll();
    } catch (error) {
      throw new Error(`Error al obtener parcelas: ${error}`);
    }
  }

  // Obtener parcela por ID
  async getParcelaById(id: number) {
    try {
      const parcela = await parcelasRepo.getById(id);
      if (!parcela || parcela.borrado) {
        throw new Error('Parcela no encontrada');
      }
      return parcela;
    } catch (error) {
      throw new Error(`Error al obtener parcela: ${error}`);
    }
  }

  // Obtener parcelas por usuario
  async getParcelasByUsuario(id_usuario: number) {
    try {
      return await parcelasRepo.getByUsuario(id_usuario);
    } catch (error) {
      throw new Error(`Error al obtener parcelas del usuario: ${error}`);
    }
  }

  // Crear parcela
  async createParcela(data: {
    nombre: string;
    id_usuario: number;
    parcelaMg_Id: string;
  }) {
    try {
      return await parcelasRepo.create(data);
    } catch (error) {
      throw new Error(`Error al crear parcela: ${error}`);
    }
  }

  // Actualizar parcela
  async updateParcela(id: number, data: Partial<{
    nombre: string;
    id_usuario: number;
    parcelaMg_Id: string;
  }>) {
    try {
      const parcela = await parcelasRepo.getById(id);
      if (!parcela || parcela.borrado) {
        throw new Error('Parcela no encontrada');
      }
      return await parcelasRepo.update(id, data);
    } catch (error) {
      throw new Error(`Error al actualizar parcela: ${error}`);
    }
  }

  // Borrado lógico
  async deleteParcela(id: number) {
    try {
      const parcela = await parcelasRepo.getById(id);
      if (!parcela || parcela.borrado) {
        throw new Error('Parcela no encontrada');
      }
      return await parcelasRepo.softDelete(id);
    } catch (error) {
      throw new Error(`Error al eliminar parcela: ${error}`);
    }
  }

  // Buscar parcelas por nombre
  async searchParcelasByName(nombre: string) {
    try {
      return await parcelasRepo.searchByName(nombre);
    } catch (error) {
      throw new Error(`Error al buscar parcelas: ${error}`);
    }
  }
}
