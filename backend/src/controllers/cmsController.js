import Banner from '../models/Banner.js';

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

// Để đơn giản, settings tạm thời là 1 document duy nhất trong collection 'settings'.
let inMemorySettings = {
  logoUrl: '',
  primaryColor: '#f59e0b',
  secondaryColor: '#ffffff',
  homepageTagline: 'Trang sức tinh tế – Đẳng cấp vượt thời gian',
};

export const getSettings = async (req, res) => {
  res.json({ success: true, data: inMemorySettings });
};

export const updateSettings = async (req, res) => {
  inMemorySettings = { ...inMemorySettings, ...req.body };
  res.json({ success: true, data: inMemorySettings });
};

