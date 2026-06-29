'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('node_executions', {
      id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "primaryKey": true
},
      session_id: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "references": {
    "model": "runtime_sessions",
    "key": "id"
  }
},
      node_id: {
  "type": "Sequelize.STRING",
  "allowNull": false
},
      node_type: {
  "type": "Sequelize.STRING",
  "allowNull": false
},
      inputs: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      outputs: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      execution_time: {
  "type": "Sequelize.FLOAT",
  "allowNull": true
},
      status: {
  "type": "Sequelize.STRING",
  "allowNull": false
},
      error: {
  "type": "Sequelize.TEXT",
  "allowNull": true
},
      timestamp: {
  "type": "Sequelize.DATE",
  "allowNull": false,
  "defaultValue": {}
}
    });

    // Add indexes
    
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    
    
    await queryInterface.dropTable('node_executions');
  }
};
