import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        nome: Sequelize.STRING,
        email: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false,
        },
        senha_hash: Sequelize.STRING,
        papel: {
          type: Sequelize.ENUM('admin', 'usuario'),
          defaultValue: 'usuario',
        },
        codigo_recuperacao: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        tentativas_recuperacao: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        ultima_tentativa_recuperacao: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        codigo_recuperacao_expiracao: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'usuarios',
        timestamps: true,
        underscored: true,
      },
    );

    return this;
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.senha_hash);
  }
}

export default User;
