'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const existingColumns = await queryInterface.describeTable('user_sessions');
    const changedColumns = {
      sid: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "primaryKey": true,
  "unique": true,
  "comment": "UserSession_field1: Unique identifier for the session",
  "typeDetails": {
    "isUUID": false,
    "isString": true,
    "isText": false,
    "isInteger": false,
    "isDate": false,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      sess: {
  "type": "Sequelize.JSON",
  "allowNull": false,
  "defaultValue": null,
  "comment": "UserSession_field2: Session data",
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": false,
    "isDate": false,
    "isBoolean": false,
    "isJSON": true,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      expire: {
  "type": "Sequelize.DATE",
  "allowNull": false,
  "comment": "UserSession_field3: Expiration date of the session",
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": false,
    "isDate": true,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
}
    };

    // Handle column renames first
    

    // Add new columns
    for (const [columnName, columnDef] of Object.entries(changedColumns)) {
      if (!existingColumns[columnName]) {
        await queryInterface.addColumn('user_sessions', columnName, columnDef);
      }
    }

    // Update existing columns if needed
    for (const [columnName, columnDef] of Object.entries(changedColumns)) {
      if (existingColumns[columnName]) {
        const existingColumn = existingColumns[columnName];
        if (existingColumn.type !== columnDef.type || 
            existingColumn.allowNull !== columnDef.allowNull ||
            existingColumn.defaultValue !== columnDef.defaultValue) {
          await queryInterface.changeColumn('user_sessions', columnName, columnDef);
        }
      }
    }
  },

  async down (queryInterface, Sequelize) {
    const existingColumns = await queryInterface.describeTable('user_sessions');
    const changedColumns = {
      sid: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "primaryKey": true,
  "unique": true,
  "comment": "UserSession_field1: Unique identifier for the session",
  "typeDetails": {
    "isUUID": false,
    "isString": true,
    "isText": false,
    "isInteger": false,
    "isDate": false,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      sess: {
  "type": "Sequelize.JSON",
  "allowNull": false,
  "defaultValue": null,
  "comment": "UserSession_field2: Session data",
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": false,
    "isDate": false,
    "isBoolean": false,
    "isJSON": true,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      expire: {
  "type": "Sequelize.DATE",
  "allowNull": false,
  "comment": "UserSession_field3: Expiration date of the session",
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": false,
    "isDate": true,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
}
    };

    // Handle column renames in reverse
    

    // Remove new columns
    for (const columnName of Object.keys(changedColumns)) {
      if (!existingColumns[columnName]) {
        await queryInterface.removeColumn('user_sessions', columnName);
      }
    }
  }
};
