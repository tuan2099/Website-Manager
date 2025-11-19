module.exports = (sequelize, DataTypes) => {
  const WebsiteAlert = sequelize.define(
    'WebsiteAlert',
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
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'open',
      },
      message: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'website_alerts',
      underscored: true,
    }
  );

  WebsiteAlert.associate = (models) => {
    WebsiteAlert.belongsTo(models.Website, {
      foreignKey: 'website_id',
      as: 'website',
    });
  };

  return WebsiteAlert;
};
