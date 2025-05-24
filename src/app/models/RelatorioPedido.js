import Sequelize, { Model } from 'sequelize';

class RelatorioPedido extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
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
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

export default RelatorioPedido;
