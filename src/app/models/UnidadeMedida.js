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
