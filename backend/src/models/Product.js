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
    material: { type: String, required: true, trim: true },
    gemstone: { type: String },
    weight: { type: Number },
    materialDetail: { type: String },
    size: [{ type: String }],

    /* ── Variant system ─────────────────────────────
       options: khai báo tên & danh sách giá trị
         e.g. [{name:'Size', values:['12','13','14']},
               {name:'Màu',  values:['Vàng 18k','Bạc 925']}]
       variants: mỗi tổ hợp cụ thể
         e.g. [{combination:{Size:'12',Màu:'Vàng 18k'}, stock:5, price:2200000}]
    ─────────────────────────────────────────────── */
    options: [
      {
        name: { type: String, required: true },
        values: [{ type: String }],
      },
    ],
    variants: [
      {
        combination: { type: Map, of: String },
        stock: { type: Number, default: 0 },
        price: { type: Number },
        sku: { type: String },
      },
    ],

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

