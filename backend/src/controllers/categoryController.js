import slugify from 'slugify';
import Category from '../models/Category.js';

const makeSlug = (name) =>
  slugify(name, { lower: true, strict: true, locale: 'vi' });

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ level: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.name) data.slug = makeSlug(data.name);
    const category = await Category.create(data);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.name && !data.slug) data.slug = makeSlug(data.name);
    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    res.json({ success: true, message: 'Đã xoá danh mục' });
  } catch (err) {
    next(err);
  }
};

