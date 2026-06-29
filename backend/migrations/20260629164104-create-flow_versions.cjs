'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('flow_versions', {
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
      data: {
  "type": "Sequelize.JSON",
  "allowNull": false,
  "defaultValue": {}
},
      inputs: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      author: {
  "type": "Sequelize.STRING",
  "allowNull": false
},
      comment: {
  "type": "Sequelize.STRING",
  "allowNull": true
},
      version_number: {
  "type": "Sequelize.INTEGER",
  "allowNull": false
},
      createdAt: {
  "type": "Sequelize.DATE",
  "allowNull": false
}
    });

    // Add indexes
    
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    
    
    await queryInterface.dropTable('flow_versions');
  }
};
