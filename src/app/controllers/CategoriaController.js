/* eslint-disable no-unused-vars */
import Categoria from '../models/Categoria.js';

/**
 * Controlador para gerenciamento de Categorias
 */
class CategoriaController {
  /**
   * Lista todas as categorias cadastradas
   * @param {Request} req - Objeto de requisição
   * @param {Response} res - Objeto de resposta
   * @returns {Array} Lista de categorias
   */
  async index(req, res) {
    try {
      const categorias = await Categoria.findAll();
      return res.json(categorias);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Busca uma categoria específica pelo ID
   * @param {Request} req - Objeto de requisição com ID da categoria
   * @param {Response} res - Objeto de resposta
   * @returns {Object} Dados da categoria
   */
  async show(req, res) {
    try {
      const categoria = await Categoria.findByPk(req.params.id);
      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      return res.json(categoria);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Cria uma nova categoria
   * @param {Request} req - Objeto de requisição com nome e descrição
   * @param {Response} res - Objeto de resposta
   * @returns {Object} Categoria criada
   */
  async store(req, res) {
    try {
      const { nome, descricao } = req.body;

      if (!nome) {
        return res.status(400).json({
          status: 'error',
          code: 'MISSING_REQUIRED_FIELD',
          message: 'Nome é obrigatório',
          field: 'nome'
        });
      }

      const categoria = await Categoria.create({
        nome,
        descricao
      });

      return res.status(201).json(categoria);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao criar categoria',
        details: error.message
      });
    }
  }

  /**
   * Atualiza uma categoria existente
   * @param {Request} req - Objeto de requisição com ID, nome e descrição
   * @param {Response} res - Objeto de resposta
   * @returns {Object} Categoria atualizada
   */
  async update(req, res) {
    try {
      const categoria = await Categoria.findByPk(req.params.id);

      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      const { nome, descricao } = req.body;

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      await categoria.update({ nome, descricao });

      return res.json(categoria);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  }

  /**
   * Remove uma categoria do sistema
   * @param {Request} req - Objeto de requisição com ID da categoria
   * @param {Response} res - Objeto de resposta
   * @returns {null} Retorna status 204 em caso de sucesso
   */
  async delete(req, res) {
    try {
      const categoria = await Categoria.findByPk(req.params.id);

      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      await categoria.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar categoria' });
    }
  }
}

export default new CategoriaController();
