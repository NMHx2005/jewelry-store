import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore.js';
import { login } from '../../services/authService.js';

/* ─── Admin Login Gate ─── */
const AdminLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      const { token, user } = res.data.data ?? res.data;
      if (user.role !== 'admin') {
        toast.error('Tài khoản không có quyền admin');
        return;
      }
      setAuth({ token, user });
      toast.success('Đăng nhập thành công');
    } catch {
      toast.error('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo-diamond.png" alt="Logo" className="h-14 w-14 object-cover rounded-full ring-2 ring-amber-200/60 mb-3" />
          <p className="text-xs text-gray-400">Đăng nhập để tiếp tục</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
              placeholder="admin@jewelry.com"
            />
          </div>
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm rounded-lg transition disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true, icon: '▣' },
  { to: '/admin/products', label: 'Sản phẩm', icon: '◈' },
  { to: '/admin/industries', label: 'Ngành hàng', icon: '◧' },
  { to: '/admin/categories', label: 'Danh mục', icon: '◫' },
  { to: '/admin/orders', label: 'Đơn hàng', icon: '◎' },
  { to: '/admin/cms', label: 'Giao diện', icon: '◉' },
];

/* ─── Admin Layout ─── */
const AdminLayout = () => {
  const { user, logout } = useAuthStore();

  if (!user || user.role !== 'admin') {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/">
            <img src="/logo-diamond.png" alt="Logo" className="h-8 w-8 object-cover rounded-full ring-1 ring-amber-200/60" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
            Menu
          </p>
          {NAV_ITEMS.map(({ to, label, end, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition font-medium ${
                  isActive
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`
              }
            >
              <span className="text-[15px] leading-none">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold flex-shrink-0">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-xs text-left text-gray-400 hover:text-red-500 transition py-1"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <span className="text-xs text-gray-400">Bảng điều khiển quản trị</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
