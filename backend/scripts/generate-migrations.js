import { Sequelize, DataTypes } from 'sequelize';
import appRoot from 'app-root-path';
import { db } from '../src/models/index.js';
import fs from 'fs';
import path from 'path';

const __dirname = appRoot.path + "/migrations";

function getSequelizeType(attr) {
  if (attr.type instanceof DataTypes.UUID) return 'Sequelize.UUID';
  if (attr.type instanceof DataTypes.STRING) return 'Sequelize.STRING';
  if (attr.type instanceof DataTypes.TEXT) return 'Sequelize.TEXT';
  if (attr.type instanceof DataTypes.INTEGER) return 'Sequelize.INTEGER';
  if (attr.type instanceof DataTypes.DATE) return 'Sequelize.DATE';
  if (attr.type instanceof DataTypes.BOOLEAN) return 'Sequelize.BOOLEAN';
  if (attr.type instanceof DataTypes.JSON) return 'Sequelize.JSON';
  if (attr.type instanceof DataTypes.JSONB) return 'Sequelize.JSONB';
  if (attr.type instanceof DataTypes.FLOAT) return 'Sequelize.FLOAT';
  if (attr.type instanceof DataTypes.ENUM) return `Sequelize.ENUM(${attr.type.values.map(v => `'${v}'`).join(', ')})`;
  return 'Sequelize.STRING';
}

function getModelColumns(model) {
  const attributes = model.rawAttributes;
  return Object.entries(attributes).map(([key, attr]) => {
    let defaultValue = attr.defaultValue;

    // Handle different types of default values
    if (defaultValue instanceof DataTypes.UUIDV4) {
      defaultValue = "Sequelize.literal('uuid_generate_v4()')";
    } else if (typeof defaultValue === 'function') {
      defaultValue = defaultValue.toString();
    } else if (defaultValue && typeof defaultValue === 'object' && defaultValue.fn) {
      defaultValue = `Sequelize.literal('${defaultValue.fn}')`;
    }

    const column = {
      type: getSequelizeType(attr),
      allowNull: attr.allowNull,
      defaultValue: defaultValue,
      primaryKey: attr.primaryKey,
      unique: attr.unique,
      references: attr.references
    };
    return `      ${key}: ${JSON.stringify(column, null, 2)}`;
  }).join(',\n');
}

function getModelState(model) {
  const attributes = model.rawAttributes;
  const state = {
    columns: {},
    indexes: model.options.indexes || []
  };

  // Add column information
  Object.entries(attributes).forEach(([key, attr]) => {
    state.columns[key] = {
      type: getSequelizeType(attr),
      allowNull: attr.allowNull,
      defaultValue: attr.defaultValue,
      primaryKey: attr.primaryKey,
      unique: attr.unique,
      references: attr.references,
      comment: attr.comment,
      // Add more detailed type information
      typeDetails: {
        isUUID: attr.type instanceof DataTypes.UUID,
        isString: attr.type instanceof DataTypes.STRING,
        isText: attr.type instanceof DataTypes.TEXT,
        isInteger: attr.type instanceof DataTypes.INTEGER,
        isDate: attr.type instanceof DataTypes.DATE,
        isBoolean: attr.type instanceof DataTypes.BOOLEAN,
        isJSON: attr.type instanceof DataTypes.JSON || attr.type instanceof DataTypes.JSONB,
        isFloat: attr.type instanceof DataTypes.FLOAT,
        isEnum: attr.type instanceof DataTypes.ENUM,
        enumValues: attr.type instanceof DataTypes.ENUM ? attr.type.values : null
      }
    };
  });

  return state;
}

function detectColumnRenames(currentState, lastState) {
  const renames = [];
  const currentColumns = currentState.columns;
  const lastColumns = lastState?.columns || {};

  // Create a map of comments to column names for both states
  const currentCommentMap = new Map();
  const lastCommentMap = new Map();

  Object.entries(currentColumns).forEach(([colName, col]) => {
    if (col.comment) {
      currentCommentMap.set(col.comment, colName);
    }
  });

  Object.entries(lastColumns).forEach(([colName, col]) => {
    if (col.comment) {
      lastCommentMap.set(col.comment, colName);
    }
  });

  // Find renames by matching comments
  for (const [comment, currentColName] of currentCommentMap) {
    const lastColName = lastCommentMap.get(comment);
    if (lastColName && lastColName !== currentColName) {
      renames.push({
        from: lastColName,
        to: currentColName,
        comment: comment
      });
    }
  }

  return renames;
}

