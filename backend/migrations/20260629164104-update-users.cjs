'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const existingColumns = await queryInterface.describeTable('users');
    const changedColumns = {
      id: {
  "type": "Sequelize.UUID",
  "allowNull": false,
  "defaultValue": {},
  "primaryKey": true,
  "comment": "User_field1: Unique identifier for the user",
  "typeDetails": {
    "isUUID": true,
    "isString": false,
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
      name: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "comment": "User_field2: Name of the user",
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
      email: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "unique": true,
  "comment": "User_field3: Email address of the user",
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
      password: {
  "type": "Sequelize.TEXT",
  "allowNull": false,
  "comment": "User_field4: Password of the user",
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": true,
    "isInteger": false,
    "isDate": false,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      role: {
  "type": "Sequelize.ENUM('admin', 'user')",
  "allowNull": false,
  "comment": "User_field5: Role of the user",
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": false,
    "isDate": false,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": true,
    "enumValues": [
      "admin",
      "user"
    ]
  }
},
      is_active: {
  "type": "Sequelize.BOOLEAN",
  "allowNull": false,
  "defaultValue": true,
  "comment": "User_field6: Indicates if the user is active",
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": false,
    "isDate": false,
    "isBoolean": true,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      metadata: {
  "type": "Sequelize.JSON",
  "allowNull": false,
  "defaultValue": {},
  "comment": "User_field7: Extensible metadata",
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
      createdAt: {
  "type": "Sequelize.DATE",
  "allowNull": false,
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
},
      updatedAt: {
  "type": "Sequelize.DATE",
  "allowNull": false,
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
        await queryInterface.addColumn('users', columnName, columnDef);
      }
    }

    // Update existing columns if needed
    for (const [columnName, columnDef] of Object.entries(changedColumns)) {
      if (existingColumns[columnName]) {
        const existingColumn = existingColumns[columnName];
        if (existingColumn.type !== columnDef.type || 
            existingColumn.allowNull !== columnDef.allowNull ||
            existingColumn.defaultValue !== columnDef.defaultValue) {
          await queryInterface.changeColumn('users', columnName, columnDef);
        }
      }
    }
  },

  async down (queryInterface, Sequelize) {
    const existingColumns = await queryInterface.describeTable('users');
    const changedColumns = {
      id: {
  "type": "Sequelize.UUID",
  "allowNull": false,
  "defaultValue": {},
  "primaryKey": true,
  "comment": "User_field1: Unique identifier for the user",
  "typeDetails": {
    "isUUID": true,
    "isString": false,
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
      name: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "comment": "User_field2: Name of the user",
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
      email: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "unique": true,
  "comment": "User_field3: Email address of the user",
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
      password: {
  "type": "Sequelize.TEXT",
  "allowNull": false,
  "comment": "User_field4: Password of the user",
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": true,
    "isInteger": false,
    "isDate": false,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      role: {
  "type": "Sequelize.ENUM('admin', 'user')",
  "allowNull": false,
  "comment": "User_field5: Role of the user",
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": false,
    "isDate": false,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": true,
    "enumValues": [
      "admin",
      "user"
    ]
  }
},
      is_active: {
  "type": "Sequelize.BOOLEAN",
  "allowNull": false,
  "defaultValue": true,
  "comment": "User_field6: Indicates if the user is active",
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": false,
    "isDate": false,
    "isBoolean": true,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      metadata: {
  "type": "Sequelize.JSON",
  "allowNull": false,
  "defaultValue": {},
  "comment": "User_field7: Extensible metadata",
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
      createdAt: {
  "type": "Sequelize.DATE",
  "allowNull": false,
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
},
      updatedAt: {
  "type": "Sequelize.DATE",
  "allowNull": false,
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
        await queryInterface.removeColumn('users', columnName);
      }
    }
  }
};
