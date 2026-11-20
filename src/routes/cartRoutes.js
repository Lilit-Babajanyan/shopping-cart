const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");

router.post("/", cartController.createCart);

router.get("/:id", cartController.getCart);

router.put("/:id/items", cartController.setItemQuantity);

router.post("/:id/promo", cartController.applyPromo);

router.delete("/:id/promo", cartController.removePromo);

router.post("/:id/checkout", cartController.checkout);

module.exports = router;
