import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore.js';
import { createOrder } from '../../services/orderService.js';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      paymentMethod: 'cod',
    },
  });

  const onSubmit = async (values) => {
    try {
      if (!items.length) {
        toast.error('Giỏ hàng trống');
        return;
      }

      const res = await createOrder({
        paymentMethod: 'cod',
        shippingAddress: {
          fullName: values.fullName,
          phone: values.phone,
          address: values.address,
        },
        items,
      });
      clearCart();
      navigate('/order-success', {
        state: {
          order: {
            ...(res?.data?.data || res?.data || {}),
            shippingAddress: {
              fullName: values.fullName,
              phone: values.phone,
              address: values.address,
            },
            paymentMethod: 'cod',
            items,
          },
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 lg:py-10 grid lg:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)] gap-6 lg:gap-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
            Thanh toán
          </h1>
          <p className="text-xs text-slate-500">
            Điền thông tin giao hàng, chọn phương thức thanh toán và xác nhận đơn hàng.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-100 bg-white/80 p-4 space-y-3 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-900 mb-1.5">
            Địa chỉ giao hàng
          </h2>
          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block mb-1 text-[11px] text-slate-700">Họ tên</label>
              <input
                type="text"
                {...register('fullName', { required: true })}
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-slate-700">Số điện thoại</label>
              <input
                type="tel"
                {...register('phone', { required: true })}
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="text-xs">
            <label className="block mb-1 text-[11px] text-slate-700">
              Địa chỉ giao hàng (ghi đầy đủ)
            </label>
            <textarea
              rows={3}
              {...register('address', { required: true })}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Ví dụ: 123 Đường A, Phường B, Quận C, TP.HCM"
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-amber-600 text-xs font-medium text-white py-3 px-6 hover:bg-amber-700 transition disabled:opacity-60"
        >
          Xác nhận đặt hàng
        </button>
      </form>

      {/* Order summary */}
      <aside className="rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-sm space-y-3 text-xs">
        <h2 className="text-xs font-semibold text-slate-900 mb-1.5">Tóm tắt đơn hàng</h2>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {items.length === 0 && (
            <p className="text-slate-400 text-[11px]">Giỏ hàng hiện đang trống.</p>
          )}
          {items.map((item) => (
            <div
              key={`${item.id}-${item.variant || 'default'}`}
              className="flex gap-2 border border-slate-100 rounded-2xl p-2"
            >
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-50">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                    Hình
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-900 line-clamp-2">
                  {item.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {item.variant && `Size ${item.variant} • `}x{item.quantity}
                </p>
              </div>
              <div className="text-[11px] text-slate-900">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  item.price * item.quantity,
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 pt-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Tạm tính</span>
            <span className="font-semibold text-slate-900">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                subtotal,
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Phí vận chuyển</span>
            <span>Được tính ở bước sau</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CheckoutPage;

