import Fornecedor from '../models/Fornecedor.js';
import Item from '../models/Item.js';
import Pedido from '../models/Pedido.js';
import UnidadeMedida from '../models/UnidadeMedida.js';
import Usuario from '../models/users.js';

 
/* eslint-disable no-unused-vars */
/**
 * Controller para gerenciamento de pedidos
 */
class PedidoController {
  /**
   * Lista todos os pedidos cadastrados
   */
  async index(req, res) {
    try {
      const { page = 1, limit = 10, status, item_id } = req.query;
      const offset = (page - 1) * limit;

      // Construir filtros
      const where = {};
      if (status) where.status = status;
      if (item_id) where.item_id = item_id;

      const pedidos = await Pedido.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Item,
            attributes: ['id', 'nome', 'descricao']
          },
          {
            model: Fornecedor,
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'aprovador',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: UnidadeMedida,
            as: 'unidade_medida',
            attributes: ['id', 'nome', 'sigla']
          }
        ],
        order: [['created_at', 'DESC']] // Corrigido de createdAt para created_at
      });

      return res.json({
        pedidos: pedidos.rows,
        total: pedidos.count,
        totalPages: Math.ceil(pedidos.count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Retorna um pedido específico
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const pedido = await Pedido.findByPk(id, {
        include: [
          {
            model: Item,
            attributes: ['id', 'nome', 'descricao', 'preco'] // Alterado de preco_unitario para preco
          },
          {
            model: Fornecedor,
            attributes: ['id', 'nome', 'email', 'telefone']
          },
          {
            model: Usuario,
            as: 'aprovador',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'rejeitador',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'criador',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: UnidadeMedida,
            as: 'unidade_medida',
            attributes: ['id', 'nome', 'sigla']
          }
        ]
      });

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      return res.json(pedido);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  /**
   * Cria um novo pedido
   */
  async store(req, res) {
    try {
      const {
        item_id,
        item_nome,
        item_descricao,
        item_unidade_medida_id, // Alterado de item_unidade_medida para item_unidade_medida_id
        quantidade,
        observacoes
      } = req.body;

      // Validações básicas
      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ 
          error: 'Quantidade deve ser maior que zero' 
        });
      }

      // Verificar se é um pedido de item cadastrado ou novo item
      if (!item_id && !item_nome) {
        return res.status(400).json({ 
          error: 'É necessário informar um item cadastrado ou nome do novo item' 
        });
      }

      // Se for um novo item, validar unidade de medida
      if (!item_id) {
        if (!item_unidade_medida_id) {
          return res.status(400).json({ 
            error: 'Unidade de medida é obrigatória para novos itens' 
          });
        }

        // Verificar se a unidade de medida existe
        const unidadeMedida = await UnidadeMedida.findByPk(item_unidade_medida_id);
        if (!unidadeMedida) {
          return res.status(404).json({ error: 'Unidade de medida não encontrada' });
        }
      }

      let valor_total = null;
      let dadosPedido = {
        quantidade,
        observacoes,
        status: 'pendente',
        criado_por: req.usuario?.id
      };

      // Se for um item cadastrado
      if (item_id) {
        const item = await Item.findByPk(item_id);
        if (!item) {
          return res.status(404).json({ error: 'Item não encontrado' });
        }
        
        dadosPedido = {
          ...dadosPedido,
          item_id,
          valor_total: item.preco * quantidade // Alterado de preco_unitario para preco
        };
      } 
      // Se for um novo item
      else {
        dadosPedido = {
          ...dadosPedido,
          item_nome,
          item_descricao,
          item_unidade_medida_id
        };
      }

      const pedido = await Pedido.create(dadosPedido);

      // Retornar pedido criado
      const pedidoCompleto = await Pedido.findByPk(pedido.id, {
        include: [
          ...(item_id ? [{
            model: Item,
            attributes: ['id', 'nome', 'descricao', 'preco'] // Alterado de preco_unitario para preco
          }] : []),
          {
            model: UnidadeMedida,
            as: 'unidade_medida',
            attributes: ['id', 'nome', 'sigla']
          }
        ]
      });

      return res.status(201).json(pedidoCompleto);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Atualiza um pedido existente
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        quantidade, 
        observacoes,
        valor_total, // Adicionado para permitir atualização do valor
        item_nome,
        item_descricao,
        item_unidade_medida_id
      } = req.body;

      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      if (pedido.status !== 'pendente') {
        return res.status(400).json({ 
          error: 'Apenas pedidos pendentes podem ser editados' 
        });
      }

      if (quantidade && quantidade <= 0) {
        return res.status(400).json({ 
          error: 'Quantidade deve ser maior que zero' 
        });
      }

      const dadosAtualizacao = {};
      
      // Atualizar quantidade
      if (quantidade) {
        dadosAtualizacao.quantidade = quantidade;
        
        // Recalcular valor total apenas se for um item cadastrado
        if (pedido.item_id) {
          const item = await Item.findByPk(pedido.item_id);
          if (item) {
            dadosAtualizacao.valor_total = item.preco * quantidade; // Alterado de preco_unitario para preco
          }
        } else if (valor_total) {
          // Se não for item cadastrado, usar o valor_total informado
          dadosAtualizacao.valor_total = valor_total;
        }
      }

      // Atualizar outros campos
      if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
      if (item_nome !== undefined) dadosAtualizacao.item_nome = item_nome;
      if (item_descricao !== undefined) dadosAtualizacao.item_descricao = item_descricao;
      if (item_unidade_medida_id !== undefined) {
        // Verificar se a unidade de medida existe
        const unidadeMedida = await UnidadeMedida.findByPk(item_unidade_medida_id);
        if (!unidadeMedida) {
          return res.status(404).json({ error: 'Unidade de medida não encontrada' });
        }
        dadosAtualizacao.item_unidade_medida_id = item_unidade_medida_id;
      }

      await pedido.update(dadosAtualizacao);

      // Retornar pedido atualizado com dados relacionados
      const pedidoAtualizado = await Pedido.findByPk(id, {
        include: [
          ...(pedido.item_id ? [{
            model: Item,
            attributes: ['id', 'nome', 'descricao', 'preco'] // Alterado de preco_unitario para preco
          }] : []),
          {
            model: UnidadeMedida,
            as: 'unidade_medida',
            attributes: ['id', 'nome', 'sigla']
          }
        ]
      });

      return res.json(pedidoAtualizado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remove um pedido do sistema
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      // Apenas pedidos pendentes podem ser deletados
      if (pedido.status !== 'pendente') {
        return res.status(400).json({ 
          error: 'Apenas pedidos pendentes podem ser excluídos' 
        });
      }

      await pedido.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Aprova um pedido
   */
  async aprovar(req, res) {
    try {
      const { id } = req.params;
      const { fornecedor_id } = req.body;
      const usuario = req.usuario; // Assumindo que existe um middleware de autenticação

      if (!usuario.isAdmin) {
        return res.status(403).json({ error: 'Apenas administradores podem aprovar pedidos' });
      }

      if (!fornecedor_id) {
        return res.status(400).json({ error: 'Fornecedor é obrigatório para aprovação' });
      }

      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      if (pedido.status !== 'pendente') {
        return res.status(400).json({ error: 'Pedido já foi processado' });
      }

      // Verificar se o fornecedor existe
      const fornecedor = await Fornecedor.findByPk(fornecedor_id);
      if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }

      await pedido.update({
        fornecedor_id,
        status: 'aprovado',
        aprovado_por: usuario.id,
        data_aprovacao: new Date(),
      });

      // Retornar pedido com dados completos
      const pedidoAprovado = await Pedido.findByPk(id, {
        include: [
          {
            model: Item,
            attributes: ['id', 'nome', 'descricao']
          },
          {
            model: Fornecedor,
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'aprovador',
            attributes: ['id', 'nome', 'email']
          }
        ]
      });

      return res.json(pedidoAprovado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Rejeita um pedido
   */
  async rejeitar(req, res) {
    try {
      const { id } = req.params;
      const { motivo_rejeicao } = req.body;
      const usuario = req.usuario;

      if (!usuario.isAdmin) {
        return res.status(403).json({ error: 'Apenas administradores podem rejeitar pedidos' });
      }

      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      if (pedido.status !== 'pendente') {
        return res.status(400).json({ error: 'Apenas pedidos pendentes podem ser rejeitados' });
      }

      await pedido.update({
        status: 'rejeitado',
        motivo_rejeicao,
        rejeitado_por: usuario.id,
        data_rejeicao: new Date(),
      });

      return res.json(pedido);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Lista pedidos por status
   */
  async listarPorStatus(req, res) {
    try {
      const { status } = req.params;
      const statusValidos = ['pendente', 'aprovado', 'rejeitado', 'entregue'];

      if (!statusValidos.includes(status)) {
        return res.status(400).json({ 
          error: 'Status inválido. Use: pendente, aprovado, rejeitado ou entregue' 
        });
      }

      const pedidos = await Pedido.findAll({
        where: { status },
        include: [
          {
            model: Item,
            attributes: ['id', 'nome', 'descricao']
          },
          {
            model: Fornecedor,
            attributes: ['id', 'nome']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.json(pedidos);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new PedidoController();