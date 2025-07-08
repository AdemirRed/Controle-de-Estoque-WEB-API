import { Sequelize } from 'sequelize';

// Configurações do banco de dados
const dbConfig = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'estoquemaster',
  password: process.env.DB_PASS || 'estoquemaster',
  database: process.env.DB_NAME || 'estoquemaster',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
  logging: false
};

// Instância do Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    define: dbConfig.define,
    logging: dbConfig.logging
  }
);

// Teste de conexão
(async () => {
  try {
    await sequelize.authenticate();
    //console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
})();

export default dbConfig;