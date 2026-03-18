import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore.js';
import useUIStore from '../../store/uiStore.js';

const CartDrawer = () => {
  const { items, removeItem, updateQuantity } = useCartStore();
  const { isCartOpen, closeCart } = useUIStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-40 h-full w-full max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold tracking-tight">Giỏ hàng</h2>
          <button
            type="button"
            onClick={closeCart}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Đóng
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 && (
            <p className="text-xs text-slate-500 mt-4">Chưa có sản phẩm nào trong giỏ.</p>
          )}
          {items.map((item) => (
            <div
              key={`${item.id}-${item.variant || 'default'}`}
              className="flex gap-3 border border-slate-100 rounded-xl p-2"
            >
              <div className="h-16 w-16 rounded-lg bg-slate-50 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                    Hình
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 line-clamp-2">{item.name}</p>
                {item.variant && (
                  <p className="text-[11px] text-slate-500 mt-0.5">Phân loại: {item.variant}</p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.variant, Math.max(1, item.quantity - 1))
                      }
                      className="h-6 w-6 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-[11px]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                      className="h-6 w-6 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.variant)}
                    className="text-[11px] text-slate-400 hover:text-red-500"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <footer className="border-t border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 text-xs">Tạm tính</span>
            <span className="font-semibold text-slate-900 text-sm">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                subtotal,
              )}
            </span>
          </div>
          <button
            type="button"
            className="w-full inline-flex justify-center items-center rounded-full bg-amber-600 text-xs font-medium text-white py-2.5 hover:bg-amber-700 transition disabled:opacity-60"
            disabled={items.length === 0}
            onClick={() => {
              if (items.length === 0) return;
              closeCart();
              navigate('/checkout');
            }}
          >
            Tiến hành đặt hàng
          </button>
        </footer>
      </aside>
    </>
  );
};

export default CartDrawer;

