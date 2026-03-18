import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      search,
      category,
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

    if (category) {
      const cat = await Category.findOne({ slug: category });
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

export const createProduct = async (req, res, next) => {
  try {
    const data = req.body;
    const product = await Product.create(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
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

