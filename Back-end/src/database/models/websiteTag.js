module.exports = (sequelize, DataTypes) => {
  const WebsiteTag = sequelize.define(
    'WebsiteTag',
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
      tag_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'website_tags',
      underscored: true,
    }
  );

  WebsiteTag.associate = (models) => {
    WebsiteTag.belongsTo(models.Website, {
      foreignKey: 'website_id',
      as: 'website',
    });

    WebsiteTag.belongsTo(models.Tag, {
      foreignKey: 'tag_id',
      as: 'tag',
    });
  };

  return WebsiteTag;
};
