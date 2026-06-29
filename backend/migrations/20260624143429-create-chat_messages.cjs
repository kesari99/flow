'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('chat_messages', {
      id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "primaryKey": true
},
      session_id: {
  "type": "Sequelize.STRING",
  "allowNull": false
},
      chatflow_id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "references": {
    "model": "chat_flows",
    "key": "id"
  }
},
      role: {
  "type": "Sequelize.STRING",
  "allowNull": false
},
      content: {
  "type": "Sequelize.TEXT",
  "allowNull": false
},
      source_documents: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      file_annotations: {
  "type": "Sequelize.JSON",
  "allowNull": true
},
      created_date: {
  "type": "Sequelize.DATE",
  "allowNull": false
}
    });

    // Add indexes
    
    await queryInterface.addIndex('chat_messages', ["session_id"], {
      name: 'chat_messages_session_id',
      unique: false,
      type: 'BTREE'
    });

    await queryInterface.addIndex('chat_messages', ["chatflow_id"], {
      name: 'chat_messages_chatflow_id',
      unique: false,
      type: 'BTREE'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    
    await queryInterface.removeIndex('chat_messages', 'chat_messages_session_id');

    await queryInterface.removeIndex('chat_messages', 'chat_messages_chatflow_id');
    
    await queryInterface.dropTable('chat_messages');
  }
};
