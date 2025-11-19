module.exports = (sequelize, DataTypes) => {
  const WebsiteNotificationSetting = sequelize.define(
    'WebsiteNotificationSetting',
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
      email_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      webhook_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      webhook_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'website_notification_settings',
      underscored: true,
    }
  );

  WebsiteNotificationSetting.associate = (models) => {
    WebsiteNotificationSetting.belongsTo(models.Website, {
      foreignKey: 'website_id',
      as: 'website',
    });
  };

  return WebsiteNotificationSetting;
};
