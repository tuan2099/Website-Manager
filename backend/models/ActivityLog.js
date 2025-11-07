import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      ActivityLog.belongsTo(models.User);
    }
  }

  ActivityLog.init({
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resource: DataTypes.STRING,
    resourceId: DataTypes.INTEGER,
    ipAddress: DataTypes.STRING,
    userAgent: DataTypes.STRING,
    details: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'ActivityLog'
  });

  return ActivityLog;
};
