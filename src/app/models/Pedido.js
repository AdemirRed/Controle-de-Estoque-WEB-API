import Sequelize, { Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class Pedido extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: () => uuidv4(),
          primaryKey: true,
        },
        fornecedor_id: Sequelize.UUID,
        item_id: Sequelize.UUID,
        item_nome: Sequelize.STRING,
        item_descricao: Sequelize.TEXT,
        item_unidade_medida_id: Sequelize.UUID,
        quantidade: Sequelize.INTEGER,
        valor_total: Sequelize.DECIMAL(10, 2),
        observacoes: Sequelize.TEXT,
        data_pedido: Sequelize.DATE,
        status: Sequelize.ENUM('pendente', 'aprovado', 'rejeitado', 'entregue'),
        motivo_rejeicao: Sequelize.TEXT,
        aprovado_por: Sequelize.UUID,
        rejeitado_por: Sequelize.UUID,
        data_aprovacao: Sequelize.DATE,
        data_rejeicao: Sequelize.DATE,
        criado_por: Sequelize.UUID,
      },
      {
        sequelize,
        tableName: 'pedidos',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );

    // Adicionar hook beforeCreate para garantir que o ID seja gerado
    this.addHook('beforeCreate', async (pedido) => {
      if (!pedido.id) {
        pedido.id = uuidv4();
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Item, { foreignKey: 'item_id' });
    this.belongsTo(models.Fornecedor, { foreignKey: 'fornecedor_id' });
    this.belongsTo(models.User, { as: 'aprovador', foreignKey: 'aprovado_por' });
    this.belongsTo(models.User, { as: 'rejeitador', foreignKey: 'rejeitado_por' });
    this.belongsTo(models.User, { as: 'criador', foreignKey: 'criado_por' });
    this.belongsTo(models.UnidadeMedida, { 
      foreignKey: 'item_unidade_medida_id',
      as: 'unidade_medida'
    });
  }
}

export default Pedido;