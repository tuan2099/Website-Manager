module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    'Tag',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      color: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'tags',
      underscored: true,
    }
  );

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Website, {
      through: models.WebsiteTag,
      foreignKey: 'tag_id',
      otherKey: 'website_id',
      as: 'websites',
    });
  };

  return Tag;
};
