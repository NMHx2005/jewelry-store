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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/">
            <img src="/logo-diamond.png" alt="Logo" className="h-10 w-auto object-contain" />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <NavLink to="/" className="hover:text-amber-600">
              Trang chủ
            </NavLink>
            <NavLink to="/shop" className="hover:text-amber-600">
              Cửa hàng
            </NavLink>
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex items-center gap-1 text-slate-700 hover:text-amber-600"
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

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-slate-500 flex justify-between">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
          <p>Thiết kế dành riêng cho bạn.</p>
        </div>
      </footer>

      {/* Zalo sticky button */}
      <a
        href="https://zalo.me/0000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-2"
        title="Liên hệ Zalo"
      >
        {/* Tooltip */}
        <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 bg-white text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-md border border-slate-100 whitespace-nowrap">
          Liên hệ Zalo
        </span>
        {/* Icon */}
        <div className="relative" style={{ width: 52, height: 52 }}>
          {/* Ping ring */}
          <span className="absolute inset-0 rounded-full bg-[#0068FF]/25 animate-ping" />
          <div className="relative rounded-full shadow-lg overflow-hidden border-2 border-white" style={{ width: 52, height: 52 }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
              alt="Zalo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </a>

      <CartDrawer />
      <AuthModal />
    </div>
  );
};

export default MainLayout;


