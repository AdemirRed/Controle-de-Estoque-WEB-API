import sequelize from '../config/database.js';
import User from '../app/models/users.js';
import Item from '../app/models/Item.js';
import MovimentacaoEstoque from '../app/models/MovimentacaoEstoque.js';

// Inicializar os models
const models = [User, Item, MovimentacaoEstoque];

// Inicializa todos os models
models.forEach(model => model.init(sequelize));

// Executa as associações depois que todos os models foram inicializados
models.forEach(model => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

export default sequelize;
