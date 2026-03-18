import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    images: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    material: {
      type: String,
      enum: ['gold', 'silver', 'platinum'],
      required: true,
    },
    gemstone: { type: String },
    weight: { type: Number }, // grams
    size: [{ type: String }],
    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    rating: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

const Product = mongoose.model('Product', productSchema);

export default Product;

