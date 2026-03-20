import slugify from 'slugify';
import Industry from '../models/Industry.js';
import Category from '../models/Category.js';

const makeSlug = (name) =>
  slugify(name, { lower: true, strict: true, locale: 'vi' });

export const getIndustries = async (req, res, next) => {
  try {
    const { withCategories } = req.query;
    const filter = {};
    // Admin can request showAll=true to see inactive industries
    if (req.query.showAll !== 'true') filter.isActive = true;

    const industries = await Industry.find(filter).sort({ order: 1, name: 1 });

    if (withCategories === 'true') {
      const categories = await Category.find({ isActive: true }).sort({ level: 1, name: 1 }).lean();
      const result = industries.map((ind) => ({
        ...ind.toObject(),
        categories: categories.filter(
          (c) => c.industry && String(c.industry) === String(ind._id),
        ),
      }));
      return res.json({ success: true, data: result });
    }

    res.json({ success: true, data: industries });
  } catch (err) {
    next(err);
  }
};

export const getIndustryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const industry = await Industry.findOne({ slug, isActive: true });
    if (!industry) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ngành' });
    }
    const categories = await Category.find({ industry: industry._id, isActive: true }).sort({ level: 1, name: 1 });
    res.json({ success: true, data: { ...industry.toObject(), categories } });
  } catch (err) {
    next(err);
  }
};

export const createIndustry = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.name) data.slug = makeSlug(data.name);
    const industry = await Industry.create(data);
    res.status(201).json({ success: true, data: industry });
  } catch (err) {
    next(err);
  }
};

export const updateIndustry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.name && !data.slug) data.slug = makeSlug(data.name);
    const industry = await Industry.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!industry) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ngành' });
    }
    res.json({ success: true, data: industry });
  } catch (err) {
    next(err);
  }
};

export const deleteIndustry = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Unlink categories before deleting
    await Category.updateMany({ industry: id }, { $set: { industry: null } });
    const industry = await Industry.findByIdAndDelete(id);
    if (!industry) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ngành' });
    }
    res.json({ success: true, message: 'Đã xoá ngành' });
  } catch (err) {
    next(err);
  }
};
