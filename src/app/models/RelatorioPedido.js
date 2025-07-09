import Sequelize, { Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class RelatorioPedido extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: () => uuidv4(),
        },
        usuario_id: Sequelize.UUID,
        periodo_inicio: Sequelize.DATE,
        periodo_fim: Sequelize.DATE,
        parametros: Sequelize.JSON,
        gerado_em: Sequelize.DATE,
        caminho_arquivo: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'relatorios_pedidos',
        timestamps: true,
        underscored: true,
      }
    );
  }
}

export default RelatorioPedido;
