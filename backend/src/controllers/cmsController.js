import Banner from '../models/Banner.js';
import Settings from '../models/Settings.js';

export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({}).sort({ position: 1, order: 1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    next(err);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    }
    res.json({ success: true, data: banner });
  } catch (err) {
    next(err);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    }
    res.json({ success: true, message: 'Đã xoá banner' });
  } catch (err) {
    next(err);
  }
};

// Lấy document settings duy nhất, tạo mới nếu chưa có (upsert pattern)
const getOrCreateSettings = () =>
  Settings.findOneAndUpdate(
    { key: 'global' },
    { $setOnInsert: { key: 'global' } },
    { upsert: true, new: true },
  );

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { commitment, testimonials, ...rest } = req.body;
    const update = { ...rest };

    if (commitment !== undefined) update.commitment = commitment;
    if (testimonials !== undefined) update.testimonials = testimonials;

    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: update },
      { upsert: true, new: true, runValidators: true },
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

