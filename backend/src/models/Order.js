import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    variant: { type: String }, // size/color, etc.
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,   // địa chỉ đầy đủ (1 ô nhập)
      line1: String,
      line2: String,
      city: String,
      district: String,
      ward: String,
    },
    paymentMethod: { type: String, enum: ['vnpay', 'momo', 'cod'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    note: { type: String },
    trackingCode: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

const Order = mongoose.model('Order', orderSchema);

export default Order;

