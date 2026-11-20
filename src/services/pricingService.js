const calculateSubtotal = (items) => {
  return items.reduce((subtotal, item) => {
    return subtotal + item.quantity * item.Product.price;
  }, 0);
};

const validatePromo = (promo, subtotal) => {
  if (new Date(promo.expires_at) <= new Date()) {
    return "expired";
  }

  if (promo.times_used >= promo.usage_limit) {
    return "usage_limit_reached";
  }

  if (subtotal < promo.min_cart_total) {
    return "min_total_not_met";
  }

  return null;
};

const calculateDiscount = (subtotal, promo) => {
  if (!promo) {
    return 0;
  }

  const error = validatePromo(promo, subtotal);

  if (error) {
    return 0;
  }

  let discount = 0;

  if (promo.type === "percentage") {
    discount = Math.floor((subtotal * promo.value) / 100);
  } else if (promo.type === "fixed") {
    discount = promo.value;
  }

  return Math.min(discount, subtotal);
};

const calculateTotal = (subtotal, discount) => {
  return Math.max(0, subtotal - discount);
};

module.exports = {
  calculateSubtotal,
  validatePromo,
  calculateDiscount,
  calculateTotal,
};
