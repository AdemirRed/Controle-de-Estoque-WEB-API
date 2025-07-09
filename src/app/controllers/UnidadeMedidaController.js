/* eslint-disable no-unused-vars */
import UnidadeMedida from '../models/UnidadeMedida.js';

/**
 * Controller para gerenciamento de unidades de medida
 */
class UnidadeMedidaController {
  /**
   * Lista todas as unidades de medida cadastradas
   */
  async index(req, res) {
    try {
      const unidades = await UnidadeMedida.findAll({
        order: [['nome', 'ASC']],
      });
      if (!unidades || unidades.length === 0) {
        return res.json([]);
      }
      return res.json(unidades);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar unidades de medida' });
    }
  }

  /**
   * Retorna uma unidade de medida específica
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const unidade = await UnidadeMedida.findByPk(id);
      
      if (!unidade) {
        return res.json({});
      }

      return res.json(unidade);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar unidade de medida' });
    }
  }

  /**
   * Cria uma nova unidade de medida
   */
  async store(req, res) {
    try {
      const { nome, sigla } = req.body;

      if (!nome || !sigla) {
        return res.status(400).json({ error: 'Nome e sigla são obrigatórios' });
      }

      const unidadeExiste = await UnidadeMedida.findOne({
        where: {
          nome,
        },
      });

      if (unidadeExiste) {
        return res.status(400).json({ error: 'Unidade de medida já existe' });
      }

      const unidade = await UnidadeMedida.create({
        nome,
        sigla,
      });

      return res.status(201).json(unidade);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar unidade de medida' });
    }
  }

  /**
   * Atualiza uma unidade de medida existente
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, sigla } = req.body;

      const unidade = await UnidadeMedida.findByPk(id);

      if (!unidade) {
        return res.status(404).json({ error: 'Unidade de medida não encontrada' });
      }

      if (!nome || !sigla) {
        return res.status(400).json({ error: 'Nome e sigla são obrigatórios' });
      }

      await unidade.update({ nome, sigla });

      return res.json(unidade);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar unidade de medida' });
    }
  }

  /**
   * Remove uma unidade de medida do sistema
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const unidade = await UnidadeMedida.findByPk(id);

      if (!unidade) {
        return res.status(404).json({ error: 'Unidade de medida não encontrada' });
      }

      await unidade.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar unidade de medida' });
    }
  }
}

export default new UnidadeMedidaController();
