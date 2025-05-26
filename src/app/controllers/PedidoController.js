import Fornecedor from '../models/Fornecedor.js';
import Item from '../models/Item.js';
import Pedido from '../models/Pedido.js';
import UnidadeMedida from '../models/UnidadeMedida.js';
import Usuario from '../models/users.js';
import PushSubscription from '../models/PushSubscription.js';
import User from '../models/users.js';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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
            attributes: ['id', 'nome', 'email', 'telefone']
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
            attributes: ['id', 'nome', 'email', 'telefone'] // Adicione 'telefone' aqui
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

      // Enviar notificação push para admins
      try {
        // Busca todos os admins
        const admins = await User.findAll({ where: { papel: 'admin' } });
        const adminIds = admins.map(a => a.id);
        const subscriptions = await PushSubscription.findAll({ where: { user_id: adminIds } });
        const payload = JSON.stringify({
          title: 'Novo Pedido',
          body: 'Um novo pedido foi criado.',
          url: '/pedidos'
        });
        subscriptions.forEach(sub => {
          webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: sub.keys
          }, payload).catch(() => {});
        });
      } catch (e) {
        // Não impede o fluxo se falhar
      }

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
        valor_total,
        item_nome,
        item_descricao,
        item_unidade_medida_id,
        status, // Novo campo
        fornecedor_id, // Novo campo
        motivo_rejeicao // Novo campo
      } = req.body;

      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      const dadosAtualizacao = {};

      // Validação de status
      if (status) {
        if (!['pendente', 'aprovado', 'rejeitado', 'entregue'].includes(status)) {
          return res.status(400).json({ error: 'Status inválido' });
        }

        // Se estiver aprovando, precisa do fornecedor
        if (status === 'aprovado' && !fornecedor_id) {
          return res.status(400).json({ error: 'Fornecedor é obrigatório para aprovar o pedido' });
        }

        // Se estiver rejeitando, precisa do motivo
        if (status === 'rejeitado' && !motivo_rejeicao) {
          return res.status(400).json({ error: 'Motivo da rejeição é obrigatório' });
        }

        dadosAtualizacao.status = status;
        if (status === 'aprovado') {
          dadosAtualizacao.fornecedor_id = fornecedor_id;
          dadosAtualizacao.aprovado_por = req.userId; // Corrigido de req.usuario.id para req.userId
          dadosAtualizacao.data_aprovacao = new Date();
        } else if (status === 'rejeitado') {
          dadosAtualizacao.motivo_rejeicao = motivo_rejeicao;
          dadosAtualizacao.rejeitado_por = req.userId; // Corrigido de req.usuario.id para req.userId
          dadosAtualizacao.data_rejeicao = new Date();
        }
      }
      
      // Atualizar outros campos
      if (quantidade && quantidade > 0) {
        dadosAtualizacao.quantidade = quantidade;
        if (pedido.item_id) {
          const item = await Item.findByPk(pedido.item_id);
          if (item) {
            dadosAtualizacao.valor_total = item.preco * quantidade;
          }
        } else if (valor_total) {
          dadosAtualizacao.valor_total = valor_total;
        }
      }

      if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
      if (item_nome !== undefined) dadosAtualizacao.item_nome = item_nome;
      if (item_descricao !== undefined) dadosAtualizacao.item_descricao = item_descricao;
      if (item_unidade_medida_id !== undefined) {
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
            attributes: ['id', 'nome', 'descricao', 'preco']
          }] : []),
          {
            model: UnidadeMedida,
            as: 'unidade_medida',
            attributes: ['id', 'nome', 'sigla']
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
            model: Usuario,
            as: 'rejeitador',
            attributes: ['id', 'nome', 'email']
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