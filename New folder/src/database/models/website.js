module.exports = (sequelize, DataTypes) => {
  const Website = sequelize.define(
    'Website',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      domain: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM('online', 'degraded', 'offline', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown',
      },
      ssl_expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      domain_expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      registrar: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      hosting_provider: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      hosting_plan: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      server_ip: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      monitoring_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_backup_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      backup_provider: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      backup_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      owner_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'websites',
      underscored: true,
    }
  );

  Website.associate = (models) => {
    Website.belongsTo(models.User, {
      foreignKey: 'owner_user_id',
      as: 'owner',
    });

    Website.belongsTo(models.Team, {
      foreignKey: 'team_id',
      as: 'team',
    });

    Website.hasMany(models.WebsiteCheck, {
      foreignKey: 'website_id',
      as: 'checks',
    });

    Website.belongsToMany(models.User, {
      through: models.WebsiteMember,
      foreignKey: 'website_id',
      otherKey: 'user_id',
      as: 'members',
    });

    Website.hasMany(models.WebsiteMember, {
      foreignKey: 'website_id',
      as: 'memberEntries',
    });

    Website.belongsToMany(models.Tag, {
      through: models.WebsiteTag,
      foreignKey: 'website_id',
      otherKey: 'tag_id',
      as: 'tags',
    });
  };

  return Website;
};
