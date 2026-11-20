const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PromoCode = sequelize.define(
  "PromoCode",
  {
    code: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
    },

    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    min_cart_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    times_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "promo_codes",
    timestamps: false,
  },
);

module.exports = PromoCode;
