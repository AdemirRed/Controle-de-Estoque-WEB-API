import { Sequelize } from 'sequelize';

// Configurações do banco de dados
const dbConfig = (() => {
  const sslOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
  
  // Sempre usar variáveis individuais para garantir SSL
  return {
    useUrl: false,
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.PORT_BANCO || 5432,
    username: process.env.DB_USER || 'estoquemaster',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'estoquemaster',
    dialectOptions: sslOptions,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
    logging: false
  };
})();

export default dbConfig;