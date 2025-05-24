import Sequelize from 'sequelize';
import Categoria from '../app/models/Categoria';
import Fornecedor from '../app/models/Fornecedor';
import Item from '../app/models/Item';
import MovimentacaoEstoque from '../app/models/MovimentacaoEstoque';
import Pedido from '../app/models/Pedido';
import RelatorioPedido from '../app/models/RelatorioPedido';
import UnidadeMedida from '../app/models/UnidadeMedida';
import User from '../app/models/users';
import databaseConfig from '../config/database';


const models = [User, Categoria, Fornecedor, Item, MovimentacaoEstoque, 
  Pedido, RelatorioPedido, UnidadeMedida]; // Array com todos os models da aplicação

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models.map(model => model.init(this.connection));
    models.forEach((model) => {
      if (model.associate) {
        model.associate(this.connection.models); // ✅ define relacionamentos
      }
    });
  }
}

export default new Database();
