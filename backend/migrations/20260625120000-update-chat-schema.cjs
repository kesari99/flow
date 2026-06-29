'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('chat_flows', 'author_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('chat_flows', 'workspace_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('chat_flows', 'runtime_config', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.removeColumn('chat_flows', 'apikey_id');
    await queryInterface.removeColumn('chat_flows', 'analytic');
    await queryInterface.removeColumn('chat_flows', 'speech_to_text');
    await queryInterface.removeColumn('chat_flows', 'text_to_speech');
    await queryInterface.removeColumn('chat_flows', 'category');
    await queryInterface.removeColumn('chat_flows', 'type');

    const chatFlowsDesc = await queryInterface.describeTable('chat_flows');
    if (chatFlowsDesc.created_date && !chatFlowsDesc.created_at) {
      await queryInterface.renameColumn('chat_flows', 'created_date', 'created_at');
    }
    if (chatFlowsDesc.updated_date && !chatFlowsDesc.updated_at) {
      await queryInterface.renameColumn('chat_flows', 'updated_date', 'updated_at');
    }

    await queryInterface.createTable('flow_versions', {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      flow_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_flows',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      inputs: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comment: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      version_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('flow_versions', ['flow_id'], {
      name: 'flow_versions_flow_id',
    });

    await queryInterface.createTable('runtime_sessions', {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      flow_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_flows',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      inputs: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      variables: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      outputs: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'running',
          'completed',
          'failed',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('runtime_sessions', ['flow_id'], {
      name: 'runtime_sessions_flow_id',
    });
    await queryInterface.addIndex('runtime_sessions', ['user_id'], {
      name: 'runtime_sessions_user_id',
    });

    await queryInterface.createTable('node_executions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'runtime_sessions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      node_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      node_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      inputs: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      outputs: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      execution_time: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('node_executions', ['session_id'], {
      name: 'node_executions_session_id',
    });

    const chatMessagesDesc = await queryInterface.describeTable('chat_messages');
    if (chatMessagesDesc.created_date && !chatMessagesDesc.created_at) {
      await queryInterface.renameColumn('chat_messages', 'created_date', 'created_at');
    }
    if (chatMessagesDesc.updated_at) {
      await queryInterface.removeColumn('chat_messages', 'updated_at');
    }
    if (chatMessagesDesc.updated_date) {
      await queryInterface.removeColumn('chat_messages', 'updated_date');
    }

    await queryInterface.addConstraint('chat_messages', {
      fields: ['session_id'],
      type: 'foreign key',
      name: 'chat_messages_session_id_fkey',
      references: {
        table: 'runtime_sessions',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'chat_messages',
      'chat_messages_session_id_fkey'
    );

    await queryInterface.dropTable('node_executions');
    await queryInterface.dropTable('runtime_sessions');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_runtime_sessions_status";'
    );
    await queryInterface.dropTable('flow_versions');

    await queryInterface.addColumn('chat_flows', 'apikey_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('chat_flows', 'analytic', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('chat_flows', 'speech_to_text', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('chat_flows', 'text_to_speech', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('chat_flows', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('chat_flows', 'type', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn('chat_flows', 'author_id');
    await queryInterface.removeColumn('chat_flows', 'workspace_id');
    await queryInterface.removeColumn('chat_flows', 'runtime_config');

    const chatFlowsDesc = await queryInterface.describeTable('chat_flows');
    if (chatFlowsDesc.created_at && !chatFlowsDesc.created_date) {
      await queryInterface.renameColumn('chat_flows', 'created_at', 'created_date');
    }
    if (chatFlowsDesc.updated_at && !chatFlowsDesc.updated_date) {
      await queryInterface.renameColumn('chat_flows', 'updated_at', 'updated_date');
    }

    const chatMessagesDesc = await queryInterface.describeTable('chat_messages');
    if (chatMessagesDesc.created_at && !chatMessagesDesc.created_date) {
      await queryInterface.renameColumn('chat_messages', 'created_at', 'created_date');
    }
    await queryInterface.addColumn('chat_messages', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
  },
};
