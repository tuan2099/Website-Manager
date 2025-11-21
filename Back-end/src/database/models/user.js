module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(191),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(191),
        allowNull: false,
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
      tableName: 'users',
      underscored: true,
    }
  );

  User.associate = (models) => {
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles',
    });

    User.hasMany(models.ActivityLog, {
      foreignKey: 'user_id',
      as: 'activityLogs',
    });

    User.belongsToMany(models.Team, {
      through: models.UserTeam,
      foreignKey: 'user_id',
      otherKey: 'team_id',
      as: 'teams',
    });

    User.belongsToMany(models.Website, {
      through: models.WebsiteMember,
      foreignKey: 'user_id',
      otherKey: 'website_id',
      as: 'websitePermissions',
    });
  };

  return User;
};
