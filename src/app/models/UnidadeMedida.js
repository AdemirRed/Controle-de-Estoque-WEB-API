import Sequelize, { Model } from 'sequelize';

class UnidadeMedida extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        nome: Sequelize.STRING,
        sigla: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'unidades_medida',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }
}

export default UnidadeMedida;
