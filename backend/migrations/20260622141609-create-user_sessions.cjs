'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_sessions', {
      sid: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "primaryKey": true,
  "unique": true
},
      sess: {
  "type": "Sequelize.JSON",
  "allowNull": false,
  "defaultValue": null
},
      expire: {
  "type": "Sequelize.DATE",
  "allowNull": false
}
    });

    // Add indexes
    
    await queryInterface.addIndex('user_sessions', ["sid"], {
      name: 'user_sessions_sid',
      unique: true,
      type: 'BTREE'
    });

    await queryInterface.addIndex('user_sessions', ["expire"], {
      name: 'user_sessions_expire',
      unique: false,
      type: 'BTREE'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    
    await queryInterface.removeIndex('user_sessions', 'user_sessions_sid');

    await queryInterface.removeIndex('user_sessions', 'user_sessions_expire');
    
    await queryInterface.dropTable('user_sessions');
  }
};
