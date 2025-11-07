'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get roles and permissions
    const [roles] = await queryInterface.sequelize.query('SELECT id, slug FROM "Roles";');
    const [permissions] = await queryInterface.sequelize.query('SELECT id, slug FROM "Permissions";');
    
    const roleMap = roles.reduce((acc, role) => ({ ...acc, [role.slug]: role.id }), {});
    const permissionMap = permissions.reduce((acc, perm) => ({ ...acc, [perm.slug]: perm.id }), {});
    
    const now = new Date();

    // Create role-permission assignments
    const rolePermissions = [
      // Super Admin - gets all permissions
      ...permissions.map(permission => ({
        roleId: roleMap.super_admin,
        permissionId: permission.id,
        createdAt: now
      })),

      // Admin permissions
      ...permissions
        .filter(p => !p.slug.startsWith('settings.'))
        .map(permission => ({
          roleId: roleMap.admin,
          permissionId: permission.id,
          createdAt: now
        })),

      // Manager permissions
      ...[
        'websites.create', 'websites.read', 'websites.update', 'websites.delete',
        'users.read', 'logs.read'
      ].map(slug => ({
        roleId: roleMap.manager,
        permissionId: permissionMap[slug],
        createdAt: now
      })),

      // Viewer permissions
      ...[
        'websites.read',
        'logs.read'
      ].map(slug => ({
        roleId: roleMap.viewer,
        permissionId: permissionMap[slug],
        createdAt: now
      }))
    ];

    await queryInterface.bulkInsert('RolePermissions', rolePermissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RolePermissions', null, {});
  }
};
