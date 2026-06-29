'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const existingColumns = await queryInterface.describeTable('chat_messages');
    const changedColumns = {
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
      session_id: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "references": {
    "model": "runtime_sessions",
    "key": "id"
  },
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
      chatflow_id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "references": {
    "model": "chat_flows",
    "key": "id"
  },
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
      role: {
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
      content: {
  "type": "Sequelize.TEXT",
  "allowNull": false,
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
      source_documents: {
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
      file_annotations: {
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
        await queryInterface.addColumn('chat_messages', columnName, columnDef);
      }
    }

    // Update existing columns if needed
    for (const [columnName, columnDef] of Object.entries(changedColumns)) {
      if (existingColumns[columnName]) {
        const existingColumn = existingColumns[columnName];
        if (existingColumn.type !== columnDef.type || 
            existingColumn.allowNull !== columnDef.allowNull ||
            existingColumn.defaultValue !== columnDef.defaultValue) {
          await queryInterface.changeColumn('chat_messages', columnName, columnDef);
        }
      }
    }
  },

  async down (queryInterface, Sequelize) {
    const existingColumns = await queryInterface.describeTable('chat_messages');
    const changedColumns = {
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
      session_id: {
  "type": "Sequelize.STRING",
  "allowNull": false,
  "references": {
    "model": "runtime_sessions",
    "key": "id"
  },
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
      chatflow_id: {
  "type": "Sequelize.INTEGER",
  "allowNull": false,
  "references": {
    "model": "chat_flows",
    "key": "id"
  },
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
      role: {
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
      content: {
  "type": "Sequelize.TEXT",
  "allowNull": false,
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
      source_documents: {
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
      file_annotations: {
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
        await queryInterface.removeColumn('chat_messages', columnName);
      }
    }
  }
};
