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
          unique: true, // Garante unicidade no banco
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
        quantidade_minima: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isInt: { msg: 'A quantidade mínima deve ser um número inteiro' }
          }
        },
        preco: {
          type: Sequelize.DECIMAL(10, 2), // Corresponde a NUMERIC(10,2) no PostgreSQL
          allowNull: false,
          defaultValue: 0,
          get() {
            const value = this.getDataValue('preco');
            return value === null ? 0 : parseFloat(value);
          },
          set(value) {
            // Tratar casos como string vazia, null ou undefined
            if (value === '' || value === null || value === undefined) {
              this.setDataValue('preco', 0);
            } else {
              // Garantir que o valor seja um número decimal
              const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
              this.setDataValue('preco', isNaN(numValue) ? 0 : numValue);
            }
          },
          validate: {
            isDecimal: { msg: 'O preço deve ser um valor decimal válido' }
          }
        },
      },
      {
        sequelize,
        tableName: 'itens',
        timestamps: true,
        underscored: true,
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
