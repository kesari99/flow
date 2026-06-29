'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const existingColumns = await queryInterface.describeTable('chat_flows');
    const changedColumns = {
      author_id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": true,
    "isDate": false,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      workspace_id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": true,
    "isDate": false,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      runtime_config: {
  "type": "Sequelize.JSON",
  "allowNull": true,
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
},
      id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "primaryKey": true,
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": true,
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
      description: {
  "type": "Sequelize.TEXT",
  "allowNull": true,
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
      flow_data: {
  "type": "Sequelize.JSON",
  "allowNull": false,
  "defaultValue": {},
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
      deployed: {
  "type": "Sequelize.BOOLEAN",
  "allowNull": false,
  "defaultValue": false,
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
      is_public: {
  "type": "Sequelize.BOOLEAN",
  "allowNull": false,
  "defaultValue": false,
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
      chatbot_config: {
  "type": "Sequelize.JSON",
  "allowNull": true,
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
}
    };

    // Handle column renames first
    

    // Add new columns
    for (const [columnName, columnDef] of Object.entries(changedColumns)) {
      if (!existingColumns[columnName]) {
        await queryInterface.addColumn('chat_flows', columnName, columnDef);
      }
    }

    // Update existing columns if needed
    for (const [columnName, columnDef] of Object.entries(changedColumns)) {
      if (existingColumns[columnName]) {
        const existingColumn = existingColumns[columnName];
        if (existingColumn.type !== columnDef.type || 
            existingColumn.allowNull !== columnDef.allowNull ||
            existingColumn.defaultValue !== columnDef.defaultValue) {
          await queryInterface.changeColumn('chat_flows', columnName, columnDef);
        }
      }
    }
  },

  async down (queryInterface, Sequelize) {
    const existingColumns = await queryInterface.describeTable('chat_flows');
    const changedColumns = {
      author_id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": true,
    "isDate": false,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      workspace_id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": true,
    "isDate": false,
    "isBoolean": false,
    "isJSON": false,
    "isFloat": false,
    "isEnum": false,
    "enumValues": null
  }
},
      runtime_config: {
  "type": "Sequelize.JSON",
  "allowNull": true,
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
},
      id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "primaryKey": true,
  "typeDetails": {
    "isUUID": false,
    "isString": false,
    "isText": false,
    "isInteger": true,
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
      description: {
  "type": "Sequelize.TEXT",
  "allowNull": true,
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
      flow_data: {
  "type": "Sequelize.JSON",
  "allowNull": false,
  "defaultValue": {},
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
      deployed: {
  "type": "Sequelize.BOOLEAN",
  "allowNull": false,
  "defaultValue": false,
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
      is_public: {
  "type": "Sequelize.BOOLEAN",
  "allowNull": false,
  "defaultValue": false,
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
      chatbot_config: {
  "type": "Sequelize.JSON",
  "allowNull": true,
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
}
    };

    // Handle column renames in reverse
    

    // Remove new columns
    for (const columnName of Object.keys(changedColumns)) {
      if (!existingColumns[columnName]) {
        await queryInterface.removeColumn('chat_flows', columnName);
      }
    }
  }
};
