'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('runtime_sessions', {
      id: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "primaryKey": true
},
      flow_id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "references": {
    "model": "chat_flows",
    "key": "id"
  }
},
      user_id: {
  "type": "Sequelize.UUID",
  "allowNull": false,
  "references": {
    "model": "users",
    "key": "id"
  }
},
      inputs: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      variables: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      outputs: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      status: {
  "type": "Sequelize.ENUM('pending', 'running', 'completed', 'failed', 'cancelled')",
  "allowNull": false,
  "defaultValue": "pending"
},
      metadata: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      started_at: {
  "type": "Sequelize.DATE",
  "allowNull": false,
  "defaultValue": {}
},
      completed_at: {
  "type": "Sequelize.DATE",
  "allowNull": true
}
    });

    // Add indexes
    
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    
    
    await queryInterface.dropTable('runtime_sessions');
  }
};
