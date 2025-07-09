import Sequelize from 'sequelize';
import dbConfig from '../config/config.cjs';

const config = dbConfig.development || dbConfig;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    define: config.define,
    dialectOptions: config.dialectOptions
  }
);

// Importação e inicialização dos models
import Fornecedor from '../app/models/Fornecedor.js';
import Item from '../app/models/Item.js';
import ItemRequest from '../app/models/ItemRequest.js';
import MovimentacaoEstoque from '../app/models/MovimentacaoEstoque.js';
import Pedido from '../app/models/Pedido.js';
import UnidadeMedida from '../app/models/UnidadeMedida.js';
import User from '../app/models/users.js';

const models = [User, Item, MovimentacaoEstoque, Fornecedor, UnidadeMedida, Pedido, ItemRequest];

models.forEach(model => model.init(sequelize));
models.forEach(model => model.associate && model.associate(sequelize.models));

export { sequelize };
export default sequelize;
