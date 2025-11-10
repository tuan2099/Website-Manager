import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    static associate(models) {
      RefreshToken.belongsTo(models.User);
    }
  }

  RefreshToken.init(
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "RefreshToken",
      timestamps: false,
    }
  );

  return RefreshToken;
};
