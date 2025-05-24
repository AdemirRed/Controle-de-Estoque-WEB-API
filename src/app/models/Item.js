import Sequelize, { Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class Item extends Model {
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
          validate: {
            notEmpty: { msg: 'O nome não pode estar vazio' }
          }
        },
        descricao: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: ''
        },
        quantidade: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isInt: { msg: 'A quantidade deve ser um número inteiro' }
          }
        },
        preco: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
          get() {
            return parseFloat(this.getDataValue('preco'));
          },
          set(value) {
            this.setDataValue('preco', value === '' ? 0 : value);
          }
        },
      },
      {
        sequelize,
        tableName: 'itens',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }

  static associate(models) {
    this.hasMany(models.MovimentacaoEstoque, {
      foreignKey: 'item_id',
      as: 'movimentacoes'
    });
    // ...manter outras associações existentes se houver...
  }
}

export default Item;
