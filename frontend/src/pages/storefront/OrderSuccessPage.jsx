import { Link, useLocation, Navigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const { state } = useLocation();

  if (!state?.order) {
    return <Navigate to="/" replace />;
  }

  const { order } = state;
  const address = order.shippingAddress || {};
  const fmt = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Đặt hàng thành công!
        </h1>
        <p className="text-xs text-slate-500">
          Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.
        </p>
        {order._id && (
          <p className="text-[11px] text-slate-400">
            Mã đơn hàng:{' '}
            <span className="font-mono text-slate-600">#{order._id}</span>
          </p>
        )}
      </div>

      {/* Shipping info */}
      <div className="rounded-3xl border border-slate-100 bg-white/80 shadow-sm p-5 space-y-3">
        <h2 className="text-xs font-semibold text-slate-900">Thông tin giao hàng</h2>
        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
          {address.fullName && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Họ tên</p>
              <p className="font-medium text-slate-800">{address.fullName}</p>
            </div>
          )}
          {address.phone && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Số điện thoại</p>
              <p className="font-medium text-slate-800">{address.phone}</p>
            </div>
          )}
          {address.address && (
            <div className="col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Địa chỉ</p>
              <p className="font-medium text-slate-800">{address.address}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
              Phương thức thanh toán
            </p>
            <p className="font-medium text-slate-800">
              {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      {order.items?.length > 0 && (
        <div className="rounded-3xl border border-slate-100 bg-white/80 shadow-sm p-5 space-y-3">
          <h2 className="text-xs font-semibold text-slate-900">Sản phẩm đã đặt</h2>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={`${item.id || item._id || idx}-${item.variant || 'default'}`}
                className="flex gap-3 border border-slate-100 rounded-2xl p-2 text-xs"
              >
                <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                      Hình
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-900 line-clamp-2">{item.name}</p>
                  {item.variant && (
                    <p className="text-[10px] text-slate-500">{item.variant}</p>
                  )}
                  <p className="text-[10px] text-slate-500">x{item.quantity}</p>
                </div>
                <div className="text-[11px] text-slate-900 flex-shrink-0">
                  {fmt(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tổng cộng</span>
            <span className="font-semibold text-slate-900">
              {fmt(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/shop"
          className="inline-flex items-center justify-center rounded-full bg-amber-600 text-xs font-medium text-white py-2.5 px-6 hover:bg-amber-700 transition"
        >
          Tiếp tục mua sắm
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 text-xs font-medium text-slate-700 py-2.5 px-6 hover:bg-slate-50 transition"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
