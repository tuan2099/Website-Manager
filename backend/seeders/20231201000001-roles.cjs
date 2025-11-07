'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      {
        name: 'Super Admin',
        slug: 'super_admin',
        description: 'Full system access with all permissions',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Admin',
        slug: 'admin',
        description: 'System administrator with limited system settings access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Manager',
        slug: 'manager',
        description: 'Can manage websites and view limited user data',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Viewer',
        slug: 'viewer',
        description: 'Read-only access to websites and own data',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};