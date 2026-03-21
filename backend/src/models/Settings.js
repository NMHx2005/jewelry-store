import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#f59e0b' },
    secondaryColor: { type: String, default: '#ffffff' },
    homepageTagline: {
      type: String,
      default: 'Trang sức tinh tế – Đẳng cấp vượt thời gian',
    },
    commitment: {
      label: { type: String, default: 'Cam kết của chúng tôi' },
      title: { type: String, default: 'Trang sức — Không chỉ là món đồ' },
      description: {
        type: String,
        default:
          'Mỗi sản phẩm được chọn lọc kỹ lưỡng từ những chất liệu cao cấp, được chế tác tỉ mỉ để trở thành vật kỷ niệm đồng hành cùng bạn suốt cuộc đời.',
      },
      bullets: {
        type: [String],
        default: [
          'Chất liệu vàng, bạc, bạch kim chuẩn kiểm định',
          'Đóng gói sang trọng — sẵn sàng làm quà tặng',
          'Bảo hành & hỗ trợ làm sạch tận tâm',
        ],
      },
    },
    testimonials: {
      type: [
        {
          id: { type: String },
          quote: { type: String },
          author: { type: String },
        },
      ],
      default: [
        {
          id: '1',
          quote:
            '"Trang sức tinh tế, cầm trên tay cảm nhận rõ độ hoàn thiện. Đóng gói rất đẹp, phù hợp làm quà tặng."',
          author: 'Minh Anh, HCM',
        },
      ],
    },
  },
  { timestamps: true },
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
