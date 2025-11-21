module.exports = (sequelize, DataTypes) => {
  const Webhook = sequelize.define(
    'Webhook',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      website_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      event: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      secret: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'webhooks',
      underscored: true,
    }
  );

  Webhook.associate = (models) => {
    Webhook.belongsTo(models.Website, {
      foreignKey: 'website_id',
      as: 'website',
    });
  };

  return Webhook;
};
