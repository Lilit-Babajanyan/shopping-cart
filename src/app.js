const express = require("express");

const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.use("/products", productRoutes);
app.use("/carts", cartRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "route_not_found",
  });
});

app.use(errorHandler);

module.exports = app;
