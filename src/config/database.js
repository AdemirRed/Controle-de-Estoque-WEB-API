import { Sequelize } from 'sequelize';

// Configurações do banco de dados
const dbConfig = {
  dialect: 'postgres',
  host: process.env.DB_HOST || '192.168.0.200',
  port: process.env.PORT_BANCO || 5432,
  username: process.env.DB_USER || 'onnmoveis',
  password: process.env.DB_PASS || 'onnmoveis',
  database: process.env.DB_NAME || 'onnmoveis',
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