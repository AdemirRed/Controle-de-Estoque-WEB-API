import Sequelize, { Model } from 'sequelize';

class ItemRequest extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        item_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        requisitante_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        quantidade: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        observacao: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'item_requests',
        timestamps: true,
        created_at: 'created_at',
        updated_at: 'updated_at',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'requisitante_id', as: 'requisitante' });
    this.belongsTo(models.Item, { foreignKey: 'item_id', as: 'item' });
  }
}

export default ItemRequest;