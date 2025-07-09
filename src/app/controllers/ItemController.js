import * as Yup from 'yup';
import Item from '../models/Item.js';

/**
 * Controller para gerenciamento de itens do estoque
 */
class ItemController {
  /**
   * Lista todos os itens cadastrados
   */
  async index(req, res) {
    try {
      const itens = await Item.findAll();
      if (!itens || itens.length === 0) {
        return res.json([]);
      }
      return res.json(itens);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      return res.status(500).json({ error: 'Erro ao buscar itens' });
    }
  }

  /**
   * Retorna um item específico
   */
  async show(req, res) {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.json({});
    return res.json(item);
  }

  /**
   * Cria um novo item
   */
  async store(req, res) {
    try {
      // Verifica se já existe item com o mesmo nome (case insensitive)
      const nome = req.body.nome?.trim();
      if (!nome) {
        return res.status(400).json({
          status: 'error',
          code: 'ITEM_CREATION_ERROR',
          message: 'O nome do item é obrigatório',
        });
      }
      const itemExistente = await Item.findOne({
        where: { nome: nome },
      });
      if (itemExistente) {
        return res.status(400).json({
          status: 'error',
          code: 'ITEM_DUPLICATE',
          message: 'Já existe um item cadastrado com esse nome',
        });
      }
      const item = await Item.create(req.body);
      return res.status(201).json(item);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        code: 'ITEM_CREATION_ERROR',
        message: 'Erro ao criar item',
        details: error.message
      });
    }
  }

  /**
   * Atualiza um item existente
   */
  async update(req, res) {
    try {
      // Campos permitidos para atualização (quantidade NÃO está inclusa)
      const schema = Yup.object().shape({
        nome: Yup.string().trim(),
        descricao: Yup.string().trim().nullable(),
        preco: Yup.number().transform((value) => 
          isNaN(value) || value === '' ? undefined : value
        ).nullable(),
        categoria_id: Yup.string().uuid().nullable(),
        fornecedor_id: Yup.string().uuid().nullable(),
        quantidade_minima: Yup.number().integer().min(0)
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Dados inválidos' });
      }

      const item = await Item.findByPk(req.params.id);
      
      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado' });
      }

      // Remove campos não permitidos e campos vazios
      const dadosAtualizacao = Object.fromEntries(
        Object.entries(req.body)
          .filter(([key, value]) => {
            // Ignora explicitamente o campo quantidade
            if (key === 'quantidade') {
              return false;
            }
            return value !== '' && value !== undefined;
          })
      );

      // Se tentarem atualizar quantidade, retorna erro
      if (req.body.quantidade !== undefined) {
        return res.status(400).json({ 
          error: 'Não é possível atualizar quantidade diretamente. Use a rota de movimentação de estoque.'
        });
      }

      await item.update(dadosAtualizacao);

      return res.json(item);
    } catch (error) {
      console.error(error); // Log para debug
      return res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao atualizar item',
        details: error.message
      });
    }
  }

  /**
   * Remove um item do sistema
   */
  async delete(req, res) {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Item não encontrado' });
    await item.destroy();
    return res.status(204).send();
  }
}

export default new ItemController();
