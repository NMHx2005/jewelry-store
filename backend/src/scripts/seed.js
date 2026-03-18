import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    // Clear existing data (optional, for dev only)
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Banner.deleteMany({}),
    ]);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@jewelry.com',
      password: '123456',
      role: 'admin',
      isActive: true,
    });

    const user = await User.create({
      name: 'Khách hàng',
      email: 'customer@jewelry.com',
      password: '123456',
      role: 'user',
      isActive: true,
    });

    const categories = await Category.insertMany([
      { name: 'Nhẫn', slug: 'nhan', level: 1, isActive: true },
      { name: 'Vòng cổ', slug: 'vong-co', level: 1, isActive: true },
      { name: 'Bông tai', slug: 'bong-tai', level: 1, isActive: true },
      { name: 'Lắc tay', slug: 'lac-tay', level: 1, isActive: true },
    ]);

    const [ringCat, necklaceCat, earringCat, braceletCat] = categories;

    const imageRing =
      'https://images.pexels.com/photos/1158438/pexels-photo-1158438.jpeg?auto=compress&cs=tinysrgb&w=1200';
    const imageNecklace =
      'https://images.pexels.com/photos/261856/pexels-photo-261856.jpeg?auto=compress&cs=tinysrgb&w=1200';
    const imageEarring =
      'https://images.pexels.com/photos/1156989/pexels-photo-1156989.jpeg?auto=compress&cs=tinysrgb&w=1200';
    const imageBracelet =
      'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1200';

    await Product.insertMany([
      {
        name: 'Nhẫn vàng 18K đính đá CZ',
        slug: 'nhan-vang-18k-cz',
        description:
          'Thiết kế tối giản với đá CZ sáng, phù hợp đeo hàng ngày hoặc làm quà tặng.',
        price: 2500000,
        salePrice: 2200000,
        images: [imageRing],
        category: ringCat._id,
        material: 'gold',
        gemstone: 'Cubic Zirconia',
        weight: 3.2,
        size: ['6', '7', '8'],
        stock: 15,
        tags: ['nhan', 'vang', '18k', 'cz'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Vòng cổ bạc 925 đính đá trắng',
        slug: 'vong-co-bac-925',
        description: 'Vòng cổ bạc 925 với mặt đá trắng, phong cách thanh lịch, dễ phối đồ.',
        price: 1800000,
        images: [imageNecklace],
        category: necklaceCat._id,
        material: 'silver',
        gemstone: 'CZ',
        weight: 4.5,
        stock: 20,
        tags: ['vong-co', 'bac', '925'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Bông tai vàng trắng 14K đính Moissanite',
        slug: 'bong-tai-vang-trang-14k-moissanite',
        description:
          'Bông tai vàng trắng 14K đính Moissanite, độ lấp lánh cao, phù hợp dạ tiệc.',
        price: 5200000,
        images: [imageEarring],
        category: earringCat._id,
        material: 'platinum',
        gemstone: 'Moissanite',
        weight: 2.1,
        stock: 8,
        tags: ['bong-tai', 'vang-trang', 'moissanite'],
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Lắc tay bạc 925 dạng dây mảnh',
        slug: 'lac-tay-bac-925-day-manh',
        description: 'Lắc tay bạc 925 thiết kế mảnh, dễ kết hợp với đồng hồ hoặc vòng charm.',
        price: 1600000,
        images: [imageBracelet],
        category: braceletCat._id,
        material: 'silver',
        weight: 3.8,
        stock: 18,
        tags: ['lac-tay', 'bac', '925'],
        isActive: true,
        isFeatured: false,
      },
    ]);

    await Banner.insertMany([
      {
        title: 'Tháng của nàng',
        image: imageRing,
        link: '/shop',
        position: 'hero',
        isActive: true,
        order: 1,
      },
      {
        title: 'Ưu đãi nhẫn cưới',
        image: imageNecklace,
        link: '/shop?category=nhan',
        position: 'hero',
        isActive: true,
        order: 2,
      },
      {
        title: 'Bộ sưu tập vòng cổ mới',
        image: imageNecklace,
        link: '/shop?category=vong-co',
        position: 'hero',
        isActive: true,
        order: 3,
      },
    ]);

    // eslint-disable-next-line no-console
    console.log('Seed data completed.');
    // eslint-disable-next-line no-console
    console.log('Admin account: admin@jewelry.com / 123456');
    // eslint-disable-next-line no-console
    console.log('Customer account: customer@jewelry.com / 123456');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Seed error', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();

