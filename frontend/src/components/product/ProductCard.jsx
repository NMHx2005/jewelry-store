import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore.js';

const ProductCard = ({ product }) => {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addItem({
      id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images?.[0],
      variant: null,
    });
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      style={{ background: '#fdfbf8', borderColor: '#ebe5dc' }}
    >
      <div className="aspect-square overflow-hidden" style={{ background: '#f4f1eb' }}>
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
            Hình sản phẩm
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-amber-600">
          {product.category?.name || 'Trang sức'}
        </p>
        <h3 className="text-sm font-medium text-slate-900 line-clamp-2">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              product.salePrice || product.price,
            )}
          </span>
          {product.salePrice && (
            <span className="text-[11px] text-slate-400 line-through">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                product.price,
              )}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleAddToCart}
        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-amber-600 text-[11px] font-medium text-white
          [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0
          opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
          transition-all duration-200 shadow-sm"
      >
        + Giỏ
      </button>
    </Link>
  );
};

export default ProductCard;

