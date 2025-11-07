'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('ActivityLogs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      resource: Sequelize.STRING,
      resourceId: Sequelize.INTEGER,
      ipAddress: Sequelize.STRING,
      userAgent: Sequelize.STRING,
      details: Sequelize.JSON,
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('ActivityLogs', ['userId']);
    await queryInterface.addIndex('ActivityLogs', ['action']);
    await queryInterface.addIndex('ActivityLogs', ['resource']);
    await queryInterface.addIndex('ActivityLogs', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivityLogs');
  }
};
