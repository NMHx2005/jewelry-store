import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProductBySlug, fetchProducts } from '../../services/productService.js';
import useCartStore from '../../store/cartStore.js';
import ProductCard from '../../components/product/ProductCard.jsx';

const tabs = [
  { id: 'description', label: 'Mô tả' },
  { id: 'material', label: 'Chất liệu' },
  { id: 'reviews', label: 'Đánh giá' },
];

const ProductDetailPage = () => {
  const { slug } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { data: productRes, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  const product = productRes?.data?.data;

  const { data: relatedRes } = useQuery({
    queryKey: ['relatedProducts', product?.category?._id],
    queryFn: () =>
      fetchProducts({
        category: product?.category?.slug,
        limit: 4,
      }),
    enabled: !!product?.category?.slug,
  });

  const related = (relatedRes?.data?.data || []).filter((p) => p._id !== product?._id);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images?.[0],
      quantity,
      variant: selectedSize || null,
    });
  };

  if (isLoading || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-xs text-slate-500">
        Đang tải chi tiết sản phẩm...
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [''];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-10 space-y-10">
      <nav className="text-[11px] text-slate-500 mb-2">
        <Link to="/shop" className="hover:text-amber-600">
          Cửa hàng
        </Link>{' '}
        / <span className="text-slate-700">{product.name}</span>
      </nav>

      <section className="grid md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="space-y-3">
          <div
            className="aspect-square rounded-3xl bg-slate-50 overflow-hidden border border-slate-100 cursor-zoom-in group relative"
            onClick={() => setIsLightboxOpen(true)}
          >
            {images[selectedImage] ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                Hình sản phẩm
              </div>
            )}
            <div className="absolute bottom-3 right-3 text-[10px] px-2 py-1 rounded-full bg-white/80 border border-slate-200 text-slate-600">
              Nhấn để phóng lớn
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`h-16 w-16 rounded-2xl border ${
                  index === selectedImage
                    ? 'border-amber-500'
                    : 'border-slate-200 hover:border-amber-200'
                } overflow-hidden bg-slate-50 flex-shrink-0`}
              >
                {img ? (
                  <img src={img} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                    Hình
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-600 mb-1">
              {product.category?.name || 'Trang sức'}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
              {product.name}
            </h1>
            <p className="text-xs text-slate-500">
              {product.material === 'gold' && 'Vàng'}
              {product.material === 'silver' && 'Bạc'}
              {product.material === 'platinum' && 'Bạch kim'} {product.gemstone && ` • ${product.gemstone}`}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-slate-900">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                product.salePrice || product.price,
              )}
            </span>
            {product.salePrice && (
              <span className="text-xs text-slate-400 line-through">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  product.price,
                )}
              </span>
            )}
          </div>

          {product.size?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-900">Chọn size</p>
              <div className="flex flex-wrap gap-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-full border text-[11px] ${
                      selectedSize === size
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                -
              </button>
              <span className="w-8 text-center text-[11px]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-amber-600 text-xs font-medium text-white py-2.5 hover:bg-amber-700 transition shadow-sm"
            >
              Thêm vào giỏ
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 text-xs font-medium text-slate-800 py-2.5 hover:bg-slate-50 transition"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <div className="flex gap-4 border-b border-slate-200 text-[11px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 ${
                activeTab === tab.id
                  ? 'border-b border-slate-900 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-600 leading-relaxed">
          {activeTab === 'description' && (product.description || 'Chưa có mô tả chi tiết.')}
          {activeTab === 'material' && (
            <p>
              Chất liệu được tuyển chọn kỹ lưỡng, phù hợp sử dụng hàng ngày. Thông tin chi tiết về
              tuổi vàng, xi mạ hoặc đá quý có thể được bổ sung tuỳ từng sản phẩm.
            </p>
          )}
          {activeTab === 'reviews' && <p>Chức năng đánh giá sẽ được bổ sung sau.</p>}
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Có thể bạn sẽ thích</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-3xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-8 right-4 text-xs text-slate-200 hover:text-white"
            >
              Đóng
            </button>
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-black/50">
              {images[selectedImage] && (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;

