'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
  "type": "Sequelize.UUID",
  "allowNull": false,
  "defaultValue": "Sequelize.literal('uuid_generate_v4()')",
  "primaryKey": true
},
      name: {
  "type": "Sequelize.STRING",
  "allowNull": false
},
      email: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "unique": true
},
      password: {
  "type": "Sequelize.TEXT",
  "allowNull": false
},
      role: {
  "type": "Sequelize.ENUM('admin', 'user')",
  "allowNull": false
},
      is_active: {
  "type": "Sequelize.BOOLEAN",
  "allowNull": false,
  "defaultValue": true
},
      metadata: {
  "type": "Sequelize.JSON",
  "allowNull": false,
  "defaultValue": {}
},
      createdAt: {
  "type": "Sequelize.DATE",
  "allowNull": false
},
      updatedAt: {
  "type": "Sequelize.DATE",
  "allowNull": false
}
    });

    // Add indexes
    
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    
    
    await queryInterface.dropTable('users');
  }
};
