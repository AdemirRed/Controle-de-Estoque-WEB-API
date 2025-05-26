'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('item_requests', 'user_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('item_requests', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};
