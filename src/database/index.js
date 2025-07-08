import Sequelize from 'sequelize';
import dbConfig from '../config/database.js';

import Fornecedor from '../app/models/Fornecedor.js';
import Item from '../app/models/Item.js';
import ItemRequest from '../app/models/ItemRequest.js';
import MovimentacaoEstoque from '../app/models/MovimentacaoEstoque.js';
import Pedido from '../app/models/Pedido.js';
import UnidadeMedida from '../app/models/UnidadeMedida.js';
import User from '../app/models/users.js';

// Garante que SSL esteja ativado corretamente (obrigatório na Render)
const mergedConfig = {
  ...dbConfig,
  dialectOptions: {
    ...(dbConfig.dialectOptions || {}),
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

// Conexão com o banco de dados
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  mergedConfig
);

// Lista de models
const models = [User, Item, MovimentacaoEstoque, Fornecedor, UnidadeMedida, Pedido, ItemRequest];

// Inicializa todos os models
models.forEach((model) => model.init(sequelize));

// Associações entre os models
models.forEach((model) => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

// Exporta instância do Sequelize
export { sequelize };
export default sequelize;
