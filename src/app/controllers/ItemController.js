import Item from '../models/Item.js';

/**
 * Controller para gerenciamento de itens do estoque
 */
class ItemController {
  /**
   * Lista todos os itens cadastrados
   */
  async index(req, res) {
    const itens = await Item.findAll();
    return res.json(itens);
  }

  /**
   * Retorna um item específico
   */
  async show(req, res) {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Item não encontrado' });
    return res.json(item);
  }

  /**
   * Cria um novo item
   */
  async store(req, res) {
    try {
      const item = await Item.create(req.body);
      return res.status(201).json(item);
    } catch (error) {
      return res.status(400).json({ erro: 'Erro ao criar item', detalhes: error.message });
    }
  }

  /**
   * Atualiza um item existente
   */
  async update(req, res) {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Item não encontrado' });
    await item.update(req.body);
    return res.json(item);
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
