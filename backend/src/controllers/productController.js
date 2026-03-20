import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Industry from '../models/Industry.js';
import slugify from 'slugify';

const makeSlug = async (name, excludeId = null) => {
  let base = slugify(name, { lower: true, strict: true, locale: 'vi' });
  let slug = base;
  let counter = 1;
  while (true) {
    const query = excludeId
      ? { slug, _id: { $ne: excludeId } }
      : { slug };
    const exists = await Product.findOne(query).lean();
    if (!exists) break;
    slug = `${base}-${counter++}`;
  }
  return slug;
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      search,
      category,
      industry,
      material,
      minPrice,
      maxPrice,
      isFeatured,
    } = req.query;

    const { showAll } = req.query;
    const filter = showAll === 'true' ? {} : { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (industry) {
      // Filter all categories belonging to this industry (by slug or ObjectId)
      const isObjectId = /^[a-f\d]{24}$/i.test(industry);
      const ind = isObjectId
        ? await Industry.findById(industry)
        : await Industry.findOne({ slug: industry });
      if (ind) {
        const cats = await Category.find({ industry: ind._id }).select('_id');
        filter.category = { $in: cats.map((c) => c._id) };
      }
    }

    if (category) {
      const isObjectId = /^[a-f\d]{24}$/i.test(category);
      const cat = isObjectId
        ? await Category.findById(category)
        : await Category.findOne({ slug: category });
      if (cat) {
        filter.category = cat._id;
      }
    }

    if (material) {
      filter.material = material;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (isFeatured) {
      filter.isFeatured = isFeatured === 'true';
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate('category')
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
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

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, isActive: true }).populate('category');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const parseVariantFields = (body) => {
  const data = { ...body };

  if (typeof data.options === 'string') {
    try { data.options = JSON.parse(data.options); } catch { data.options = []; }
  }
  if (typeof data.variants === 'string') {
    try { data.variants = JSON.parse(data.variants); } catch { data.variants = []; }
  }
  if (typeof data.size === 'string') {
    try { data.size = JSON.parse(data.size); } catch { data.size = data.size ? [data.size] : []; }
  }
  if (typeof data.tags === 'string') {
    try { data.tags = JSON.parse(data.tags); } catch { data.tags = []; }
  }

  /* Tự tổng hợp stock từ variants nếu có */
  if (Array.isArray(data.variants) && data.variants.length > 0) {
    data.stock = data.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }

  return data;
};

export const createProduct = async (req, res, next) => {
  try {
    const data = parseVariantFields(req.body);
    if (!data.slug && data.name) {
      data.slug = await makeSlug(data.name);
    }
    const product = await Product.create(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = parseVariantFields(req.body);
    if (!data.slug && data.name) {
      data.slug = await makeSlug(data.name, id);
    }
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ success: true, message: 'Đã xoá sản phẩm' });
  } catch (err) {
    next(err);
  }
};

export const uploadProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    const imageUrls = files.map((f) => f.path);

    const product = await Product.findByIdAndUpdate(
      id,
      { $push: { images: { $each: imageUrls } } },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

