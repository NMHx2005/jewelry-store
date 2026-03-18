import Cart from '../models/Cart.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json({ success: true, data: cart || { items: [] } });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty = 1, variant } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, qty, variant }],
      });
    } else {
      const existing = cart.items.find(
        (item) => item.product.toString() === productId && item.variant === variant,
      );
      if (existing) {
        existing.qty += qty;
      } else {
        cart.items.push({ product: productId, qty, variant });
      }
      await cart.save();
    }

    await cart.populate('items.product');
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

export const updateCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items },
      { new: true, upsert: true },
    ).populate('items.product');

    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { variant } = req.query;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.json({ success: true, data: { items: [] } });
    }

    cart.items = cart.items.filter((item) => {
      const matchProduct = item.product.toString() === productId;
      const matchVariant = variant ? item.variant === variant : true;
      return !(matchProduct && matchVariant);
    });

    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

