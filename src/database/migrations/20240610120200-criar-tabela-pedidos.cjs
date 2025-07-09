'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pedidos', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'), // Para PostgreSQL
      },
      fornecedor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'fornecedores',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      item_id: {
        type: Sequelize.UUID,
        allowNull: true, // Alterado para true
        references: {
          model: 'itens',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      item_nome: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      item_descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      item_unidade_medida_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'unidades_medida',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      valor_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      data_pedido: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      status: {
        type: Sequelize.ENUM('pendente', 'aprovado', 'rejeitado', 'entregue'),
        allowNull: false,
        defaultValue: 'pendente',
      },
      motivo_rejeicao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      aprovado_por: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
      },
      rejeitado_por: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
      },
      data_aprovacao: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      data_rejeicao: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      criado_por: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('pedidos');
  },
};
