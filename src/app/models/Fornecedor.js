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
        tableName: 'fornecedores', // Certifique-se de que o nome da tabela está correto
        timestamps: true, // Inclui created_at e updated_at
      }
    );

    return this;
  }
}

export default Fornecedor;
