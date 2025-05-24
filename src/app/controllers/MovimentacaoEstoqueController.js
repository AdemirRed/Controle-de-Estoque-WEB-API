import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import sequelize from '../../config/database.js';
import Item from '../models/Item.js';
import MovimentacaoEstoque from '../models/MovimentacaoEstoque.js';

/**
 * Controller para gerenciamento de movimentações de estoque
 */
class MovimentacaoEstoqueController {
  /**
   * Lista todas as movimentações de estoque
   */
  async index(req, res) {
    try {
      const movimentacoes = await MovimentacaoEstoque.findAll({
        include: [{
          model: Item,
          attributes: ['nome', 'codigo']
        }],
        order: [['data_movimentacao', 'DESC']]
      });

      return res.json(movimentacoes);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        code: 'LIST_MOVEMENTS_ERROR',
        message: 'Erro ao listar movimentações',
        details: { reason: error.message }
      });
    }
  }

  /**
   * Retorna uma movimentação específica
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const movimentacao = await MovimentacaoEstoque.findByPk(id, {
        include: [{
          model: Item,
          attributes: ['nome', 'codigo']
        }]
      });

      if (!movimentacao) {
        return res.status(404).json({
          status: 'error',
          code: 'MOVEMENT_NOT_FOUND',
          message: 'Movimentação não encontrada'
        });
      }

      return res.json(movimentacao);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        code: 'SHOW_MOVEMENT_ERROR',
        message: 'Erro ao buscar movimentação',
        details: { reason: error.message }
      });
    }
  }

  /**
   * Registra uma nova movimentação de estoque
   */
  async store(req, res) {
    try {
      // Verifica se o ID do usuário está presente
      if (!req.userId) {
        return res.status(401).json({
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Usuário não autorizado'
        });
      }

      const schema = Yup.object().shape({
        item_id: Yup.string().required('ID do item é obrigatório'),
        tipo: Yup.string()
          .oneOf(['entrada', 'saida'], 'Tipo deve ser entrada ou saída')
          .required('Tipo é obrigatório'),
        quantidade: Yup.number()
          .transform((value) => (isNaN(value) ? undefined : Number(value)))
          .typeError('Quantidade deve ser um número')
          .required('Quantidade é obrigatória')
          .positive('Quantidade deve ser positiva'),
        motivo: Yup.string().nullable(),
        observacao: Yup.string().nullable()
      });

      let validatedData;
      try {
        validatedData = await schema.validate(req.body, { 
          abortEarly: false,
          stripUnknown: true
        });
      } catch (validationError) {
        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos para movimentação',
          details: {
            errors: validationError.inner.map(error => ({
              field: error.path,
              message: error.message
            }))
          }
        });
      }

      // Usar os dados validados ao invés do req.body direto
      const { item_id, tipo, quantidade, motivo, observacao } = validatedData;

      // Busca o item e verifica se existe
      const item = await Item.findByPk(item_id);
      if (!item) {
        return res.status(404).json({
          status: 'error',
          code: 'ITEM_NOT_FOUND',
          message: 'Item não encontrado',
          details: { item_id }
        });
      }

      // Verifica se há quantidade suficiente para saída
      if (tipo === 'saida' && quantidade > item.quantidade) {
        return res.status(400).json({
          status: 'error',
          code: 'INSUFFICIENT_STOCK',
          message: 'Quantidade insuficiente em estoque',
          details: {
            currentStock: item.quantidade,
            requestedAmount: quantidade,
            item_id,
            item_nome: item.nome
          }
        });
      }

      // Calcula nova quantidade
      const quantidade_anterior = item.quantidade;
      const quantidade_atual = tipo === 'entrada' 
        ? item.quantidade + quantidade 
        : item.quantidade - quantidade;

      // Registra movimentação e atualiza item em uma transação
      const resultado = await sequelize.transaction(async (t) => {
        const movimentacao = await MovimentacaoEstoque.create({
          id: uuidv4(),
          item_id,
          tipo,
          quantidade,
          quantidade_anterior,
          quantidade_atual,
          motivo,
          observacao,
          usuario_id: req.userId,  // Usa req.userId ao invés de req.user.id
          data_movimentacao: new Date()
        }, { transaction: t });

        await item.update({
          quantidade: quantidade_atual
        }, { transaction: t });

        return { movimentacao, item };
      });

      return res.json(resultado);
    } catch (error) {
      console.error('Erro na movimentação:', error);
      
      return res.status(500).json({
        status: 'error',
        code: 'MOVEMENT_REGISTRATION_ERROR',
        message: 'Erro ao processar movimentação de estoque',
        details: {
          reason: error.message,
          item_id: req.body.item_id,
          quantidade: req.body.quantidade,
          tipo: req.body.tipo,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Atualiza uma movimentação de estoque existente
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      
      const schema = Yup.object().shape({
        observacao: Yup.string().required()
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos para atualização'
        });
      }

      const movimentacao = await MovimentacaoEstoque.findByPk(id);

      if (!movimentacao) {
        return res.status(404).json({
          status: 'error',
          code: 'MOVEMENT_NOT_FOUND',
          message: 'Movimentação não encontrada'
        });
      }

      // Permite apenas atualização da observação
      const { observacao } = req.body;
      await movimentacao.update({ observacao });

      return res.json(movimentacao);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        code: 'UPDATE_MOVEMENT_ERROR',
        message: 'Erro ao atualizar movimentação',
        details: { reason: error.message }
      });
    }
  }

  /**
   * Remove uma movimentação de estoque do sistema
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const movimentacao = await MovimentacaoEstoque.findByPk(id);

      if (!movimentacao) {
        return res.status(404).json({
          status: 'error',
          code: 'MOVEMENT_NOT_FOUND',
          message: 'Movimentação não encontrada'
        });
      }

      // Reverte a quantidade do item ao excluir a movimentação
      const item = await Item.findByPk(movimentacao.item_id);
      
      await sequelize.transaction(async (t) => {
        if (movimentacao.tipo === 'entrada') {
          await item.update({
            quantidade: item.quantidade - movimentacao.quantidade
          }, { transaction: t });
        } else {
          await item.update({
            quantidade: item.quantidade + movimentacao.quantidade
          }, { transaction: t });
        }

        await movimentacao.destroy({ transaction: t });
      });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        code: 'DELETE_MOVEMENT_ERROR',
        message: 'Erro ao excluir movimentação',
        details: { reason: error.message }
      });
    }
  }
}

export default new MovimentacaoEstoqueController();
