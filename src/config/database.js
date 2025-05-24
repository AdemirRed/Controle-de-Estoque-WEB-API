const port = process.env.PORT_BANCO || 5432;

module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  port: port,
  username: 'onnmoveis',
  password: 'onnmoveis',
  database: 'onnmoveis',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
