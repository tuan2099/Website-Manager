module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const now = new Date();

      const permissionNames = [
        'user:list',
        'user:view',
        'user:update',
        'user:assignRoles',
        'role:list',
        'role:create',
        'role:update',
        'role:assignPermissions',
        'permission:list',
        'permission:create',
        'permission:update',
        'activityLog:list',
      ];

      await queryInterface.bulkInsert(
        'permissions',
        permissionNames.map((name) => ({
          name,
          description: name,
          created_at: now,
          updated_at: now,
        })),
        { transaction }
      );

      await queryInterface.bulkInsert(
        'roles',
        [
          {
            name: 'admin',
            description: 'Administrator with full permissions',
            created_at: now,
            updated_at: now,
          },
        ],
        { transaction }
      );

      const [permissions] = await queryInterface.sequelize.query(
        'SELECT id, name FROM permissions WHERE name IN (:names);',
        {
          replacements: { names: permissionNames },
          transaction,
        }
      );

      const [[adminRole]] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE name = 'admin' LIMIT 1;",
        { transaction }
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
          { transaction }
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const permissionNames = [
        'user:list',
        'user:view',
        'user:update',
        'user:assignRoles',
        'role:list',
        'role:create',
        'role:update',
        'role:assignPermissions',
        'permission:list',
        'permission:create',
        'permission:update',
        'activityLog:list',
      ];

      const [[adminRole]] = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE name = 'admin' LIMIT 1;",
        { transaction }
      );

      if (adminRole) {
        await queryInterface.bulkDelete(
          'role_permissions',
          { role_id: adminRole.id },
          { transaction }
        );
      }

      await queryInterface.bulkDelete(
        'roles',
        { name: 'admin' },
        { transaction }
      );

      await queryInterface.bulkDelete(
        'permissions',
        { name: permissionNames },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
