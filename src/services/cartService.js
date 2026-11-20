const sequelize = require("../config/database");
const { Cart, CartItem, Product, PromoCode } = require("../models");

const {
  calculateSubtotal,
  validatePromo,
  calculateDiscount,
  calculateTotal,
} = require("./pricingService");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createCart = async () => {
  return await Cart.create();
};

const getCart = async (cartId, transaction = null) => {
  const cart = await Cart.findByPk(cartId, {
    include: [
      {
        model: CartItem,
        include: [Product],
      },
      {
        model: PromoCode,
      },
    ],
    transaction,
  });

  if (!cart) {
    throw createError(404, "cart_not_found");
  }

  const subtotal = calculateSubtotal(cart.CartItems);
  const discount = calculateDiscount(subtotal, cart.PromoCode);
  const total = calculateTotal(subtotal, discount);

  return {
    id: cart.id,
    items: cart.CartItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    })),
    subtotal,
    discount,
    total,
    promo_code: cart.promo_code,
  };
};

const setItemQuantity = async (cartId, productId, quantity) => {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw createError(400, "invalid_quantity");
  }

  const cart = await Cart.findByPk(cartId);
  if (!cart) {
    throw createError(404, "cart_not_found");
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    throw createError(404, "product_not_found");
  }

  if (quantity > product.stock) {
    throw createError(400, "insufficient_stock");
  }

  const existingItem = await CartItem.findOne({
    where: {
      cart_id: cartId,
      product_id: productId,
    },
  });

  if (quantity === 0) {
    if (existingItem) {
      await existingItem.destroy();
    }
  } else if (existingItem) {
    existingItem.quantity = quantity;
    await existingItem.save();
  } else {
    await CartItem.create({
      cart_id: cartId,
      product_id: productId,
      quantity,
    });
  }

  return await getCart(cartId);
};

const applyPromo = async (cartId, code) => {
  const cart = await Cart.findByPk(cartId);
  if (!cart) {
    throw createError(404, "cart_not_found");
  }

  const promo = await PromoCode.findByPk(code);
  if (!promo) {
    throw createError(404, "promo_not_found");
  }

  const items = await CartItem.findAll({
    where: { cart_id: cartId },
    include: [Product],
  });

  const subtotal = calculateSubtotal(items);
  const error = validatePromo(promo, subtotal);

  if (error) {
    throw createError(400, error);
  }

  cart.promo_code = code;
  await cart.save();

  return await getCart(cartId);
};

const removePromo = async (cartId) => {
  const cart = await Cart.findByPk(cartId);
  if (!cart) {
    throw createError(404, "cart_not_found");
  }

  cart.promo_code = null;
  await cart.save();

  return await getCart(cartId);
};

const checkout = async (cartId) => {
  return await sequelize.transaction(async (transaction) => {
    const cart = await Cart.findByPk(cartId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!cart) {
      throw createError(404, "cart_not_found");
    }

    const items = await CartItem.findAll({
      where: { cart_id: cartId },
      include: [Product],
      transaction,
    });

    if (items.length === 0) {
      throw createError(400, "empty_cart");
    }

    const products = [];

    const productIds = [...new Set(items.map((item) => item.product_id))].sort(
      (a, b) => a - b,
    );

    for (const productId of productIds) {
      const product = await Product.findByPk(productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        throw createError(404, "product_not_found");
      }

      products.push(product);
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);

      if (item.quantity > product.stock) {
        throw createError(409, "insufficient_stock");
      }
    }

    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);

      return sum + item.quantity * product.price;
    }, 0);

    let promo = null;

    if (cart.promo_code) {
      promo = await PromoCode.findByPk(cart.promo_code, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
    }

    const promoError = promo ? validatePromo(promo, subtotal) : null;

    const discount = promoError ? 0 : calculateDiscount(subtotal, promo);

    const total = calculateTotal(subtotal, discount);

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);

      product.stock -= item.quantity;
      await product.save({ transaction });
    }

    if (promo && !promoError) {
      promo.times_used += 1;
      await promo.save({ transaction });
    }

    await CartItem.destroy({
      where: { cart_id: cartId },
      transaction,
    });

    cart.promo_code = null;
    await cart.save({ transaction });

    return {
      message: "checkout_successful",
      subtotal,
      discount,
      total,
    };
  });
};

module.exports = {
  createCart,
  getCart,
  setItemQuantity,
  applyPromo,
  removePromo,
  checkout,
};
