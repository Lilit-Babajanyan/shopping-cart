const Product = require("./Product");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const PromoCode = require("./PromoCode");

Cart.hasMany(CartItem, {
  foreignKey: "cart_id",
  onDelete: "CASCADE",
});

CartItem.belongsTo(Cart, {
  foreignKey: "cart_id",
});


Product.hasMany(CartItem, {
  foreignKey: "product_id",
});

CartItem.belongsTo(Product, {
  foreignKey: "product_id",
});


PromoCode.hasMany(Cart, {
  foreignKey: "promo_code",
  sourceKey: "code",
});

Cart.belongsTo(PromoCode, {
  foreignKey: "promo_code",
  targetKey: "code",
});

module.exports = {
  Product,
  Cart,
  CartItem,
  PromoCode,
};
