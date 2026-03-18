import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { adminGetOrders, adminGetProducts } from '../../services/adminService.js';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const STATUS_LABEL = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
};

const STATUS_COLOR = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping: 'bg-violet-100 text-violet-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

const buildRevenueChart = (orders) => {
  const map = {};
  (orders || []).forEach((o) => {
    const d = new Date(o.createdAt);
    const key = `${d.getDate()}/${d.getMonth() + 1}`;
    map[key] = (map[key] || 0) + (o.totalPrice || 0);
  });
  return Object.entries(map)
    .slice(-10)
    .map(([date, revenue]) => ({ date, revenue }));
};

const DashboardPage = () => {
  const { data: ordersRes } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => adminGetOrders({ limit: 100 }),
  });

  const { data: productsRes } = useQuery({
    queryKey: ['adminProductsCount'],
    queryFn: () => adminGetProducts({ limit: 1 }),
  });

  const orders = ordersRes?.data?.data || [];
  const totalProducts = productsRes?.data?.pagination?.total || 0;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
  const chartData = buildRevenueChart(orders);
  const recentOrders = [...orders].reverse().slice(0, 8);

  const stats = [
    {
      label: 'Tổng đơn hàng',
      value: totalOrders,
      sub: 'đơn đã tạo',
      accent: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Doanh thu',
      value: fmt(totalRevenue),
      sub: 'đơn đã giao',
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Chờ xác nhận',
      value: pendingOrders,
      sub: 'đơn mới',
      accent: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Sản phẩm',
      value: totalProducts,
      sub: 'trong kho',
      accent: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">Tổng quan hoạt động cửa hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className={`inline-flex w-9 h-9 rounded-xl ${s.bg} items-center justify-center mb-3`}>
              <span className={`text-base font-bold ${s.accent}`}>
                {typeof s.value === 'number' ? s.value : '#'}
              </span>
            </div>
            <p className={`text-xl font-bold ${s.accent}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Doanh thu 10 ngày gần nhất</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ fill: '#f59e0b', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">Chưa có dữ liệu doanh thu.</p>
        )}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Đơn hàng gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400">
                <th className="text-left pb-3 pr-4 font-medium">Mã đơn</th>
                <th className="text-left pb-3 pr-4 font-medium">Ngày</th>
                <th className="text-left pb-3 pr-4 font-medium">Tổng tiền</th>
                <th className="text-left pb-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-500">
                    #{o._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 pr-4 text-sm font-medium text-gray-800">
                    {fmt(o.totalPrice)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLOR[o.orderStatus] || 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {STATUS_LABEL[o.orderStatus] || o.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
