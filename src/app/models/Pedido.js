
import Sequelize, { Model } from 'sequelize';

class Pedido extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        fornecedor_id: Sequelize.UUID,
        item_id: Sequelize.UUID,
        quantidade: Sequelize.INTEGER,
        data_pedido: Sequelize.DATE,
      },
      {
        sequelize,
        tableName: 'pedidos',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

export default Pedido;