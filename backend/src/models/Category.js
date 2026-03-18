import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    level: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Category = mongoose.model('Category', categorySchema);

export default Category;

