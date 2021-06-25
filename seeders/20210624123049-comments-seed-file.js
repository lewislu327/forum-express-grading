'use strict';
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 10 }).map((d, i) =>
        ({
          text: faker.lorem.sentence(),
          UserId: '5',
          RestaurantId: '1'+ i +'5',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {},    
    ),
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 10 }).map((d, i) =>
        ({
          text: faker.lorem.sentence(),
          UserId: '15',
          RestaurantId: '2'+ i +'5',
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
