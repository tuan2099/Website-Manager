'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fullName: DataTypes.STRING,
      avatar: DataTypes.STRING,
      phone: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'blocked'),
        defaultValue: 'active'
      },
      lastLogin: DataTypes.DATE,
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('Users', ['email']);
    await queryInterface.addIndex('Users', ['username']);
    await queryInterface.addIndex('Users', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
