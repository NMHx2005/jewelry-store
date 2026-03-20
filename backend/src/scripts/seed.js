import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Industry from '../models/Industry.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import Order from '../models/Order.js';

dotenv.config();

/* ─────────────────────────────────────────────────────────
   ẢNH MẪU (Pexels - free to use)
───────────────────────────────────────────────────────── */
const IMG = {
  // Nhẫn
  ring1: 'https://images.pexels.com/photos/1232459/pexels-photo-1232459.jpeg?auto=compress&cs=tinysrgb&w=800',
  ring2: 'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=800',
  ring3: 'https://images.pexels.com/photos/1189034/pexels-photo-1189034.jpeg?auto=compress&cs=tinysrgb&w=800',
  ring4: 'https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg?auto=compress&cs=tinysrgb&w=800',
  ring5: 'https://images.pexels.com/photos/12906029/pexels-photo-12906029.jpeg?auto=compress&cs=tinysrgb&w=800',
  // Vòng cổ
  neck1: 'https://images.pexels.com/photos/10475738/pexels-photo-10475738.jpeg?auto=compress&cs=tinysrgb&w=800',
  neck2: 'https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg?auto=compress&cs=tinysrgb&w=800',
  neck3: 'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=800',
  neck4: 'https://images.pexels.com/photos/2697786/pexels-photo-2697786.jpeg?auto=compress&cs=tinysrgb&w=800',
  // Bông tai
  ear1: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800',
  ear2: 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=800',
  ear3: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800',
  // Lắc tay
  brace1: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800',
  brace2: 'https://images.pexels.com/photos/1161786/pexels-photo-1161786.jpeg?auto=compress&cs=tinysrgb&w=800',
  brace3: 'https://images.pexels.com/photos/2849742/pexels-photo-2849742.jpeg?auto=compress&cs=tinysrgb&w=800',
  // Đồng hồ nam
  watchM1: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800',
  watchM2: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=800',
  watchM3: 'https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=800',
  watchM4: 'https://images.pexels.com/photos/125779/pexels-photo-125779.jpeg?auto=compress&cs=tinysrgb&w=800',
  // Đồng hồ nữ
  watchF1: 'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=800',
  watchF2: 'https://images.pexels.com/photos/698804/pexels-photo-698804.jpeg?auto=compress&cs=tinysrgb&w=800',
  watchF3: 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=800',
  // Kính mắt
  glass1: 'https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg?auto=compress&cs=tinysrgb&w=800',
  glass2: 'https://images.pexels.com/photos/1340045/pexels-photo-1340045.jpeg?auto=compress&cs=tinysrgb&w=800',
  glass3: 'https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=800',
  // Ví / Túi
  wallet1: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800',
  wallet2: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=800',
  // Banner
  banner1: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=1920',
  banner2: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1920',
  banner3: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=1920',
  banner4: 'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=1920',
  banner5: 'https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg?auto=compress&cs=tinysrgb&w=1920',
};

/* ─────────────────────────────────────────────────────────
   HELPER: Tạo tổ hợp biến thể (cartesian product)
───────────────────────────────────────────────────────── */
const makeVariants = (options, priceOverrides = {}) => {
  const cartesian = (arrs) =>
    arrs.reduce(
      (acc, opt) => {
        const out = [];
        acc.forEach((combo) =>
          opt.values.forEach((val) => out.push({ ...combo, [opt.name]: val })),
        );
        return out;
      },
      [{}],
    );
  return cartesian(options).map((combo) => {
    const key = Object.values(combo).join('|');
    return {
      combination: combo,
      stock: Math.floor(Math.random() * 10) + 2,
      price: priceOverrides[key] || undefined,
      sku: undefined,
    };
  });
};

const rndSold = () => Math.floor(Math.random() * 150);

