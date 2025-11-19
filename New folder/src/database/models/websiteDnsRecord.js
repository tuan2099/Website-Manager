module.exports = (sequelize, DataTypes) => {
  const WebsiteDnsRecord = sequelize.define(
    'WebsiteDnsRecord',
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
      record_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      host: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      value: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      ttl: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      priority: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'website_dns_records',
      underscored: true,
    }
  );

  WebsiteDnsRecord.associate = (models) => {
    WebsiteDnsRecord.belongsTo(models.Website, {
      foreignKey: 'website_id',
      as: 'website',
    });
  };

  return WebsiteDnsRecord;
};
