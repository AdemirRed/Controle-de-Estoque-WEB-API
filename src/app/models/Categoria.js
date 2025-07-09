import Sequelize, { Model } from 'sequelize';

class Categoria extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        descricao: {
          type: Sequelize.STRING,
          allowNull: true,
        }
      },
      {
        sequelize,
        tableName: 'categorias',
        timestamps: true,
        underscored: true,
      }
    );

    return this;
  }
}

export default Categoria;