/* ─────────────────────────────────────────────────────────
   MAIN SEED
───────────────────────────────────────────────────────── */
const run = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB. Clearing data...\n');

    /* ── Xoá sạch toàn bộ ──────────────────────────── */
    await Promise.all([
      User.deleteMany({}),
      Industry.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Banner.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('🗑  All collections cleared.');

    /* ════════════════════════════════════════════════
       USERS
    ════════════════════════════════════════════════ */
    await User.create([
      {
        name: 'Admin',
        email: 'admin@jewelry.com',
        password: '123456',
        role: 'admin',
        phone: '0901000001',
        isActive: true,
      },
      {
        name: 'Nguyễn Thị Linh',
        email: 'linh@example.com',
        password: '123456',
        role: 'user',
        phone: '0901000002',
        isActive: true,
      },
      {
        name: 'Trần Văn Minh',
        email: 'minh@example.com',
        password: '123456',
        role: 'user',
        phone: '0901000003',
        isActive: true,
      },
    ]);
    console.log('👤  Users created (3).');

    /* ════════════════════════════════════════════════
       INDUSTRIES  (Ngành hàng)
    ════════════════════════════════════════════════ */
    const [indJewelry, indWatch, indAccessory] = await Industry.insertMany([
      {
        name: 'Trang Sức',
        slug: 'trang-suc',
        description: 'Nhẫn, dây chuyền, bông tai, lắc tay làm từ vàng, bạc và đá quý cao cấp.',
        image: IMG.neck1,
        isActive: true,
        order: 1,
      },
      {
        name: 'Đồng Hồ',
        slug: 'dong-ho',
        description: 'Đồng hồ nam và nữ từ các thương hiệu và phong cách đa dạng.',
        image: IMG.watchM1,
        isActive: true,
        order: 2,
      },
      {
        name: 'Phụ Kiện',
        slug: 'phu-kien',
        description: 'Kính mắt, ví, túi xách và các phụ kiện thời trang hiện đại.',
        image: IMG.glass1,
        isActive: true,
        order: 3,
      },
    ]);
    console.log('🏭  Industries created (3).');

    /* ════════════════════════════════════════════════
       CATEGORIES  (Danh mục)
    ════════════════════════════════════════════════ */
    const [
      catRing, catNecklace, catEarring, catBracelet,
      catWatchMen, catWatchWomen, catWatchCouple,
      catGlasses, catWallet,
    ] = await Category.insertMany([
      /* ── Trang Sức ── */
      {
        name: 'Nhẫn',
        slug: 'nhan',
        image: IMG.ring1,
        industry: indJewelry._id,
        level: 1,
        isActive: true,
      },
      {
        name: 'Dây Chuyền',
        slug: 'day-chuyen',
        image: IMG.neck1,
        industry: indJewelry._id,
        level: 1,
        isActive: true,
      },
      {
        name: 'Bông Tai',
        slug: 'bong-tai',
        image: IMG.ear1,
        industry: indJewelry._id,
        level: 1,
        isActive: true,
      },
      {
        name: 'Lắc Tay',
        slug: 'lac-tay',
        image: IMG.brace1,
        industry: indJewelry._id,
        level: 1,
        isActive: true,
      },
      /* ── Đồng Hồ ── */
      {
        name: 'Đồng Hồ Nam',
        slug: 'dong-ho-nam',
        image: IMG.watchM1,
        industry: indWatch._id,
        level: 1,
        isActive: true,
      },
      {
        name: 'Đồng Hồ Nữ',
        slug: 'dong-ho-nu',
        image: IMG.watchF1,
        industry: indWatch._id,
        level: 1,
        isActive: true,
      },
      {
        name: 'Đồng Hồ Đôi',
        slug: 'dong-ho-doi',
        image: IMG.watchM2,
        industry: indWatch._id,
        level: 1,
        isActive: true,
      },
      /* ── Phụ Kiện ── */
      {
        name: 'Kính Mắt',
        slug: 'kinh-mat',
        image: IMG.glass1,
        industry: indAccessory._id,
        level: 1,
        isActive: true,
      },
      {
        name: 'Ví & Túi',
        slug: 'vi-tui',
        image: IMG.wallet1,
        industry: indAccessory._id,
        level: 1,
        isActive: true,
      },
    ]);
    console.log('📂  Categories created (9).');

    /* ════════════════════════════════════════════════
       PRODUCTS
    ════════════════════════════════════════════════ */

    /* ── Options dùng lại ─── */
    const optRingSize  = [{ name: 'Size', values: ['12','13','14','15','16','17'] }];
    const optRingFull  = [
      { name: 'Size', values: ['12','13','14','15','16','17'] },
      { name: 'Tuổi vàng', values: ['Vàng vàng 18K','Vàng trắng 18K','Vàng hồng 18K'] },
    ];
    const optNeck      = [{ name: 'Chiều dài', values: ['40 cm','42 cm','45 cm','50 cm'] }];
    const optBrace     = [{ name: 'Size', values: ['15 cm','16 cm','17 cm','18 cm'] }];
    const optWatchSize = [{ name: 'Mặt kính', values: ['36 mm','40 mm','42 mm'] }];
    const optWatchBand = [
      { name: 'Dây', values: ['Dây da','Dây thép','Dây silicone'] },
    ];
    const optGlassColor = [{ name: 'Màu gọng', values: ['Đen','Nâu tortoise','Bạc','Vàng gold'] }];

    const products = [
      /* ══════════════════════════════
         NHẪN  (6 sản phẩm)
      ══════════════════════════════ */
      {
        name: 'Nhẫn Vàng 18K Đính Đá CZ Hình Hoa',
        slug: 'nhan-vang-18k-cz-hoa',
        description: 'Nhẫn vàng 18K thiết kế hình hoa tinh tế, đính đá CZ sáng lấp lánh. Phù hợp làm quà tặng hoặc đeo hàng ngày. Bảo hành 12 tháng, đi kèm hộp quà cao cấp.',
        materialDetail: 'Vàng 18K (Au 75%), đá CZ nhân tạo loại A+. Bề mặt xi rhodium chống xỉn màu. Bảo quản trong hộp kín, tránh tiếp xúc hoá chất và nước biển.',
        price: 2500000,
        salePrice: 2200000,
        images: [IMG.ring1, IMG.ring2, IMG.ring3],
        category: catRing._id,
        material: 'Vàng 18K',
        gemstone: 'Cubic Zirconia',
        weight: 3.2,
        options: optRingFull,
        variants: makeVariants(optRingFull),
        stock: 0,
        sold: rndSold(),
        tags: ['nhan','vang','18k','cz','hoa','nu'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Nhẫn Đôi Vàng 10K Trơn Khắc Tên',
        slug: 'nhan-doi-vang-10k-tron',
        description: 'Nhẫn đôi vàng 10K thiết kế trơn thanh lịch, có thể khắc tên theo yêu cầu. Ý nghĩa, sang trọng — lựa chọn hoàn hảo cho cặp đôi, kỷ niệm ngày cưới.',
        materialDetail: 'Vàng 10K (Au 41.7%), bề mặt đánh bóng gương. Khắc miễn phí tối đa 20 ký tự (mỗi chiếc). Thời gian sản xuất 5–7 ngày.',
        price: 3800000,
        images: [IMG.ring3, IMG.ring4, IMG.ring2],
        category: catRing._id,
        material: 'Vàng 10K',
        weight: 4.0,
        options: optRingSize,
        variants: makeVariants(optRingSize),
        stock: 0,
        sold: rndSold(),
        tags: ['nhan','vang','10k','doi','khac-ten','cap-doi'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Nhẫn Bạc 925 Đính Đá Moonstone Ánh Xanh',
        slug: 'nhan-bac-925-moonstone',
        description: 'Nhẫn bạc 925 đính đá Moonstone ánh xanh huyền bí. Thiết kế tinh tế, phù hợp phong cách minimalist hoặc boho chic. Đá thật 100%, có giấy chứng nhận.',
        materialDetail: 'Bạc 925 (Ag 92.5%), đá Moonstone tự nhiên. Xi rhodium trắng chống xỉn màu. Vệ sinh bằng khăn bạc chuyên dụng.',
        price: 1200000,
        salePrice: 980000,
        images: [IMG.ring2, IMG.ring1],
        category: catRing._id,
        material: 'Bạc 925',
        gemstone: 'Moonstone',
        weight: 2.8,
        options: optRingSize,
        variants: makeVariants(optRingSize),
        stock: 0,
        sold: rndSold(),
        tags: ['nhan','bac','925','moonstone','boho'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Nhẫn Vàng Trắng 14K Kim Cương Nhân Tạo CVD 0.3ct',
        slug: 'nhan-vang-trang-14k-cvd',
        description: 'Nhẫn vàng trắng 14K đính kim cương nhân tạo CVD 0.3ct. Sáng rực, tinh tế — phù hợp làm nhẫn đính hôn hoặc kỷ niệm. Đi kèm chứng nhận GIA.',
        materialDetail: 'Vàng trắng 14K (Au 58.5%), kim cương CVD 0.3ct độ tinh khiết VS1, màu D-E. Bảo hành vĩnh viễn, sạch rửa miễn phí 6 tháng/lần.',
        price: 7500000,
        salePrice: 6800000,
        images: [IMG.ring4, IMG.ring3, IMG.ring1],
        category: catRing._id,
        material: 'Vàng trắng 14K',
        gemstone: 'Kim cương CVD',
        weight: 3.5,
        options: optRingFull,
        variants: makeVariants(optRingFull),
        stock: 0,
        sold: rndSold(),
        tags: ['nhan','vang-trang','14k','kim-cuong','cvd','dinh-hon'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Nhẫn Vàng Hồng 18K Đính Ruby Đỏ',
        slug: 'nhan-vang-hong-18k-ruby',
        description: 'Nhẫn vàng hồng 18K đính đá Ruby đỏ tự nhiên 0.25ct. Màu sắc rực rỡ, thiết kế nữ tính và quyến rũ.',
        materialDetail: 'Vàng hồng 18K (Au 75% + Cu), đá Ruby tự nhiên 0.25ct độ tinh khiết AAA. Kèm hộp nhung đỏ và giấy chứng nhận đá.',
        price: 5600000,
        images: [IMG.ring5, IMG.ring4, IMG.ring2],
        category: catRing._id,
        material: 'Vàng hồng 18K',
        gemstone: 'Ruby',
        weight: 3.1,
        options: optRingSize,
        variants: makeVariants(optRingSize),
        stock: 0,
        sold: rndSold(),
        tags: ['nhan','vang-hong','18k','ruby','nu-tinh'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Nhẫn Bạc 925 Đá Garnet Tím Phong Cách Vintage',
        slug: 'nhan-bac-925-garnet-vintage',
        description: 'Nhẫn bạc 925 đính đá Garnet tím, phong cách vintage cổ điển. Thiết kế chạm khắc tỉ mỉ, thích hợp đeo cùng trang phục retro hoặc thanh lịch.',
        materialDetail: 'Bạc 925 xi đen cổ điển, đá Garnet tự nhiên. Phong trào vintage trở lại mạnh mẽ, thiết kế này là lựa chọn độc đáo.',
        price: 1450000,
        images: [IMG.ring1, IMG.ring3],
        category: catRing._id,
        material: 'Bạc 925',
        gemstone: 'Garnet',
        weight: 3.0,
        options: optRingSize,
        variants: makeVariants(optRingSize),
        stock: 0,
        sold: rndSold(),
        tags: ['nhan','bac','925','garnet','vintage'],
        isActive: true,
        isFeatured: false,
      },

      /* ══════════════════════════════
         DÂY CHUYỀN  (5 sản phẩm)
      ══════════════════════════════ */
      {
        name: 'Dây Chuyền Vàng 18K Mặt Trái Tim Đính CZ',
        slug: 'day-chuyen-vang-18k-trai-tim',
        description: 'Dây chuyền vàng 18K với mặt trái tim nhỏ nhắn đính đá CZ. Thiết kế thanh thoát, kèm hộp quà sang trọng — món quà ý nghĩa cho người thân yêu.',
        materialDetail: 'Dây vàng 18K kiểu ô rô, mặt dây gắn đá CZ loại A+. Chiều dài có thể chọn 40–50 cm. Bảo hành 12 tháng.',
        price: 3200000,
        salePrice: 2900000,
        images: [IMG.neck1, IMG.neck2, IMG.neck3],
        category: catNecklace._id,
        material: 'Vàng 18K',
        gemstone: 'Cubic Zirconia',
        weight: 4.2,
        options: optNeck,
        variants: makeVariants(optNeck),
        stock: 0,
        sold: rndSold(),
        tags: ['day-chuyen','vang','18k','trai-tim','qua-tang'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Vòng Cổ Bạc 925 Mặt Đồng Xu Vintage',
        slug: 'vong-co-bac-925-dong-xu',
        description: 'Vòng cổ bạc 925 mặt đồng xu khắc họa tiết vintage. Phong cách retro, dễ kết hợp với nhiều trang phục. Cổ điển mà vẫn thời thượng.',
        materialDetail: 'Bạc 925, mặt đồng xu dập nổi họa tiết cổ điển. Dây rolo bạc 925. Tránh tiếp xúc nước hoa và hóa chất tẩy rửa.',
        price: 1500000,
        images: [IMG.neck2, IMG.neck4, IMG.neck3],
        category: catNecklace._id,
        material: 'Bạc 925',
        weight: 5.1,
        options: optNeck,
        variants: makeVariants(optNeck),
        stock: 0,
        sold: rndSold(),
        tags: ['day-chuyen','bac','925','vintage','dong-xu'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Dây Chuyền Vàng 14K Đính Đá Topaz Xanh',
        slug: 'day-chuyen-vang-14k-topaz',
        description: 'Dây chuyền vàng 14K đính đá Topaz xanh thiên nhiên, màu xanh biển trong trẻo. Chứng nhận đá thiên nhiên đi kèm.',
        materialDetail: 'Vàng 14K, đá Blue Topaz thiên nhiên 0.5ct. Dây box chain sang trọng. Kèm hộp da và giấy kiểm định đá.',
        price: 5800000,
        images: [IMG.neck3, IMG.neck1, IMG.neck4],
        category: catNecklace._id,
        material: 'Vàng 14K',
        gemstone: 'Blue Topaz',
        weight: 3.7,
        options: optNeck,
        variants: makeVariants(optNeck),
        stock: 0,
        sold: rndSold(),
        tags: ['day-chuyen','vang','14k','topaz','xanh'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Dây Chuyền Đôi Bạc 925 Khoá Nam Châm',
        slug: 'day-chuyen-doi-bac-925-khoa',
        description: 'Dây chuyền đôi bạc 925 với khoá từ tính độc đáo — khi ghép lại tạo thành trái tim hoàn chỉnh. Biểu tượng tình yêu bất diệt.',
        materialDetail: 'Bạc 925, khoá từ tính thực dụng và lãng mạn. Bán theo cặp (2 dây). Giao trong hộp đôi sang trọng.',
        price: 2800000,
        images: [IMG.neck4, IMG.neck2],
        category: catNecklace._id,
        material: 'Bạc 925',
        weight: 7.5,
        options: optNeck,
        variants: makeVariants(optNeck),
        stock: 0,
        sold: rndSold(),
        tags: ['day-chuyen','bac','925','doi','trai-tim','cap-doi'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Dây Chuyền Vàng 18K Mặt Phật A Di Đà',
        slug: 'day-chuyen-vang-18k-phat',
        description: 'Dây chuyền vàng 18K mặt Phật A Di Đà chạm khắc tỉ mỉ. Ý nghĩa tâm linh sâu sắc, bảo hộ bình an cho người đeo.',
        materialDetail: 'Vàng 18K đúc đặc, mặt dây chạm khắc thủ công. Trọng lượng 4.5–6 chỉ tùy kích thước. Kèm hộp nhung đỏ.',
        price: 8500000,
        images: [IMG.neck1, IMG.neck3],
        category: catNecklace._id,
        material: 'Vàng 18K',
        weight: 6.0,
        options: [{ name: 'Kích thước mặt', values: ['Nhỏ (2 cm)','Vừa (3 cm)','Lớn (4 cm)'] }],
        variants: makeVariants([{ name: 'Kích thước mặt', values: ['Nhỏ (2 cm)','Vừa (3 cm)','Lớn (4 cm)'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['day-chuyen','vang','18k','phat','tam-linh'],
        isActive: true,
        isFeatured: false,
      },

      /* ══════════════════════════════
         BÔNG TAI  (5 sản phẩm)
      ══════════════════════════════ */
      {
        name: 'Bông Tai Vàng 18K Đính Moissanite 4mm',
        slug: 'bong-tai-vang-18k-moissanite',
        description: 'Bông tai vàng 18K đính đá Moissanite 4mm, độ lấp lánh vượt cả kim cương. Thiết kế hình tròn cổ điển, phù hợp từ thường ngày đến dạ tiệc.',
        materialDetail: 'Vàng 18K, đá Moissanite 4mm (0.25ct) độ sáng VVS1, màu D. Khóa bướm chắc chắn. Bảo hành vĩnh viễn cho đá.',
        price: 4800000,
        salePrice: 4200000,
        images: [IMG.ear1, IMG.ear2, IMG.ear3],
        category: catEarring._id,
        material: 'Vàng 18K',
        gemstone: 'Moissanite',
        weight: 1.8,
        options: [],
        variants: [],
        stock: 18,
        sold: rndSold(),
        tags: ['bong-tai','vang','18k','moissanite','da-tiec'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Khuyên Tai Bạc 925 Ngọc Trai Nước Ngọt 7mm',
        slug: 'khuyen-tai-bac-925-ngoc-trai',
        description: 'Khuyên tai bạc 925 gắn ngọc trai nước ngọt tự nhiên 7–8mm. Thanh lịch, sang trọng, phù hợp với váy công sở hoặc đầm dạ tiệc.',
        materialDetail: 'Bạc 925 xi trắng, ngọc trai nước ngọt tự nhiên AAAA 7–8mm. Mỗi viên ngọc đều qua kiểm định. Giao trong hộp nhung trắng.',
        price: 2200000,
        images: [IMG.ear2, IMG.ear1],
        category: catEarring._id,
        material: 'Bạc 925',
        gemstone: 'Ngọc trai nước ngọt',
        weight: 2.2,
        options: [],
        variants: [],
        stock: 22,
        sold: rndSold(),
        tags: ['bong-tai','bac','925','ngoc-trai','thanh-lich'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Bông Tai Vàng Hồng 14K Thả Dài Đá Ruby',
        slug: 'bong-tai-vang-hong-14k-ruby',
        description: 'Bông tai thả dài vàng hồng 14K đính đá Ruby đỏ tự nhiên. Nổi bật, quyến rũ — lý tưởng cho buổi tối đặc biệt hoặc tiệc cưới.',
        materialDetail: 'Vàng hồng 14K, đá Ruby Mozambique tự nhiên 0.3ct mỗi viên. Dài 4 cm. Kèm hộp da hồng và túi nhung.',
        price: 6500000,
        images: [IMG.ear1, IMG.ear3, IMG.ear2],
        category: catEarring._id,
        material: 'Vàng hồng 14K',
        gemstone: 'Ruby',
        weight: 2.5,
        options: [],
        variants: [],
        stock: 8,
        sold: rndSold(),
        tags: ['bong-tai','vang-hong','14k','ruby','tha-dai','tiec-cuoi'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Hoa Tai Bạc 925 Hình Ngôi Sao Đính CZ',
        slug: 'hoa-tai-bac-925-ngoi-sao',
        description: 'Hoa tai bạc 925 hình ngôi sao 5 cánh đính đá CZ nhỏ xinh lấp lánh. Nhẹ nhàng, phù hợp đeo hàng ngày hay đi chơi cuối tuần.',
        materialDetail: 'Bạc 925, đá CZ nhân tạo. Khóa bướm. Thích hợp lỗ tai chuẩn 0.8mm.',
        price: 650000,
        images: [IMG.ear3, IMG.ear2],
        category: catEarring._id,
        material: 'Bạc 925',
        gemstone: 'Cubic Zirconia',
        weight: 1.0,
        options: [],
        variants: [],
        stock: 40,
        sold: rndSold(),
        tags: ['bong-tai','bac','925','ngoi-sao','cz','hang-ngay'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Khuyên Tai Vàng 18K Hình Tròn Cổ Điển',
        slug: 'khuyen-tai-vang-18k-tron',
        description: 'Khuyên tai hoop vàng 18K hình tròn cổ điển, đường kính 15mm. Thiết kế bất hủ, không bao giờ lỗi mốt.',
        materialDetail: 'Vàng 18K ống tròn đặc, đường kính 15mm. Khóa snap nhấn tiện lợi. Bảo hành 12 tháng.',
        price: 3600000,
        images: [IMG.ear1, IMG.ear2, IMG.ear3],
        category: catEarring._id,
        material: 'Vàng 18K',
        weight: 2.0,
        options: [{ name: 'Đường kính', values: ['12 mm','15 mm','20 mm'] }],
        variants: makeVariants([{ name: 'Đường kính', values: ['12 mm','15 mm','20 mm'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['bong-tai','vang','18k','hoop','co-dien'],
        isActive: true,
        isFeatured: true,
      },

      /* ══════════════════════════════
         LẮC TAY  (4 sản phẩm)
      ══════════════════════════════ */
      {
        name: 'Lắc Tay Vàng 18K Dạng Dây Xoắn',
        slug: 'lac-tay-vang-18k-day-xoan',
        description: 'Lắc tay vàng 18K thiết kế dây xoắn tinh tế, độ dày vừa phải. Phong cách hiện đại, dễ kết hợp với đồng hồ hoặc vòng charm.',
        materialDetail: 'Vàng 18K dây xoắn 3 sợi, độ dày 3mm. Khóa cài bướm chắc chắn. Bảo hành 12 tháng.',
        price: 4500000,
        salePrice: 3900000,
        images: [IMG.brace1, IMG.brace2, IMG.brace3],
        category: catBracelet._id,
        material: 'Vàng 18K',
        weight: 5.8,
        options: optBrace,
        variants: makeVariants(optBrace),
        stock: 0,
        sold: rndSold(),
        tags: ['lac-tay','vang','18k','xoan','hien-dai'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Lắc Tay Bạc 925 Charm Trái Tim',
        slug: 'lac-tay-bac-925-charm',
        description: 'Lắc tay bạc 925 với charm trái tim nhỏ xinh. Thiết kế tinh tế, nhẹ nhàng — món quà lý tưởng cho người thân yêu.',
        materialDetail: 'Dây rolo bạc 925, charm trái tim đính đá CZ. Có thể thêm charm theo yêu cầu. Kèm túi nhung và thiệp.',
        price: 1800000,
        images: [IMG.brace2, IMG.brace1],
        category: catBracelet._id,
        material: 'Bạc 925',
        weight: 4.2,
        options: optBrace,
        variants: makeVariants(optBrace),
        stock: 0,
        sold: rndSold(),
        tags: ['lac-tay','bac','925','charm','trai-tim','qua-tang'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Lắc Tay Bạch Kim Đính Kim Cương 0.5ct',
        slug: 'lac-tay-bach-kim-kim-cuong',
        description: 'Lắc tay bạch kim Pt950 đính hàng kim cương nhỏ 0.5ct tổng. Sang trọng cực độ, dành cho những dịp đặc biệt nhất.',
        materialDetail: 'Bạch kim Pt950 (95% Platinum), kim cương thiên nhiên 0.5ct tổng, màu G-H, độ tinh khiết SI1. Kèm chứng nhận GIA.',
        price: 28000000,
        images: [IMG.brace3, IMG.brace1, IMG.brace2],
        category: catBracelet._id,
        material: 'Bạch kim 950',
        gemstone: 'Kim cương',
        weight: 8.5,
        options: optBrace,
        variants: makeVariants(optBrace),
        stock: 0,
        sold: Math.floor(Math.random() * 10) + 1,
        tags: ['lac-tay','bach-kim','kim-cuong','luxury','cao-cap'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Vòng Tay Đá Tự Nhiên Phong Thủy Mix 7 Đá',
        slug: 'vong-tay-da-tu-nhien-phong-thuy',
        description: 'Vòng tay đá tự nhiên mix 7 loại đá phong thủy: Thạch anh hồng, Mắt hổ, Obsidian, Malachite, Lapis Lazuli, Amethyst, Moonstone. Kích thước hạt 8mm.',
        materialDetail: '7 loại đá tự nhiên 100%, hạt 8mm, dây thun đàn hồi. Phong thủy 5 hành, tăng may mắn và bảo hộ.',
        price: 850000,
        images: [IMG.brace1, IMG.brace3],
        category: catBracelet._id,
        material: 'Đá tự nhiên',
        weight: 18.0,
        options: [{ name: 'Chu vi', values: ['16 cm','17 cm','18 cm','19 cm','20 cm'] }],
        variants: makeVariants([{ name: 'Chu vi', values: ['16 cm','17 cm','18 cm','19 cm','20 cm'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['lac-tay','da-tu-nhien','phong-thuy','mix','7-da'],
        isActive: true,
        isFeatured: false,
      },

      /* ══════════════════════════════
         ĐỒNG HỒ NAM  (4 sản phẩm)
      ══════════════════════════════ */
      {
        name: 'Đồng Hồ Nam Cơ Tự Động Lộ Máy Skeleton',
        slug: 'dong-ho-nam-co-tu-dong-skeleton',
        description: 'Đồng hồ nam cơ tự động với mặt kính lộ máy (skeleton), nhìn thấy toàn bộ bộ máy đang chuyển động. Mặt kính Sapphire chống xước, chống nước 50m.',
        materialDetail: 'Vỏ thép không gỉ 316L, kính Sapphire, bộ máy NH35A tự động. Dây da hoặc thép. Bảo hành 2 năm.',
        price: 8500000,
        salePrice: 7200000,
        images: [IMG.watchM1, IMG.watchM2, IMG.watchM3],
        category: catWatchMen._id,
        material: 'Thép không gỉ 316L',
        weight: 120,
        options: optWatchBand,
        variants: makeVariants(optWatchBand),
        stock: 0,
        sold: rndSold(),
        tags: ['dong-ho','nam','co','tu-dong','skeleton','sapphire'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Đồng Hồ Nam Điện Tử Thể Thao GPS Đa Chức Năng',
        slug: 'dong-ho-nam-gps-the-thao',
        description: 'Đồng hồ nam điện tử thể thao tích hợp GPS, đo nhịp tim, SpO2, đo quãng đường. Pin 7 ngày, chống nước 100m. Phù hợp chạy bộ, leo núi, bơi lội.',
        materialDetail: 'Vỏ polymer cao cấp + nhôm, dây silicone cao su, kính khoáng cứng. Kết nối Bluetooth 5.0. Tương thích iOS & Android.',
        price: 5900000,
        images: [IMG.watchM2, IMG.watchM4, IMG.watchM1],
        category: catWatchMen._id,
        material: 'Nhôm + Polymer',
        weight: 85,
        options: [{ name: 'Màu dây', values: ['Đen','Xanh rêu','Cam','Xám'] }],
        variants: makeVariants([{ name: 'Màu dây', values: ['Đen','Xanh rêu','Cam','Xám'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['dong-ho','nam','the-thao','gps','smart','chong-nuoc'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Đồng Hồ Nam Dây Da Mặt Số La Mã Cổ Điển',
        slug: 'dong-ho-nam-day-da-so-la-ma',
        description: 'Đồng hồ nam quartz dây da thật, mặt số La Mã sang trọng và cổ điển. Thiết kế vượt thời gian, phù hợp với bộ vest hay trang phục lịch sự.',
        materialDetail: 'Vỏ thép mạ vàng, kính Mineral chống xước, dây da bò thật nâu đen. Bộ máy Miyota quartz Nhật. Bảo hành 1 năm.',
        price: 2800000,
        images: [IMG.watchM3, IMG.watchM1],
        category: catWatchMen._id,
        material: 'Thép mạ vàng + Da bò',
        weight: 95,
        options: [{ name: 'Màu mặt', values: ['Trắng ngà','Đen','Xanh navy'] }],
        variants: makeVariants([{ name: 'Màu mặt', values: ['Trắng ngà','Đen','Xanh navy'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['dong-ho','nam','day-da','so-la-ma','co-dien','lich-su'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Đồng Hồ Nam Mạ Vàng PVD Lịch Ngày',
        slug: 'dong-ho-nam-ma-vang-pvd',
        description: 'Đồng hồ nam mạ vàng PVD bền đẹp, dây thép mesh vàng, hiển thị lịch ngày. Phong cách sang trọng, phù hợp đi làm hay dự tiệc.',
        materialDetail: 'Thép không gỉ mạ vàng PVD (Physical Vapor Deposition) siêu bền. Dây mesh vàng điều chỉnh kích thước tự do. Máy quartz cao cấp.',
        price: 4200000,
        images: [IMG.watchM4, IMG.watchM2, IMG.watchM3],
        category: catWatchMen._id,
        material: 'Thép mạ vàng PVD',
        weight: 110,
        options: optWatchSize,
        variants: makeVariants(optWatchSize),
        stock: 0,
        sold: rndSold(),
        tags: ['dong-ho','nam','ma-vang','pvd','lich-ngay','sang-trong'],
        isActive: true,
        isFeatured: false,
      },

      /* ══════════════════════════════
         ĐỒNG HỒ NỮ  (3 sản phẩm)
      ══════════════════════════════ */
      {
        name: 'Đồng Hồ Nữ Vàng Hồng Đính Đá Pha Lê Swarovski',
        slug: 'dong-ho-nu-vang-hong-pha-le',
        description: 'Đồng hồ nữ dây thép mạ vàng hồng, mặt đính đá pha lê Swarovski lấp lánh. Thiết kế thanh lịch và nữ tính, hoàn hảo cho mọi dịp.',
        materialDetail: 'Thép mạ vàng hồng PVD, đá pha lê Swarovski 32 viên quanh viền. Dây thép liên kết. Máy quartz Ronda Thụy Sĩ. Bảo hành 2 năm.',
        price: 6800000,
        salePrice: 5900000,
        images: [IMG.watchF1, IMG.watchF2, IMG.watchF3],
        category: catWatchWomen._id,
        material: 'Thép mạ vàng hồng PVD',
        gemstone: 'Pha lê Swarovski',
        weight: 80,
        options: [{ name: 'Màu mặt', values: ['Trắng xà cừ','Hồng phấn','Bạc ánh kim'] }],
        variants: makeVariants([{ name: 'Màu mặt', values: ['Trắng xà cừ','Hồng phấn','Bạc ánh kim'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['dong-ho','nu','vang-hong','pha-le','swarovski','da-tiec'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Đồng Hồ Nữ Dây Da Nhỏ Nhắn Vintage',
        slug: 'dong-ho-nu-day-da-vintage',
        description: 'Đồng hồ nữ dây da nhỏ nhắn, mặt nhỏ 28mm phong cách vintage. Thanh lịch, nhẹ nhàng và tinh tế — người phụ nữ hiện đại của mọi thời đại.',
        materialDetail: 'Vỏ thép không gỉ mạ bạc, dây da thật màu be/nâu. Máy quartz. Chống nước 3ATM.',
        price: 2200000,
        images: [IMG.watchF2, IMG.watchF1],
        category: catWatchWomen._id,
        material: 'Thép + Da bò',
        weight: 55,
        options: [{ name: 'Màu dây', values: ['Da be','Da nâu','Da đen','Da đỏ đô'] }],
        variants: makeVariants([{ name: 'Màu dây', values: ['Da be','Da nâu','Da đen','Da đỏ đô'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['dong-ho','nu','vintage','day-da','nho-nhan'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Đồng Hồ Nữ Smart Watch Sức Khoẻ & Thời Trang',
        slug: 'dong-ho-nu-smart-watch',
        description: 'Đồng hồ thông minh nữ thiết kế thời trang, theo dõi sức khoẻ, nhịp tim, chu kỳ kinh nguyệt, thông báo tin nhắn. Nhiều màu dây thay thế.',
        materialDetail: 'Vỏ hợp kim nhôm, mặt AMOLED 1.43 inch, dây silicone cao cấp. Pin 5 ngày, sạc không dây. Chống nước 5ATM.',
        price: 3500000,
        images: [IMG.watchF3, IMG.watchF2, IMG.watchF1],
        category: catWatchWomen._id,
        material: 'Nhôm + Silicone',
        weight: 35,
        options: [{ name: 'Màu dây', values: ['Trắng sữa','Hồng pastel','Tím lilac','Đen','Xanh mint'] }],
        variants: makeVariants([{ name: 'Màu dây', values: ['Trắng sữa','Hồng pastel','Tím lilac','Đen','Xanh mint'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['dong-ho','nu','smart','suc-khoe','thoi-trang','amoled'],
        isActive: true,
        isFeatured: true,
      },

      /* ══════════════════════════════
         ĐỒNG HỒ ĐÔI  (2 sản phẩm)
      ══════════════════════════════ */
      {
        name: 'Đồng Hồ Đôi Thép Không Gỉ Mặt Trơn Tối Giản',
        slug: 'dong-ho-doi-thep-mat-tron',
        description: 'Cặp đồng hồ đôi thép không gỉ mặt trơn tối giản. Thiết kế đồng điệu, phong cách minimalist tinh tế cho cặp đôi hiện đại. Bán theo cặp.',
        materialDetail: 'Thép 316L, kính Sapphire Crystal, máy quartz Miyota. Nam 40mm, Nữ 34mm. Bảo hành 2 năm cho cả cặp.',
        price: 9800000,
        salePrice: 8500000,
        images: [IMG.watchM2, IMG.watchF1, IMG.watchM1],
        category: catWatchCouple._id,
        material: 'Thép không gỉ 316L',
        weight: 200,
        options: [{ name: 'Màu vỏ', values: ['Bạc','Đen gunmetal','Vàng gold'] }],
        variants: makeVariants([{ name: 'Màu vỏ', values: ['Bạc','Đen gunmetal','Vàng gold'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['dong-ho','doi','thep','toi-gian','cap-doi','qua-tang'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Đồng Hồ Đôi Dây Da Lịch Ngày Tình Nhân',
        slug: 'dong-ho-doi-day-da-tinh-nhan',
        description: 'Cặp đồng hồ đôi dây da thật lịch ngày, thiết kế lãng mạn cho ngày Valentine hay kỷ niệm. Đi kèm hộp quà đôi và thiệp chúc mừng.',
        materialDetail: 'Thép mạ vàng, dây da bò thật. Nam 42mm, Nữ 36mm. Máy quartz. Kèm hộp đôi cao cấp và túi đựng.',
        price: 6200000,
        images: [IMG.watchM3, IMG.watchF2],
        category: catWatchCouple._id,
        material: 'Thép mạ vàng + Da bò',
        weight: 160,
        options: [],
        variants: [],
        stock: 15,
        sold: rndSold(),
        tags: ['dong-ho','doi','day-da','valentine','tinh-nhan','qua-tang'],
        isActive: true,
        isFeatured: false,
      },

      /* ══════════════════════════════
         KÍNH MẮT  (3 sản phẩm)
      ══════════════════════════════ */
      {
        name: 'Kính Mát Phân Cực Chống UV400 Gọng Titan',
        slug: 'kinh-mat-phan-cuc-chong-uv400-titan',
        description: 'Kính mát gọng titan siêu nhẹ chỉ 12g, tròng phân cực chống UV400, chống chói ánh nắng. Phù hợp lái xe, đi biển, hoạt động ngoài trời.',
        materialDetail: 'Gọng titan nguyên chất (không gỉ, không dị ứng), tròng PC polarized UV400. Kèm hộp cứng và khăn lau microfiber.',
        price: 1850000,
        salePrice: 1500000,
        images: [IMG.glass1, IMG.glass2, IMG.glass3],
        category: catGlasses._id,
        material: 'Titan',
        weight: 12,
        options: optGlassColor,
        variants: makeVariants(optGlassColor),
        stock: 0,
        sold: rndSold(),
        tags: ['kinh-mat','phan-cuc','uv400','titan','the-thao'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Kính Mát Gọng Acetate Dày Dáng Vuông Thời Trang',
        slug: 'kinh-mat-acetate-vuong-thoi-trang',
        description: 'Kính mát acetate dày dáng vuông oversize theo trend hiện đại. Tròng gradient tự nhiên, gọng màu tortoise nâu vân độc đáo.',
        materialDetail: 'Gọng acetate Italy cao cấp, tròng chống UV380. Nhiều màu gọng thời trang. Kèm túi da và khăn lau.',
        price: 1200000,
        images: [IMG.glass2, IMG.glass1],
        category: catGlasses._id,
        material: 'Acetate Italy',
        weight: 28,
        options: [{ name: 'Màu gọng', values: ['Tortoise nâu','Đen bóng','Trong suốt','Xanh dương'] }],
        variants: makeVariants([{ name: 'Màu gọng', values: ['Tortoise nâu','Đen bóng','Trong suốt','Xanh dương'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['kinh-mat','acetate','vuong','oversize','thoi-trang'],
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Gọng Kính Cận Titan Oval Siêu Nhẹ Unisex',
        slug: 'gong-kinh-can-titan-oval',
        description: 'Gọng kính cận titan hình oval siêu nhẹ 8g, unisex nam nữ đều đeo đẹp. Thiết kế tối giản, phù hợp với mọi dáng mặt.',
        materialDetail: 'Titan nguyên chất 100%, không chứa niken. Trọng lượng chỉ 8g. Không bao gồm tròng (mang đến tiệm cắt). Bảo hành 2 năm cho gọng.',
        price: 980000,
        images: [IMG.glass3, IMG.glass2, IMG.glass1],
        category: catGlasses._id,
        material: 'Titan',
        weight: 8,
        options: [{ name: 'Màu gọng', values: ['Bạc','Vàng gold','Đen mờ','Đồng bronze'] }],
        variants: makeVariants([{ name: 'Màu gọng', values: ['Bạc','Vàng gold','Đen mờ','Đồng bronze'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['gong-kinh','can','titan','oval','unisex','sieu-nhe'],
        isActive: true,
        isFeatured: false,
      },

      /* ══════════════════════════════
         VÍ & TÚI  (3 sản phẩm)
      ══════════════════════════════ */
      {
        name: 'Ví Da Thật Bò Italy Dáng Đứng RFID Chống Quét',
        slug: 'vi-da-that-bo-italy-rfid',
        description: 'Ví da bò Italy full-grain cao cấp, ngăn RFID chống quét thẻ từ xa, 8 ngăn thẻ, ngăn tiền mặt rộng. Được khắc tên miễn phí theo yêu cầu.',
        materialDetail: 'Da bò Italy full-grain thuộc tannin thực vật (vegetable tanned), dày 1.8mm. Màu đậm đẹp theo thời gian. Kèm hộp giấy và túi vải.',
        price: 1650000,
        salePrice: 1350000,
        images: [IMG.wallet1, IMG.wallet2],
        category: catWallet._id,
        material: 'Da bò Italy',
        weight: 95,
        options: [{ name: 'Màu da', values: ['Nâu đất','Đen cổ điển','Caramel','Xanh navy'] }],
        variants: makeVariants([{ name: 'Màu da', values: ['Nâu đất','Đen cổ điển','Caramel','Xanh navy'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['vi','da-that','italy','rfid','khac-ten','nam'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Túi Đeo Chéo Da PU Nữ Khóa Vàng Mini Bag',
        slug: 'tui-deo-cheo-pu-nu-mini-bag',
        description: 'Túi đeo chéo da PU nữ thiết kế mini bag thanh lịch, khoá vàng sang trọng. Đủ đựng điện thoại, ví, son và chìa khoá. Dây đeo điều chỉnh được.',
        materialDetail: 'Da PU cao cấp dày 0.8mm, lót vải, khóa kim loại mạ vàng. Kích thước 18×12×6 cm. Có thể đeo vai hoặc đeo chéo.',
        price: 890000,
        images: [IMG.wallet2, IMG.wallet1],
        category: catWallet._id,
        material: 'Da PU',
        weight: 350,
        options: [{ name: 'Màu túi', values: ['Đen','Nâu caramel','Kem beige','Đỏ rượu vang','Xanh cobalt'] }],
        variants: makeVariants([{ name: 'Màu túi', values: ['Đen','Nâu caramel','Kem beige','Đỏ rượu vang','Xanh cobalt'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['tui','deo-cheo','pu','nu','mini-bag','khoa-vang'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Ví Card Holder Siêu Mỏng Da Thật Minimalist',
        slug: 'vi-card-holder-da-that-minimalist',
        description: 'Ví card holder siêu mỏng 5mm chỉ chứa essentials: 4–6 thẻ + tiền mặt gấp gọn. Phong cách minimalist dành cho người yêu sự gọn nhẹ.',
        materialDetail: 'Da bò full-grain, co giãn tốt sau 2–3 tuần sử dụng. Không keo, không may — kết cấu duy nhất bằng da. Made in Vietnam.',
        price: 550000,
        images: [IMG.wallet1, IMG.wallet2],
        category: catWallet._id,
        material: 'Da bò',
        weight: 35,
        options: [{ name: 'Màu da', values: ['Đen','Nâu đất','Xanh rêu','Đỏ cherry'] }],
        variants: makeVariants([{ name: 'Màu da', values: ['Đen','Nâu đất','Xanh rêu','Đỏ cherry'] }]),
        stock: 0,
        sold: rndSold(),
        tags: ['vi','card-holder','da-that','minimalist','mong','nam-nu'],
        isActive: true,
        isFeatured: false,
      },
    ];

    /* Tính stock từ variants */
    const productsWithStock = products.map((p) => {
      if (p.variants && p.variants.length > 0) {
        const totalStock = p.variants.reduce((s, v) => s + (v.stock || 0), 0);
        return { ...p, stock: totalStock };
      }
      return p;
    });

    await Product.insertMany(productsWithStock);
    console.log(`📦  Products created (${products.length}).`);

    /* ════════════════════════════════════════════════
       BANNERS
    ════════════════════════════════════════════════ */
    await Banner.insertMany([
      {
        title: 'Trang Sức Vàng 18K — Sale Đến 30%',
        image: IMG.banner1,
        link: '/shop?industry=trang-suc',
        position: 'hero',
        isActive: true,
        order: 1,
      },
      {
        title: 'Đồng Hồ Mới 2025 — Thanh Lịch & Đẳng Cấp',
        image: IMG.banner3,
        link: '/shop?industry=dong-ho',
        position: 'hero',
        isActive: true,
        order: 2,
      },
      {
        title: 'Nhẫn Đôi — Khắc Tên Theo Yêu Cầu',
        image: IMG.banner4,
        link: '/shop?category=nhan',
        position: 'hero',
        isActive: true,
        order: 3,
      },
      {
        title: 'Kính Mát & Phụ Kiện Hè 2025',
        image: IMG.banner5,
        link: '/shop?industry=phu-kien',
        position: 'hero',
        isActive: true,
        order: 4,
      },
      {
        title: 'Ưu Đãi Cuối Tuần — Giảm Đến 20%',
        image: IMG.banner2,
        link: '/shop',
        position: 'hero',
        isActive: true,
        order: 5,
      },
    ]);
    console.log('🖼  Banners created (5).');

    /* ════════════════════════════════════════════════
       SUMMARY
    ════════════════════════════════════════════════ */
    console.log('\n✅  Seed hoàn tất!');
    console.log('══════════════════════════════════════════');
    console.log('🔑  Admin   : admin@jewelry.com  / 123456');
    console.log('🔑  Khách   : linh@example.com   / 123456');
    console.log('──────────────────────────────────────────');
    console.log('🏭  Ngành   : 3  (Trang Sức, Đồng Hồ, Phụ Kiện)');
    console.log('📂  Danh mục: 9  (4 trang sức + 3 đồng hồ + 2 phụ kiện)');
    console.log(`📦  Sản phẩm: ${products.length} (đều có variants)`);
    console.log('🖼  Banner  : 5');
    console.log('══════════════════════════════════════════');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
