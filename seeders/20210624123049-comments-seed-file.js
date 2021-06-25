'use strict';
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 20 }).map((d, i) =>
        ({
          text: faker.lorem.sentence(),
          UserId: '5',
          RestaurantId: Math.floor(Math.random()*(254-204+1))+204,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {},    
    ),
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 20 }).map((d, i) =>
        ({
          text: faker.lorem.sentence(),
          UserId: '15',
          RestaurantId: Math.floor(Math.random()*(254-204+1))+204,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {},    
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
