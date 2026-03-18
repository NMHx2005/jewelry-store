import { useState, useMemo } from 'react';
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

/** Tìm variant khớp combination đã chọn */
const findVariant = (variants = [], selected = {}) => {
  if (!variants.length) return null;
  return variants.find((v) => {
    const combo = v.combination instanceof Map ? Object.fromEntries(v.combination) : v.combination;
    return Object.entries(selected).every(([k, val]) => combo?.[k] === val);
  }) || null;
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { data: productRes, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
  });

  const product = productRes?.data?.data;

  const hasVariants = product?.options?.length > 0 && product?.variants?.length > 0;

  /* Variant khớp với lựa chọn hiện tại */
  const matchedVariant = useMemo(
    () => (hasVariants ? findVariant(product.variants, selectedOptions) : null),
    [hasVariants, product?.variants, selectedOptions],
  );

  /* Giá hiển thị: variant giá riêng → salePrice → price */
  const displayPrice = matchedVariant?.price || product?.salePrice || product?.price || 0;

  /* Stock hiển thị */
  const displayStock = hasVariants
    ? (matchedVariant?.stock ?? null)
    : (product?.stock ?? 0);

  /* Kiểm tra đã chọn đủ tất cả option chưa */
  const allOptionsSelected = !hasVariants ||
    (product?.options || []).every((opt) => !!selectedOptions[opt.name]);

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
    if (hasVariants && !allOptionsSelected) return;
    const variantLabel = Object.entries(selectedOptions)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' / ');
    addItem({
      id: product._id,
      name: product.name,
      price: displayPrice,
      image: product.images?.[0],
      quantity,
      variant: variantLabel || null,
      variantCombo: hasVariants ? selectedOptions : null,
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
              {[product.material, product.gemstone].filter(Boolean).join(' • ')}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-slate-900">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayPrice)}
            </span>
            {product.salePrice && !matchedVariant?.price && (
              <span className="text-xs text-slate-400 line-through">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </span>
            )}
            {displayStock !== null && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${displayStock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {displayStock > 0 ? `Còn ${displayStock}` : 'Hết hàng'}
              </span>
            )}
          </div>

          {/* Variant options (Shopify-style) */}
          {hasVariants && product.options.map((opt) => (
            <div key={opt.name} className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-900">{opt.name}</p>
              <div className="flex flex-wrap gap-2">
                {opt.values.map((val) => {
                  const isSelected = selectedOptions[opt.name] === val;
                  /* Kiểm tra option này có variant còn hàng không */
                  const tentative = { ...selectedOptions, [opt.name]: val };
                  const match = findVariant(product.variants, tentative);
                  const outOfStock = match !== null && match.stock === 0;
                  return (
                    <button
                      key={val}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.name]: val }))}
                      className={`px-3 py-1.5 rounded-full border text-[11px] transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium'
                          : outOfStock
                          ? 'border-slate-200 text-slate-300 line-through cursor-not-allowed'
                          : 'border-slate-200 text-slate-700 hover:border-amber-300'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Fallback: size array cũ nếu không dùng variant system */}
          {!hasVariants && product.size?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-900">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedOptions({ Size: size })}
                    className={`px-3 py-1.5 rounded-full border text-[11px] ${
                      selectedOptions.Size === size
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-700 hover:border-amber-300'
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

          {hasVariants && !allOptionsSelected && (
            <p className="text-[10px] text-amber-600">
              ← Vui lòng chọn đầy đủ {product.options.map((o) => o.name).join(', ')} trước khi thêm vào giỏ
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!allOptionsSelected || displayStock === 0}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-amber-600 text-xs font-medium text-white py-2.5 hover:bg-amber-700 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {displayStock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
            </button>
            <button
              type="button"
              onClick={() => { handleAddToCart(); }}
              disabled={!allOptionsSelected || displayStock === 0}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-amber-400 text-xs font-medium text-amber-700 py-2.5 hover:bg-amber-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {product.material && (
                  <div className="p-3 rounded-xl" style={{ background: '#f4f1eb' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#b6915d' }}>Chất liệu</p>
                    <p className="font-medium text-slate-800">{product.material}</p>
                  </div>
                )}
                {product.gemstone && (
                  <div className="p-3 rounded-xl" style={{ background: '#f4f1eb' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#b6915d' }}>Đá quý</p>
                    <p className="font-medium text-slate-800">{product.gemstone}</p>
                  </div>
                )}
                {product.weight && (
                  <div className="p-3 rounded-xl" style={{ background: '#f4f1eb' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#b6915d' }}>Trọng lượng</p>
                    <p className="font-medium text-slate-800">{product.weight} g</p>
                  </div>
                )}
                {product.category?.name && (
                  <div className="p-3 rounded-xl" style={{ background: '#f4f1eb' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#b6915d' }}>Danh mục</p>
                    <p className="font-medium text-slate-800">{product.category.name}</p>
                  </div>
                )}
              </div>
              {product.materialDetail ? (
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{product.materialDetail}</p>
              ) : (
                <p className="text-slate-500 italic">
                  Sản phẩm được làm từ chất liệu cao cấp, qua kiểm định chất lượng. Bảo quản nơi khô ráo, tránh tiếp xúc hoá chất và nước biển. Liên hệ cửa hàng để được tư vấn thêm.
                </p>
              )}
            </div>
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

