import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminGetOrders, adminGetOrderById, adminUpdateOrderStatus } from '../../services/adminService.js';

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã huỷ' },
];

const STATUS_COLOR = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping: 'bg-violet-100 text-violet-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

/* ─── Detail Drawer ─── */
const OrderDrawer = ({ orderId, onClose }) => {
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrder', orderId],
    queryFn: () => adminGetOrderById(orderId),
    enabled: !!orderId,
  });

  const order = data?.data?.data;

  const updateMut = useMutation({
    mutationFn: ({ id, status }) => adminUpdateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries(['adminOrders']);
      qc.invalidateQueries(['adminOrder', orderId]);
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white border-l border-gray-200 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Chi tiết đơn hàng</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading || !order ? (
            <p className="text-center py-12 text-gray-400 text-sm">Đang tải...</p>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[order.orderStatus] || 'bg-gray-100 text-gray-500'}`}>
                  {STATUS_OPTIONS.find((s) => s.value === order.orderStatus)?.label || order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>

              {/* Shipping */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Giao hàng</p>
                <p className="text-sm font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
                <p className="text-sm text-gray-500">{order.shippingAddress?.phone}</p>
                <p className="text-sm text-gray-500">{order.shippingAddress?.address}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Sản phẩm</p>
                <div className="space-y-2">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product?.name || 'Sản phẩm'}</p>
                        {item.variant && <p className="text-xs text-gray-400">Size: {item.variant}</p>}
                        <p className="text-xs text-gray-400">x{item.qty} · {fmt(item.price)}</p>
                      </div>
                      <p className="text-sm font-semibold text-amber-600">{fmt(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-500">Tổng cộng</span>
                <span className="text-base font-bold text-amber-600">{fmt(order.totalPrice)}</span>
              </div>

              {/* Payment */}
              <div className="text-xs text-gray-400">
                Thanh toán: <span className="text-gray-600 font-medium">{order.paymentMethod?.toUpperCase()}</span>
                &ensp;·&ensp;
                {order.paymentStatus === 'paid'
                  ? <span className="text-emerald-600 font-medium">Đã thanh toán</span>
                  : <span className="text-yellow-600 font-medium">Chưa thanh toán</span>}
              </div>

              {/* Update status */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Cập nhật trạng thái</p>
                <div className="flex gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
                  >
                    <option value="">-- Chọn trạng thái --</option>
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button
                    onClick={() => { if (!newStatus) return toast.error('Chọn trạng thái'); updateMut.mutate({ id: orderId, status: newStatus }); }}
                    disabled={updateMut.isPending || !newStatus}
                    className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition disabled:opacity-60"
                  >
                    {updateMut.isPending ? '...' : 'Lưu'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

/* ─── Main page ─── */
const OrdersPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders', page, statusFilter],
    queryFn: () => adminGetOrders({ page, limit: 12, orderStatus: statusFilter || undefined }),
    keepPreviousData: true,
  });

  const orders = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Đơn hàng</h1>
          <p className="text-xs text-gray-400 mt-0.5">{pagination.total || 0} đơn hàng</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs text-gray-400 font-medium">
              <th className="text-left px-4 py-3">Mã đơn</th>
              <th className="text-left py-3 pr-4">Ngày</th>
              <th className="text-left py-3 pr-4">Khách hàng</th>
              <th className="text-left py-3 pr-4">Tổng tiền</th>
              <th className="text-left py-3 pr-4">Trạng thái</th>
              <th className="text-right py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Đang tải...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Không có đơn hàng nào.</td></tr>
            ) : orders.map((o) => (
              <tr key={o._id} className="hover:bg-gray-50/50 transition cursor-pointer" onClick={() => setSelectedId(o._id)}>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    #{o._id.slice(-6).toUpperCase()}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs text-gray-400">
                  {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="py-3 pr-4">
                  <p className="text-sm font-medium text-gray-700">{o.shippingAddress?.fullName || '—'}</p>
                  <p className="text-xs text-gray-400">{o.shippingAddress?.phone}</p>
                </td>
                <td className="py-3 pr-4 text-sm font-semibold text-amber-600">{fmt(o.totalPrice)}</td>
                <td className="py-3 pr-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[o.orderStatus] || 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_OPTIONS.find((s) => s.value === o.orderStatus)?.label || o.orderStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedId(o._id); }}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition"
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 text-xs rounded-lg border transition ${p === page ? 'bg-amber-500 border-amber-500 text-white font-semibold' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {selectedId && <OrderDrawer orderId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
};

export default OrdersPage;
