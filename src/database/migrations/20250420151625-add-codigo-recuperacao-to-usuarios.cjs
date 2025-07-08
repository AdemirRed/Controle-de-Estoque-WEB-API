'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'codigo_recuperacao', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn('usuarios', 'tentativas_recuperacao', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
    
    await queryInterface.addColumn('usuarios', 'ultima_tentativa_recuperacao', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    
    await queryInterface.addColumn('usuarios', 'codigo_recuperacao_expiracao', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('usuarios', 'codigo_recuperacao');
    await queryInterface.removeColumn('usuarios', 'tentativas_recuperacao');
    await queryInterface.removeColumn('usuarios', 'ultima_tentativa_recuperacao');
    await queryInterface.removeColumn('usuarios', 'codigo_recuperacao_expiracao');
  },
};
