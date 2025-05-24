import Sequelize, { Model } from 'sequelize';

class Fornecedor extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        telefone: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true,
          validate: {
            isEmail: true,
          },
        },
      },
      {
        sequelize,
        modelName: 'Fornecedor',
        tableName: 'fornecedores',
        timestamps: true,
        underscored: true,
      }
    );

    return this;
  }
}

export default Fornecedor;
