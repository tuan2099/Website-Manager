'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create super admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    await queryInterface.bulkInsert('Users', [{
      id: Sequelize.literal('uuid_generate_v4()'),
      username: 'superadmin',
      email: 'admin@domain.com',
      password: hashedPassword,
      fullName: 'Super Administrator',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Get super_admin role id and user id
    const [users] = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" WHERE username = \'superadmin\' LIMIT 1;'
    );
    const [roles] = await queryInterface.sequelize.query(
      'SELECT id FROM "Roles" WHERE slug = \'super_admin\' LIMIT 1;'
    );

    // Assign super admin role to user
    await queryInterface.bulkInsert('UserRoles', [{
      userId: users[0].id,
      roleId: roles[0].id,
      createdAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { username: 'superadmin' });
  }
};
