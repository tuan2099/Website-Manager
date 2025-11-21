module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
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
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      channel: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      payload: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'notifications',
      underscored: true,
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.Website, {
      foreignKey: 'website_id',
      as: 'website',
    });
  };

  return Notification;
};
