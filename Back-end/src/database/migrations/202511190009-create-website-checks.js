module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('website_checks', {
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
      check_type: {
        type: Sequelize.ENUM('ssl', 'uptime', 'performance'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('ok', 'warning', 'error'),
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      raw_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      checked_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('website_checks');
  },
};
