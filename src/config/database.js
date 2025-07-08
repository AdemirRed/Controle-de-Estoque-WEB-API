import { Sequelize } from 'sequelize';

// Configurações do banco de dados
const dbConfig = (() => {
  // Permite usar uma URL completa se disponível
  const dbUrl = process.env.DB_URL_EXTERNA || process.env.DB_URL_INTERNA || '';
  const sslOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
  if (dbUrl) {
    // Retorna a URL e as opções separadamente
    return {
      useUrl: true,
      url: dbUrl,
      options: {
        dialect: 'postgres',
        dialectOptions: sslOptions,
        define: {
          timestamps: true,
          underscored: true,
          underscoredAll: true,
        },
        logging: false
      }
    };
  }
  return {
    useUrl: false,
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
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