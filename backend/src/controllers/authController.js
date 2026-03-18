import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Sai email hoặc mật khẩu' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Sai email hoặc mật khẩu' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

export const logout = async (req, res) => {
  // Với JWT lưu phía client, logout chỉ là để client xoá token.
  res.json({ success: true, message: 'Đã đăng xuất' });
};

export const refreshToken = async (req, res, next) => {
  try {
    // Đơn giản hoá: dùng user hiện tại (đã qua auth middleware) để cấp token mới.
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = generateToken(user);
    res.json({
      success: true,
      data: {
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

