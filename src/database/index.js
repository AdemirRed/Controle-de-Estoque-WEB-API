import Sequelize from 'sequelize';
import dbConfig from '../config/database.js';

let sequelize;
if (dbConfig.useUrl) {
  sequelize = new Sequelize(dbConfig.url, {
    ...dbConfig.options,
    dialectOptions: {
      ...(dbConfig.options?.dialectOptions || {}),
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      ...dbConfig,
      dialectOptions: {
        ...(dbConfig.dialectOptions || {}),
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  );
}

import Fornecedor from '../app/models/Fornecedor.js';
import Item from '../app/models/Item.js';
import ItemRequest from '../app/models/ItemRequest.js';
import MovimentacaoEstoque from '../app/models/MovimentacaoEstoque.js';
import Pedido from '../app/models/Pedido.js';
import UnidadeMedida from '../app/models/UnidadeMedida.js';
import User from '../app/models/users.js';

// Inicializar os models
const models = [User, Item, MovimentacaoEstoque, Fornecedor,UnidadeMedida, Pedido, ItemRequest];

// Inicializa todos os models
models.forEach((model) => model.init(sequelize));

// Executa as associações depois que todos os models foram inicializados
models.forEach((model) => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

// Exporte a instância do Sequelize para uso em transações
export { sequelize };
export default sequelize;
