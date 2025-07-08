export default {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.PORT_BANCO || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    underscored: true,
  },
};
