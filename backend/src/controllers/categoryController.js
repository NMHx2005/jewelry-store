import slugify from 'slugify';
import Category from '../models/Category.js';
import Industry from '../models/Industry.js';

const makeSlug = (name) =>
  slugify(name, { lower: true, strict: true, locale: 'vi' });

export const getCategories = async (req, res, next) => {
  try {
    const { industry } = req.query;
    const filter = {};

    if (industry) {
      const isObjectId = /^[a-f\d]{24}$/i.test(industry);
      if (isObjectId) {
        filter.industry = industry;
      } else {
        const ind = await Industry.findOne({ slug: industry });
        if (ind) filter.industry = ind._id;
        else filter.industry = null; // no match → return empty
      }
    }

    const categories = await Category.find(filter)
      .populate('industry', 'name slug')
      .sort({ level: 1, name: 1 });
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

