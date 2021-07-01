'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     return queryInterface.changeColumn('Restaurants', 'viewCounts', {
      type: Sequelize.INTEGER,
      unsigned: true,
      defaultValue: 0       
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
