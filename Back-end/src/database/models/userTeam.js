module.exports = (sequelize, DataTypes) => {
  const UserTeam = sequelize.define(
    'UserTeam',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      team_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'member',
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'user_teams',
      underscored: true,
    }
  );

  UserTeam.associate = (models) => {
    UserTeam.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    UserTeam.belongsTo(models.Team, {
      foreignKey: 'team_id',
      as: 'team',
    });
  };

  return UserTeam;
};
