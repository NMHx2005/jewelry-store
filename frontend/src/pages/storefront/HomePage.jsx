import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { fetchBanners, fetchIndustries, fetchFeaturedProducts } from '../../services/productService.js';
import ProductCard from '../../components/product/ProductCard.jsx';

const HomePage = () => {
  const { data: bannersRes } = useQuery({
    queryKey: ['banners'],
    queryFn: fetchBanners,
  });

  const { data: industriesRes } = useQuery({
    queryKey: ['industries'],
    queryFn: () => fetchIndustries(),
  });

  const { data: featuredRes } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: fetchFeaturedProducts,
  });

  const banners = bannersRes?.data?.data || [];
  const industries = (industriesRes?.data?.data || []).slice(0, 4);
  const featured = featuredRes?.data?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      {/* Hero: full-width banner slider (image only) */}
      <section className="mb-10 -mx-4 md:-mx-8 lg:-mx-16">
        <div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2">
          <div className="overflow-hidden">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop
              pagination={{ clickable: true }}
              className="h-[420px] md:h-[520px]"
            >
              {(banners.length
                ? banners
                : [
                  {
                    title: 'Tháng của nàng',
                    subtitle: 'Ưu đãi trang sức dành riêng cho bạn',
                    image: '',
                    link: '/shop',
                  },
                ]
              ).map((banner, index) => (
                <SwiperSlide key={banner._id || `${banner.title}-${index}`}>
                  <div className="relative h-full w-full overflow-hidden">
                    {banner.image ? (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="h-full w-full object-cover transition-transform duration-[2500ms] ease-out swiper-slide-active:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-amber-100 via-white to-slate-50" />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Featured industries */}
      <section id="collections" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Ngành hàng nổi bật
          </h2>
          <a href="/shop" className="text-[11px] text-slate-500 hover:text-amber-600 transition-colors">
            Xem tất cả
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {industries.map((ind) => (
            <a
              key={ind._id}
              href={`/shop?industry=${ind.slug}`}
              className="group relative rounded-2xl border border-slate-100 bg-white overflow-hidden hover:border-amber-200 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              {/* Ảnh ngành */}
              <div className="h-36 overflow-hidden bg-slate-100">
                {ind.image ? (
                  <img
                    src={ind.image}
                    alt={ind.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-amber-50 to-slate-100 flex items-center justify-center">
                    <span className="text-4xl text-amber-200">◈</span>
                  </div>
                )}
              </div>

              {/* Tên + mô tả */}
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {ind.name}
                </p>
                {ind.description && (
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {ind.description}
                  </p>
                )}
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                  Khám phá <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            SALE
          </h2>
          <a href="/shop" className="text-[11px] text-slate-500 hover:text-amber-600">
            Xem tất cả
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* Promotion & testimonials */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-slate-50 px-6 py-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-600 mb-2">
              Cam kết của chúng tôi
            </p>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Trang sức — Không chỉ là món đồ
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mỗi sản phẩm được chọn lọc kỹ lưỡng từ những chất liệu cao cấp, được chế tác tỉ mỉ để
              trở thành vật kỷ niệm đồng hành cùng bạn suốt cuộc đời.
            </p>
          </div>
          <ul className="mt-5 text-[11px] text-slate-500 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Chất liệu vàng, bạc, bạch kim chuẩn kiểm định
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Đóng gói sang trọng — sẵn sàng làm quà tặng
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Bảo hành & hỗ trợ làm sạch tận tâm
            </li>
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white px-6 py-6 shadow-sm space-y-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Cảm nhận khách hàng</p>
          <div className="space-y-3 text-xs text-slate-600">
            <p>
              “Trang sức tinh tế, cầm trên tay cảm nhận rõ độ hoàn thiện. Đóng gói rất đẹp, phù hợp
              làm quà tặng.”
            </p>
            <p className="text-[11px] text-slate-500">— Minh Anh, HCM</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

