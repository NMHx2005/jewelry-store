import { Outlet, Link, NavLink } from 'react-router-dom';
import useCartStore from '../../store/cartStore.js';
import useUIStore from '../../store/uiStore.js';
import CartDrawer from '../cart/CartDrawer.jsx';
import AuthModal from '../auth/AuthModal.jsx';

const MainLayout = () => {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const openCart = useUIStore((s) => s.openCart);
  const openAuth = useUIStore((s) => s.openAuth);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: '#faf8f5' }}>
      <header className="sticky top-0 z-20 backdrop-blur border-b" style={{ background: 'rgba(250,248,245,0.92)', borderColor: '#ebe5dc' }}>
        <div className="max-w-6xl mx-auto flex items-center px-4 py-3 gap-3">
          <Link to="/" className="shrink-0">
            <img
              src="/logo-diamond.png"
              alt="Logo"
              className="h-10 w-10 object-cover rounded-full ring-2 ring-amber-200/60"
            />
          </Link>

          {/* Brand name — hiện trên màn hình rộng */}
          <span className="hidden sm:block text-sm font-semibold tracking-tight" style={{ color: '#7a6a5c' }}>
            Trang Sức
          </span>

          <nav className="ml-auto flex items-center gap-3 sm:gap-5 text-xs sm:text-sm font-medium" style={{ color: '#6e655d' }}>
            <NavLink to="/" className="hidden sm:block hover:text-amber-600 transition-colors whitespace-nowrap">
              Trang chủ
            </NavLink>
            <NavLink to="/shop" className="hover:text-amber-600 transition-colors whitespace-nowrap">
              Cửa hàng
            </NavLink>
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex items-center gap-1 hover:text-amber-600 transition-colors whitespace-nowrap"
            >
              <span>Giỏ hàng</span>
              {totalItems > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-amber-500 text-[10px] text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>

      <footer className="border-t" style={{ background: '#f4f1eb', borderColor: '#ebe5dc' }}>
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0" style={{ color: '#9c9088' }}>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
          <p>Thiết kế dành riêng cho bạn.</p>
        </div>
      </footer>

      <CartDrawer />
      <AuthModal />
    </div>
  );
};

export default MainLayout;


