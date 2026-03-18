import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import useUIStore from '../../store/uiStore.js';
import useAuthStore from '../../store/authStore.js';
import { login, register } from '../../services/authService.js';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Nhập tên của bạn'),
});

const AuthModal = () => {
  const { isAuthOpen, authMode, closeAuth, openAuth } = useUIStore();
  const setAuth = useAuthStore((s) => s.setAuth);

  const schema = authMode === 'login' ? loginSchema : registerSchema;

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    try {
      const fn = authMode === 'login' ? login : register;
      const res = await fn(values);
      setAuth(res.data.data);
      toast.success(authMode === 'login' ? 'Đăng nhập thành công' : 'Tạo tài khoản thành công');
      reset();
      closeAuth();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  if (!isAuthOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-100 px-6 py-6">
        <button
          type="button"
          onClick={closeAuth}
          className="absolute right-4 top-4 text-[11px] text-slate-400 hover:text-slate-700"
        >
          Đóng
        </button>
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-600 mb-1">
            Tài khoản
          </p>
          <h2 className="text-sm font-semibold text-slate-900">
            {authMode === 'login' ? 'Chào mừng bạn quay lại' : 'Tạo tài khoản mới'}
          </h2>
        </div>

        <div className="mb-3 flex gap-2 text-[11px] bg-slate-50 rounded-full p-1">
          <button
            type="button"
            onClick={() => openAuth('login')}
            className={`flex-1 py-1.5 rounded-full ${
              authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => openAuth('register')}
            className={`flex-1 py-1.5 rounded-full ${
              authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs">
          {authMode === 'register' && (
            <div>
              <label className="block mb-1 text-[11px] text-slate-700">Họ tên</label>
              <input
                type="text"
                {...formRegister('name')}
                className="w-full rounded-full border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {errors.name && (
                <p className="mt-1 text-[10px] text-red-500">{errors.name.message}</p>
              )}
            </div>
          )}
          <div>
            <label className="block mb-1 text-[11px] text-slate-700">Email</label>
            <input
              type="email"
              {...formRegister('email')}
              className="w-full rounded-full border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {errors.email && (
              <p className="mt-1 text-[10px] text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-[11px] text-slate-700">Mật khẩu</label>
            <input
              type="password"
              {...formRegister('password')}
              className="w-full rounded-full border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {errors.password && (
              <p className="mt-1 text-[10px] text-red-500">{errors.password.message}</p>
            )}
          </div>

          {authMode === 'login' && (
            <button
              type="button"
              className="text-[11px] text-slate-500 hover:text-amber-600"
            >
              Quên mật khẩu?
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-1 inline-flex items-center justify-center rounded-full bg-amber-600 text-[11px] font-medium text-white py-2.5 hover:bg-amber-700 transition disabled:opacity-60"
          >
            {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

