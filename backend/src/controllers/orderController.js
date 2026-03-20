import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import sendTelegram from '../utils/sendTelegram.js';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

/**
 * @param {object} order - Mongoose document vừa tạo
 * @param {Array}  richItems - mảng items với đầy đủ name (từ request body hoặc populate)
 */
const buildOrderNotification = (order, richItems = []) => {
  const orderId = String(order._id).slice(-8).toUpperCase();
  const addr = order.shippingAddress || {};
  const customerName = addr.fullName || 'Khách';
  const phone = addr.phone || '—';
  const address = addr.address || addr.line1 || '—';
  const total = fmt(order.totalPrice);

  const itemLines = richItems.length
    ? richItems
        .map((i) => {
          const name = i.name || '(sản phẩm)';
          const variant = i.variant ? ` [${i.variant}]` : '';
          const qty = i.qty || i.quantity || 1;
          const lineTotal = fmt((i.price || 0) * qty);
          return `  • <b>${name}</b>${variant}\n    ${qty} cái × ${fmt(i.price || 0)} = ${lineTotal}`;
        })
        .join('\n')
    : '  (không có thông tin sản phẩm)';

  return (
    `🛍️ <b>ĐƠN HÀNG MỚI #${orderId}</b>\n` +
    `─────────────────────\n` +
    `👤 <b>${customerName}</b>\n` +
    `📞 ${phone}\n` +
    `📍 ${address}\n` +
    `─────────────────────\n` +
    `🧾 <b>Sản phẩm:</b>\n${itemLines}\n` +
    `─────────────────────\n` +
    `💰 <b>Tổng: ${total}</b>\n` +
    `💳 ${(order.paymentMethod || 'cod').toUpperCase()}`
  );
};

export const createOrderFromCart = async (req, res, next) => {
  try {
    const { paymentMethod, note, shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    const items = cart.items.map((item) => ({
      product: item.product._id,
      qty: item.qty,
      price: item.product.price,
      variant: item.variant,
    }));

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
      note,
    });

    // Build richItems BEFORE clearing cart (cart.items still populated here)
    const richItems = cart.items.map((i) => ({
      name: i.product?.name,
      qty: i.qty,
      price: i.product?.price || 0,
      variant: i.variant,
    }));

    cart.items = [];
    await cart.save();

    sendTelegram(buildOrderNotification(order, richItems));

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { paymentMethod, shippingAddress, items: bodyItems } = req.body;

    if (!bodyItems || !Array.isArray(bodyItems) || bodyItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    const items = bodyItems.map((item) => ({
      product: item.id,
      qty: item.quantity,
      price: item.price,
      variant: item.variant || null,
    }));

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = await Order.create({
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    // bodyItems có đủ name, price, quantity, variant từ cart store
    const richItems = bodyItems.map((i) => ({
      name: i.name,
      qty: i.quantity,
      price: i.price,
      variant: i.variant,
    }));
    sendTelegram(buildOrderNotification(order, richItems));

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, orderStatus } = req.query;
    const filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('user').populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (['shipping', 'delivered'].includes(order.orderStatus)) {
      return res
        .status(400)
        .json({ success: false, message: 'Đơn hàng đã giao/đang giao, không thể huỷ' });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

