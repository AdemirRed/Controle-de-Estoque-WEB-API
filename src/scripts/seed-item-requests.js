import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/index.js';
import ItemRequest from '../app/models/ItemRequest.js';

// Inicializa o modelo
ItemRequest.init(sequelize);

// Exemplo de dados (ajuste os IDs conforme necessário)
const seedData = [
  {
    id: uuidv4(),
    user_id: 'COLOQUE_AQUI_UM_USER_ID_EXISTENTE',
    item_id: 'COLOQUE_AQUI_UM_ITEM_ID_EXISTENTE',
    quantidade: 10,
    status: 'pendente',
    observacao: 'Primeira requisição de teste',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: uuidv4(),
    user_id: 'COLOQUE_AQUI_UM_USER_ID_EXISTENTE',
    item_id: 'COLOQUE_AQUI_UM_ITEM_ID_EXISTENTE',
    quantidade: 5,
    status: 'aprovado',
    observacao: 'Segunda requisição de teste',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    await ItemRequest.bulkCreate(seedData);
    console.log('Dados inseridos com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao inserir dados:', err);
    process.exit(1);
  }
}

seed();
