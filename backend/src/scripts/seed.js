import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import Order from '../models/Order.js';

dotenv.config();

/* ── Ảnh mẫu (Pexels - jewelry) ─────────────────── */
const IMGS = {
  ring1: 'https://images.pexels.com/photos/1232459/pexels-photo-1232459.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ring2: 'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ring3: 'https://images.pexels.com/photos/1189034/pexels-photo-1189034.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ring4: 'https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg?auto=compress&cs=tinysrgb&w=1200',
  necklace1: 'https://images.pexels.com/photos/10475738/pexels-photo-10475738.jpeg?auto=compress&cs=tinysrgb&w=1200',
  necklace2: 'https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg?auto=compress&cs=tinysrgb&w=1200',
  necklace3: 'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=1200',
  earring1: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=1200',
  earring2: 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=1200',
  bracelet1: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1200',
  bracelet2: 'https://images.pexels.com/photos/1161786/pexels-photo-1161786.jpeg?auto=compress&cs=tinysrgb&w=1200',
  banner1: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=1920',
  banner2: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1920',
  banner3: 'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=1920',
};

/* ── Helper: tạo tổ hợp variants ─────────────────── */
const makeVariants = (options, basePrice) => {
  const cartesian = (arrs) =>
    arrs.reduce(
      (acc, opt) => {
        const out = [];
        acc.forEach((combo) => opt.values.forEach((val) => out.push({ ...combo, [opt.name]: val })));
        return out;
      },
      [{}],
    );
  const combos = cartesian(options);
  return combos.map((combo, i) => ({
    combination: combo,
    stock: Math.floor(Math.random() * 8) + 3,
    price: i % 3 === 0 ? undefined : undefined, // giá gốc, không override
    sku: undefined,
  }));
};

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB. Clearing data...');

    /* ── Xoá sạch toàn bộ ─────────────────────────── */
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Banner.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('All collections cleared.');

    /* ── Users ────────────────────────────────────── */
    await User.create([
      {
        name: 'Admin',
        email: 'admin@jewelry.com',
        password: '123456',
        role: 'admin',
        isActive: true,
      },
      {
        name: 'Nguyễn Thị Linh',
        email: 'customer@jewelry.com',
        password: '123456',
        role: 'user',
        isActive: true,
      },
    ]);
    console.log('Users created.');

    /* ── Categories ───────────────────────────────── */
    const cats = await Category.insertMany([
      {
        name: 'Nhẫn',
        slug: 'nhan',
        level: 1,
        isActive: true,
        image: IMGS.ring1,
      },
      {
        name: 'Vòng cổ',
        slug: 'vong-co',
        level: 1,
        isActive: true,
        image: IMGS.necklace1,
      },
      {
        name: 'Bông tai',
        slug: 'bong-tai',
        level: 1,
        isActive: true,
        image: IMGS.earring1,
      },
      {
        name: 'Lắc tay',
        slug: 'lac-tay',
        level: 1,
        isActive: true,
        image: IMGS.bracelet1,
      },
    ]);
    const [ringCat, necklaceCat, earringCat, braceletCat] = cats;
    console.log('Categories created.');

    /* ── Products ─────────────────────────────────── */
    // Options mẫu cho từng loại sản phẩm
    const ringOptions = [
      { name: 'Size', values: ['12', '13', '14', '15', '16', '17'] },
      { name: 'Chất liệu', values: ['Vàng vàng', 'Vàng trắng', 'Vàng hồng'] },
    ];
    const ringOptionsSimple = [
      { name: 'Size', values: ['12', '13', '14', '15', '16'] },
    ];
    const necklaceOptions = [
      { name: 'Chiều dài', values: ['40 cm', '45 cm', '50 cm'] },
    ];
    const braceletOptions = [
      { name: 'Size', values: ['15 cm', '16 cm', '17 cm', '18 cm'] },
    ];
    const earringOptionsNoVariant = [];

    await Product.insertMany([
      /* ── Nhẫn ─── */
      {
        name: 'Nhẫn vàng 18K đính đá CZ hình hoa',
        slug: 'nhan-vang-18k-cz-hoa',
        description:
          'Nhẫn vàng 18K thiết kế hình hoa tinh tế, đính đá CZ sáng lấp lánh. Phù hợp làm quà tặng hoặc đeo hàng ngày. Bảo hành 12 tháng.',
        price: 2500000,
        salePrice: 2200000,
        images: [IMGS.ring1, IMGS.ring2],
        category: ringCat._id,
        material: 'gold',
        gemstone: 'Cubic Zirconia',
        weight: 3.2,
        options: ringOptions,
        variants: makeVariants(ringOptions, 2200000),
        stock: 0,
        tags: ['nhan', 'vang', '18k', 'cz', 'hoa'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Nhẫn đôi vàng 10K trơn khắc tên',
        slug: 'nhan-doi-vang-10k-tron',
        description:
          'Nhẫn đôi vàng 10K thiết kế trơn thanh lịch, có thể khắc tên theo yêu cầu. Ý nghĩa, sang trọng — lựa chọn hoàn hảo cho những dịp đặc biệt.',
        price: 3800000,
        images: [IMGS.ring3, IMGS.ring4],
        category: ringCat._id,
        material: 'gold',
        weight: 4.0,
        options: ringOptionsSimple,
        variants: makeVariants(ringOptionsSimple, 3800000),
        stock: 0,
        tags: ['nhan', 'vang', '10k', 'doi', 'khac-ten'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Nhẫn bạc 925 đính đá Moonstone',
        slug: 'nhan-bac-925-moonstone',
        description:
          'Nhẫn bạc 925 đính đá Moonstone ánh xanh huyền bí. Thiết kế tinh tế, phù hợp với phong cách minimalist hoặc boho chic.',
        price: 1200000,
        salePrice: 980000,
        images: [IMGS.ring2, IMGS.ring1],
        category: ringCat._id,
        material: 'silver',
        gemstone: 'Moonstone',
        weight: 2.8,
        options: ringOptionsSimple,
        variants: makeVariants(ringOptionsSimple, 980000),
        stock: 0,
        tags: ['nhan', 'bac', '925', 'moonstone'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Nhẫn vàng trắng 14K kim cương nhân tạo',
        slug: 'nhan-vang-trang-14k-cvd',
        description:
          'Nhẫn vàng trắng 14K đính kim cương nhân tạo CVD 0.3ct. Sáng rực, tinh tế — phù hợp làm nhẫn đính hôn hoặc kỷ niệm.',
        price: 7500000,
        salePrice: 6800000,
        images: [IMGS.ring4, IMGS.ring3],
        category: ringCat._id,
        material: 'gold',
        gemstone: 'CVD Diamond',
        weight: 3.5,
        options: ringOptions,
        variants: makeVariants(ringOptions, 6800000),
        stock: 0,
        tags: ['nhan', 'vang-trang', '14k', 'kim-cuong', 'cvd'],
        isActive: true,
        isFeatured: true,
      },

      /* ── Vòng cổ ─── */
      {
        name: 'Dây chuyền vàng 18K mặt hình trái tim',
        slug: 'day-chuyen-vang-18k-trai-tim',
        description:
          'Dây chuyền vàng 18K với mặt trái tim đính đá CZ, thiết kế nhỏ nhắn thanh thoát. Kèm hộp quà sang trọng.',
        price: 3200000,
        salePrice: 2900000,
        images: [IMGS.necklace1, IMGS.necklace2],
        category: necklaceCat._id,
        material: 'gold',
        gemstone: 'Cubic Zirconia',
        weight: 4.2,
        options: necklaceOptions,
        variants: makeVariants(necklaceOptions, 2900000),
        stock: 0,
        tags: ['vong-co', 'vang', '18k', 'trai-tim'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Vòng cổ bạc 925 mặt đồng xu vintage',
        slug: 'vong-co-bac-925-dong-xu',
        description:
          'Vòng cổ bạc 925 mặt hình đồng xu khắc họa tiết vintage. Phong cách retro, dễ kết hợp với nhiều trang phục.',
        price: 1500000,
        images: [IMGS.necklace2, IMGS.necklace3],
        category: necklaceCat._id,
        material: 'silver',
        weight: 5.1,
        options: necklaceOptions,
        variants: makeVariants(necklaceOptions, 1500000),
        stock: 0,
        tags: ['vong-co', 'bac', '925', 'vintage'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Dây chuyền vàng 14K đính đá Topaz xanh',
        slug: 'day-chuyen-vang-14k-topaz',
        description:
          'Dây chuyền vàng 14K đính đá Topaz xanh thiên nhiên, màu xanh biển trong trẻo. Chứng nhận đá thiên nhiên kèm theo.',
        price: 5800000,
        images: [IMGS.necklace3, IMGS.necklace1],
        category: necklaceCat._id,
        material: 'gold',
        gemstone: 'Blue Topaz',
        weight: 3.7,
        options: necklaceOptions,
        variants: makeVariants(necklaceOptions, 5800000),
        stock: 0,
        tags: ['vong-co', 'vang', '14k', 'topaz'],
        isActive: true,
        isFeatured: true,
      },

      /* ── Bông tai ─── */
      {
        name: 'Bông tai vàng 18K đính Moissanite 4mm',
        slug: 'bong-tai-vang-18k-moissanite',
        description:
          'Bông tai vàng 18K đính đá Moissanite 4mm, độ lấp lánh vượt trội. Thiết kế hình tròn cổ điển, phù hợp mọi dịp từ thường ngày đến dạ tiệc.',
        price: 4800000,
        salePrice: 4200000,
        images: [IMGS.earring1, IMGS.earring2],
        category: earringCat._id,
        material: 'gold',
        gemstone: 'Moissanite',
        weight: 1.8,
        options: earringOptionsNoVariant,
        variants: [],
        stock: 12,
        tags: ['bong-tai', 'vang', '18k', 'moissanite'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Khuyên tai bạc 925 hình ngọc trai',
        slug: 'khuyen-tai-bac-925-ngoc-trai',
        description:
          'Khuyên tai bạc 925 gắn ngọc trai nước ngọt tự nhiên 7–8mm. Thanh lịch, sang trọng, phù hợp với váy công sở hoặc dạ tiệc nhẹ.',
        price: 2200000,
        images: [IMGS.earring2, IMGS.earring1],
        category: earringCat._id,
        material: 'silver',
        gemstone: 'Ngọc trai nước ngọt',
        weight: 2.2,
        options: earringOptionsNoVariant,
        variants: [],
        stock: 15,
        tags: ['bong-tai', 'bac', '925', 'ngoc-trai'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Bông tai vàng hồng 14K thả dài đá Ruby',
        slug: 'bong-tai-vang-hong-14k-ruby',
        description:
          'Bông tai thả dài vàng hồng 14K đính đá Ruby đỏ tự nhiên. Nổi bật, quyến rũ — lựa chọn lý tưởng cho buổi tối đặc biệt.',
        price: 6500000,
        images: [IMGS.earring1, IMGS.earring2],
        category: earringCat._id,
        material: 'gold',
        gemstone: 'Ruby',
        weight: 2.5,
        options: earringOptionsNoVariant,
        variants: [],
        stock: 6,
        tags: ['bong-tai', 'vang-hong', '14k', 'ruby'],
        isActive: true,
        isFeatured: true,
      },

      /* ── Lắc tay ─── */
      {
        name: 'Lắc tay vàng 18K dạng dây xoắn',
        slug: 'lac-tay-vang-18k-day-xoan',
        description:
          'Lắc tay vàng 18K thiết kế dây xoắn tinh tế, độ dày vừa phải. Phong cách hiện đại, dễ kết hợp với đồng hồ hoặc vòng charm.',
        price: 4500000,
        salePrice: 3900000,
        images: [IMGS.bracelet1, IMGS.bracelet2],
        category: braceletCat._id,
        material: 'gold',
        weight: 5.8,
        options: braceletOptions,
        variants: makeVariants(braceletOptions, 3900000),
        stock: 0,
        tags: ['lac-tay', 'vang', '18k', 'xoan'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Lắc tay bạc 925 charm hình trái tim',
        slug: 'lac-tay-bac-925-charm',
        description:
          'Lắc tay bạc 925 với charm hình trái tim nhỏ xinh. Thiết kế tinh tế, nhẹ nhàng — món quà lý tưởng cho người thân yêu.',
        price: 1800000,
        images: [IMGS.bracelet2, IMGS.bracelet1],
        category: braceletCat._id,
        material: 'silver',
        weight: 4.2,
        options: braceletOptions,
        variants: makeVariants(braceletOptions, 1800000),
        stock: 0,
        tags: ['lac-tay', 'bac', '925', 'charm', 'trai-tim'],
        isActive: true,
        isFeatured: false,
      },
    ]);
    console.log('Products created.');

    /* ── Banners ──────────────────────────────────── */
    await Banner.insertMany([
      {
        title: 'Bộ sưu tập mùa hè 2025',
        image: IMGS.banner1,
        link: '/shop',
        position: 'hero',
        isActive: true,
        order: 1,
      },
      {
        title: 'Nhẫn đôi — Khắc tên theo yêu cầu',
        image: IMGS.banner3,
        link: '/shop?category=nhan',
        position: 'hero',
        isActive: true,
        order: 2,
      },
      {
        title: 'Trang sức bạc 925 — Ưu đãi đến 30%',
        image: IMGS.banner2,
        link: '/shop',
        position: 'hero',
        isActive: true,
        order: 3,
      },
    ]);
    console.log('Banners created.');

    console.log('\n✅ Seed data hoàn tất!');
    console.log('─────────────────────────────────');
    console.log('Admin  : admin@jewelry.com / 123456');
    console.log('Khách  : customer@jewelry.com / 123456');
    console.log('─────────────────────────────────');
    console.log('Danh mục : 4');
    console.log('Sản phẩm : 12 (có biến thể size/chất liệu/chiều dài)');
    console.log('Banner   : 3');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
