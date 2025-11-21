module.exports = (sequelize, DataTypes) => {
  const WebsiteMember = sequelize.define(
    'WebsiteMember',
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
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      permission: {
        type: DataTypes.ENUM('view', 'edit'),
        allowNull: false,
        defaultValue: 'view',
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'website_members',
      underscored: true,
    }
  );

  WebsiteMember.associate = (models) => {
    WebsiteMember.belongsTo(models.Website, {
      foreignKey: 'website_id',
      as: 'website',
    });

    WebsiteMember.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return WebsiteMember;
};
