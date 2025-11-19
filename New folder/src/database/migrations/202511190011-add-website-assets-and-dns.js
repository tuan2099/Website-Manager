module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('websites', 'domain_expiry_date', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'ssl_expiry_date',
    });
    await queryInterface.addColumn('websites', 'registrar', {
      type: Sequelize.STRING(191),
      allowNull: true,
      after: 'domain_expiry_date',
    });
    await queryInterface.addColumn('websites', 'hosting_plan', {
      type: Sequelize.STRING(191),
      allowNull: true,
      after: 'hosting_provider',
    });
    await queryInterface.addColumn('websites', 'server_ip', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'hosting_plan',
    });
    await queryInterface.addColumn('websites', 'last_backup_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'monitoring_enabled',
    });
    await queryInterface.addColumn('websites', 'backup_provider', {
      type: Sequelize.STRING(191),
      allowNull: true,
      after: 'last_backup_at',
    });
    await queryInterface.addColumn('websites', 'backup_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'backup_provider',
    });

    await queryInterface.createTable('website_dns_records', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      website_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'websites',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      record_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      host: {
        type: Sequelize.STRING(191),
        allowNull: true,
      },
      value: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      ttl: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      priority: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      notes: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // update enum for website_checks.check_type to include 'domain'
    await queryInterface.changeColumn('website_checks', 'check_type', {
      type: Sequelize.ENUM('ssl', 'uptime', 'performance', 'domain'),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.changeColumn('website_checks', 'check_type', {
      type: Sequelize.ENUM('ssl', 'uptime', 'performance'),
      allowNull: false,
    });

    await queryInterface.dropTable('website_dns_records');

    await queryInterface.removeColumn('websites', 'backup_notes');
    await queryInterface.removeColumn('websites', 'backup_provider');
    await queryInterface.removeColumn('websites', 'last_backup_at');
    await queryInterface.removeColumn('websites', 'server_ip');
    await queryInterface.removeColumn('websites', 'hosting_plan');
    await queryInterface.removeColumn('websites', 'registrar');
    await queryInterface.removeColumn('websites', 'domain_expiry_date');
  },
};
