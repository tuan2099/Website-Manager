import { Model } from 'sequelize';
import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Role, { through: 'UserRoles' });
      User.hasMany(models.RefreshToken);
      User.hasMany(models.ActivityLog);
    }

    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }

    async getUserWithPermissions() {
      const roles = await this.getRoles({
        include: [{
          model: sequelize.models.Permission,
          through: { attributes: [] }
        }]
      });
      
      const permissions = [...new Set(
        roles.flatMap(role => role.Permissions.map(p => p.slug))
      )];
      
      return {
        id: this.id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
        avatar: this.avatar,
        status: this.status,
        roles: roles.map(r => r.slug),
        permissions
      };
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: DataTypes.STRING,
    avatar: DataTypes.STRING,
    phone: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blocked'),
      defaultValue: 'active'
    },
    lastLogin: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};
