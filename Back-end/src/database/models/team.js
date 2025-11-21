module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define(
    'Team',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(191),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'teams',
      underscored: true,
    }
  );

  Team.associate = (models) => {
    Team.belongsToMany(models.User, {
      through: models.UserTeam,
      foreignKey: 'team_id',
      otherKey: 'user_id',
      as: 'members',
    });

    Team.hasMany(models.Website, {
      foreignKey: 'team_id',
      as: 'websites',
    });
  };

  return Team;
};
