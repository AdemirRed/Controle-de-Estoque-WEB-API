import Sequelize, { Model } from 'sequelize';

class Fornecedor extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        telefone: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true,
          validate: {
            isEmail: {
              msg: 'Formato de e-mail inválido',
            },
          },
        },
      },
      {
        sequelize,
        tableName: 'fornecedores',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );

    return this;
  }
}

export default Fornecedor;
