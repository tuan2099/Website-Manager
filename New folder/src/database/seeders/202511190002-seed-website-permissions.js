module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const permissionNames = [
      'website:create',
      'website:list',
      'website:view',
      'website:update',
      'website:delete',
      'website:checkNow',
      'website:viewChecks',
    ];

    await queryInterface.bulkInsert(
      'permissions',
      permissionNames.map((name) => ({
        name,
        description: name,
        created_at: now,
        updated_at: now,
      })),
      {}
    );

    const [permissions] = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions WHERE name IN (:names);',
      {
        replacements: { names: permissionNames },
      }
    );

    const [[adminRole]] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'admin' LIMIT 1;"
    );

    if (adminRole && permissions.length) {
      await queryInterface.bulkInsert(
        'role_permissions',
        permissions.map((p) => ({
          role_id: adminRole.id,
          permission_id: p.id,
          created_at: now,
          updated_at: now,
        })),
        {}
      );
    }
  },

  async down(queryInterface) {
    const permissionNames = [
      'website:create',
      'website:list',
      'website:view',
      'website:update',
      'website:delete',
      'website:checkNow',
      'website:viewChecks',
    ];

    const [[adminRole]] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'admin' LIMIT 1;"
    );

    if (adminRole) {
      await queryInterface.bulkDelete(
        'role_permissions',
        { role_id: adminRole.id },
        {}
      );
    }

    await queryInterface.bulkDelete(
      'permissions',
      { name: permissionNames },
      {}
    );
  },
};