function getChangedColumns(currentState, lastState) {
  const changedColumns = {};
  const currentKeys = Object.keys(currentState.columns);
  const lastKeys = Object.keys(lastState?.columns || {});
  const changes = {
    added: [],
    modified: [],
    removed: [],
    typeChanges: [],
    allowNullChanges: [],
    defaultValueChanges: [],
    uniqueChanges: [],
    renamed: []
  };

  // First detect renames
  const renames = detectColumnRenames(currentState, lastState);
  changes.renamed = renames;

  // Filter out renamed columns from added/removed lists
  const renamedFrom = new Set(renames.map(r => r.from));
  const renamedTo = new Set(renames.map(r => r.to));

  // Check for new columns (excluding renamed ones)
  for (const key of currentKeys) {
    if (!lastKeys.includes(key) && !renamedTo.has(key)) {
      changedColumns[key] = currentState.columns[key];
      changes.added.push(key);
    }
  }

  // Check for modified columns
  for (const key of currentKeys) {
    if (lastKeys.includes(key) && !renamedTo.has(key)) {
      const currentColumn = currentState.columns[key];
      const lastColumn = lastState.columns[key];

      const isTypeChanged = JSON.stringify(currentColumn.typeDetails) !== JSON.stringify(lastColumn.typeDetails);
      const isAllowNullChanged = currentColumn.allowNull !== lastColumn.allowNull;
      const isDefaultValueChanged = JSON.stringify(currentColumn.defaultValue) !== JSON.stringify(lastColumn.defaultValue);
      const isUniqueChanged = currentColumn.unique !== lastColumn.unique;

      if (isTypeChanged || isAllowNullChanged || isDefaultValueChanged || isUniqueChanged) {
        changedColumns[key] = currentColumn;
        changes.modified.push(key);

        if (isTypeChanged) changes.typeChanges.push(key);
        if (isAllowNullChanged) changes.allowNullChanges.push(key);
        if (isDefaultValueChanged) changes.defaultValueChanges.push(key);
        if (isUniqueChanged) changes.uniqueChanges.push(key);
      }
    }
  }

  // Check for removed columns (excluding renamed ones)
  for (const key of lastKeys) {
    if (!currentKeys.includes(key) && !renamedFrom.has(key)) {
      changes.removed.push(key);
    }
  }

  return { changedColumns, changes };
}

function hasModelChanged(model, lastState) {
  const currentState = getModelState(model);

  // If no last state, model is new
  if (!lastState) return true;

  // Check column changes
  const currentColumnKeys = Object.keys(currentState.columns);
  const lastColumnKeys = Object.keys(lastState.columns || {});

  // Check for new or removed columns
  if (currentColumnKeys.length !== lastColumnKeys.length ||
    !currentColumnKeys.every(key => lastColumnKeys.includes(key)) ||
    !lastColumnKeys.every(key => currentColumnKeys.includes(key))) {
    return true;
  }

  // Check for changes in existing columns
  for (const key of currentColumnKeys) {
    if (JSON.stringify(currentState.columns[key]) !== JSON.stringify(lastState.columns[key])) {
      return true;
    }
  }

  // Check index changes
  const currentIndexes = currentState.indexes || [];
  const lastIndexes = lastState.indexes || [];

  // Check for new or removed indexes
  if (currentIndexes.length !== lastIndexes.length) {
    return true;
  }

  // Check for changes in existing indexes
  for (const currentIndex of currentIndexes) {
    const matchingIndex = lastIndexes.find(lastIndex =>
      lastIndex.name === currentIndex.name
    );

    if (!matchingIndex ||
      JSON.stringify(currentIndex.fields) !== JSON.stringify(matchingIndex.fields) ||
      currentIndex.unique !== matchingIndex.unique ||
      currentIndex.type !== matchingIndex.type) {
      return true;
    }
  }

  return false;
}

