import Sequelize, { Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class MovimentacaoEstoque extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: () => uuidv4(),
        },
        item_id: Sequelize.UUID,
        tipo: Sequelize.ENUM('entrada', 'saida'),
        quantidade: Sequelize.INTEGER,
        usuario_id: Sequelize.UUID,
        data_movimentacao: Sequelize.DATE,
        observacao: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'movimentacoes_estoque',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

export default MovimentacaoEstoque;
