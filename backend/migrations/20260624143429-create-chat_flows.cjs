'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('chat_flows', {
      id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "primaryKey": true
},
      name: {
  "type": "Sequelize.STRING",
  "allowNull": false
},
      description: {
  "type": "Sequelize.TEXT",
  "allowNull": true
},
      flow_data: {
  "type": "Sequelize.JSON",
  "allowNull": false,
  "defaultValue": {}
},
      deployed: {
  "type": "Sequelize.BOOLEAN",
  "allowNull": false,
  "defaultValue": false
},
      is_public: {
  "type": "Sequelize.BOOLEAN",
  "allowNull": false,
  "defaultValue": false
},
      apikey_id: {
  "type": "Sequelize.INTEGER",
  "allowNull": true
},
      chatbot_config: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      analytic: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      speech_to_text: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      text_to_speech: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      category: {
  "type": "Sequelize.STRING",
  "allowNull": true
},
      type: {
  "type": "Sequelize.STRING",
  "allowNull": true
},
      created_date: {
  "type": "Sequelize.DATE",
  "allowNull": false
},
      updated_date: {
  "type": "Sequelize.DATE",
  "allowNull": false
}
    });

    // Add indexes
    
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    
    
    await queryInterface.dropTable('chat_flows');
  }
};
