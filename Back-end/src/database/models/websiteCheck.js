module.exports = (sequelize, DataTypes) => {
  const WebsiteCheck = sequelize.define(
    'WebsiteCheck',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      website_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      check_type: {
        type: DataTypes.ENUM('ssl', 'uptime', 'performance'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('ok', 'warning', 'error'),
        allowNull: false,
      },
      response_time_ms: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      message: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      raw_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      checked_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: DataTypes.DATE,
    },
    {
      tableName: 'website_checks',
      underscored: true,
      updatedAt: false,
    }
  );

  WebsiteCheck.associate = (models) => {
    WebsiteCheck.belongsTo(models.Website, {
      foreignKey: 'website_id',
      as: 'website',
    });
  };

  return WebsiteCheck;
};
