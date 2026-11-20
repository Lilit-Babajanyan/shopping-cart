const productService = require("../services/productService");

const createProduct = async (req, res, next) => {
  try {
    const { name, price, stock } = req.body;

    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      !Number.isSafeInteger(price) ||
      price < 0 ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {
      return res.status(400).json({
        message: "invalid_product_data",
      });
    }

    const product = await productService.createProduct(name, price, stock);

    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
};