async function generateMigrations() {
  console.log('Generating migrations from models...');

  try {
    // Get all models
    const models = Object.values(db).filter(value => value.prototype instanceof Sequelize.Model);

    // Create migrations directory if it doesn't exist
    const migrationsPath = path.resolve(__dirname);
    if (!fs.existsSync(migrationsPath)) {
      fs.mkdirSync(migrationsPath, { recursive: true });
    }

    // Load or create state file
    const statePath = path.join(migrationsPath, '.migration-state.json');
    let state = {};
    if (fs.existsSync(statePath)) {
      state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    }

    // Find models that have changed
    const changedModels = models.filter(model => {
      const tableName = model.getTableName();
      const lastState = state[tableName];
      return hasModelChanged(model, lastState);
    });

    if (changedModels.length === 0) {
      console.log('No changes detected in any models. No migrations needed.');
      return;
    }

    console.log('Found changed models:', changedModels.map(m => m.getTableName()));

    // Generate migration for each changed model
    for (const model of changedModels) {
      const tableName = model.getTableName();
      console.log(`\nProcessing model: ${tableName}`);

      const lastState = state[tableName];
      const currentState = getModelState(model);

      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

      // Check if we already have a create migration for this table
      const hasCreateMigration = fs.readdirSync(migrationsPath)
        .some(file => file.includes("-create-") && file.includes(tableName));

      if (!hasCreateMigration) {
        // Generate create migration for new table
        console.log(`Generating create migration for ${tableName}...`);
        const migrationName = `${timestamp}-create-${tableName}.cjs`;
        const migrationPath = path.join(migrationsPath, migrationName);

        const migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('${tableName}', {
${getModelColumns(model)}
    });

    // Add indexes
    ${(model.options.indexes || []).map(index => `
    await queryInterface.addIndex('${tableName}', ${JSON.stringify(index.fields)}, {
      name: '${index.name}',
      unique: ${index.unique || false},
      type: '${index.type || 'BTREE'}'
    });`).join('\n')}
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    ${(model.options.indexes || []).map(index => `
    await queryInterface.removeIndex('${tableName}', '${index.name}');`).join('\n')}
    
    await queryInterface.dropTable('${tableName}');
  }
};
`;

        fs.writeFileSync(migrationPath, migrationContent);
        console.log(`✓ Created new table: ${tableName}`);
      } else {
        // Generate update migration for existing table
        console.log(`Generating update migration for ${tableName}...`);
        const migrationName = `${timestamp}-update-${tableName}.cjs`;
        const migrationPath = path.join(migrationsPath, migrationName);

        // Get only the changed columns
        const { changedColumns, changes } = getChangedColumns(currentState, lastState);
        const changedColumnsString = Object.entries(changedColumns)
          .map(([key, column]) => `      ${key}: ${JSON.stringify(column, null, 2)}`)
          .join(',\n');

        // Log changes
        if (changes.added.length > 0) {
          console.log(`✓ Added columns to ${tableName}: ${changes.added.join(', ')}`);
        }
        if (changes.modified.length > 0) {
          console.log(`✓ Modified columns in ${tableName}: ${changes.modified.join(', ')}`);
          if (changes.typeChanges.length > 0) {
            console.log(`  - Type changes: ${changes.typeChanges.join(', ')}`);
          }
          if (changes.allowNullChanges.length > 0) {
            console.log(`  - AllowNull changes: ${changes.allowNullChanges.join(', ')}`);
          }
          if (changes.defaultValueChanges.length > 0) {
            console.log(`  - DefaultValue changes: ${changes.defaultValueChanges.join(', ')}`);
          }
          if (changes.uniqueChanges.length > 0) {
            console.log(`  - Unique constraint changes: ${changes.uniqueChanges.join(', ')}`);
          }
        }
        if (changes.removed.length > 0) {
          console.log(`✓ Removed columns from ${tableName}: ${changes.removed.join(', ')}`);
        }

        const migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const existingColumns = await queryInterface.describeTable('${tableName}');
    const changedColumns = {
${changedColumnsString}
    };

    // Handle column renames first
    ${changes.renamed.map(rename => `
    // Rename column: ${rename.from} -> ${rename.to} (${rename.comment})
    await queryInterface.renameColumn('${tableName}', '${rename.from}', '${rename.to}');`).join('\n')}

    // Add new columns
    for (const [columnName, columnDef] of Object.entries(changedColumns)) {
      if (!existingColumns[columnName]) {
        await queryInterface.addColumn('${tableName}', columnName, columnDef);
      }
    }

    // Update existing columns if needed
    for (const [columnName, columnDef] of Object.entries(changedColumns)) {
      if (existingColumns[columnName]) {
        const existingColumn = existingColumns[columnName];
        if (existingColumn.type !== columnDef.type || 
            existingColumn.allowNull !== columnDef.allowNull ||
            existingColumn.defaultValue !== columnDef.defaultValue) {
          await queryInterface.changeColumn('${tableName}', columnName, columnDef);
        }
      }
    }
  },

  async down (queryInterface, Sequelize) {
    const existingColumns = await queryInterface.describeTable('${tableName}');
    const changedColumns = {
${changedColumnsString}
    };

    // Handle column renames in reverse
    ${changes.renamed.map(rename => `
    // Rename column back: ${rename.to} -> ${rename.from} (${rename.comment})
    await queryInterface.renameColumn('${tableName}', '${rename.to}', '${rename.from}');`).join('\n')}

    // Remove new columns
    for (const columnName of Object.keys(changedColumns)) {
      if (!existingColumns[columnName]) {
        await queryInterface.removeColumn('${tableName}', columnName);
      }
    }
  }
};
`;

        fs.writeFileSync(migrationPath, migrationContent);
      }

      // Update state
      state[tableName] = currentState;
    }

    // Save state
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    console.log('\nMigration generation completed.');
  } catch (error) {
    console.error('Error during migration generation:', error);
    throw error;
  }
}

async function updateMigrationState() {
  console.log('Updating migration state...');

  try {
    // Get all models
    const models = Object.values(db).filter(value => value.prototype instanceof Sequelize.Model);

    // Create migrations directory if it doesn't exist
    const migrationsPath = path.resolve(__dirname);
    if (!fs.existsSync(migrationsPath)) {
      fs.mkdirSync(migrationsPath, { recursive: true });
    }

    // Load or create state file
    const statePath = path.join(migrationsPath, '.migration-state.json');
    let state = {};
    if (fs.existsSync(statePath)) {
      state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    }

    // Update state for each model
    for (const model of models) {
      const tableName = model.getTableName();
      console.log(`Updating state for model: ${tableName}`);
      state[tableName] = getModelState(model);
    }

    // Save updated state
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    console.log('Migration state updated successfully.');
  } catch (error) {
    console.error('Error updating migration state:', error);
    throw error;
  }
}

// Update the script execution at the bottom
if (process.argv[2] === '--update-state') {
  updateMigrationState().catch(console.error);
} else {
  generateMigrations().catch(console.error);
} 