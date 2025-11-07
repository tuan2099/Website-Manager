'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const permissions = [
      // Websites permissions
      { name: 'Create Website', slug: 'websites.create', resource: 'websites', action: 'create' },
      { name: 'View Websites', slug: 'websites.read', resource: 'websites', action: 'read' },
      { name: 'Edit Website', slug: 'websites.update', resource: 'websites', action: 'update' },
      { name: 'Delete Website', slug: 'websites.delete', resource: 'websites', action: 'delete' },
      
      // Users permissions
      { name: 'Create User', slug: 'users.create', resource: 'users', action: 'create' },
      { name: 'View Users', slug: 'users.read', resource: 'users', action: 'read' },
      { name: 'Edit User', slug: 'users.update', resource: 'users', action: 'update' },
      { name: 'Delete User', slug: 'users.delete', resource: 'users', action: 'delete' },
      
      // Settings permissions
      { name: 'View Settings', slug: 'settings.read', resource: 'settings', action: 'read' },
      { name: 'Edit Settings', slug: 'settings.update', resource: 'settings', action: 'update' },
      
      // Logs permissions
      { name: 'View Logs', slug: 'logs.read', resource: 'logs', action: 'read' },
      { name: 'Export Logs', slug: 'logs.export', resource: 'logs', action: 'export' }
    ].map(p => ({
      ...p,
      description: `Permission to ${p.action} ${p.resource}`,
      createdAt: now,
      updatedAt: now
    }));

    await queryInterface.bulkInsert('Permissions', permissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
