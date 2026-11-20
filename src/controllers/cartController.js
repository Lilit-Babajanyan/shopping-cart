const cartService = require("../services/cartService");

// Create an empty cart
const createCart = async (req, res, next) => {
  try {
    const cart = await cartService.createCart();

    return res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
};

// Get cart with calculated prices
const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.params.id);

    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// Add, update, or remove a cart item
const setItemQuantity = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;

    if (!Number.isSafeInteger(product_id) || product_id <= 0) {
      return res.status(400).json({
        message: "invalid_product_id",
      });
    }

    const cart = await cartService.setItemQuantity(
      req.params.id,
      product_id,
      quantity,
    );

    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// Apply promo code
const applyPromo = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (typeof code !== "string" || code.trim() === "") {
      return res.status(400).json({
        message: "invalid_promo_code",
      });
    }

    const cart = await cartService.applyPromo(req.params.id, code);

    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// Remove promo code
const removePromo = async (req, res, next) => {
  try {
    const cart = await cartService.removePromo(req.params.id);

    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// Complete checkout
const checkout = async (req, res, next) => {
  try {
    const result = await cartService.checkout(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCart,
  getCart,
  setItemQuantity,
  applyPromo,
  removePromo,
  checkout,
};
