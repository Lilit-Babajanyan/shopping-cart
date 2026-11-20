const { Product } = require("../models");

const createProduct = async (name, price, stock) => {
  const product = await Product.create({
    name,
    price,
    stock,
  });

  return product;
};

module.exports = {
  createProduct,
};
