import Sequelize, { Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class UnidadeMedida extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: () => uuidv4(),
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        sigla: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'unidades_medida',
        timestamps: true,
        created_at: 'created_at',
        updated_at: 'updated_at',
      }
    );

    return this;
  }
}

export default UnidadeMedida;
