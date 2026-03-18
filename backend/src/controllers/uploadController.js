export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file upload' });
  }

  return res.json({
    success: true,
    data: {
      url: req.file.path,
      publicId: req.file.filename,
    },
  });
};

export const deleteImage = async (req, res) => {
  // Ở đây bạn có thể gọi cloudinary.v2.uploader.destroy(publicId).
  // Tạm thời chỉ trả về OK để giữ API sẵn sàng.
  res.json({ success: true, message: 'Đã yêu cầu xoá ảnh (mock)' });
};

