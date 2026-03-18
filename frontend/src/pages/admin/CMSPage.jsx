import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  adminGetBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  adminGetSettings,
  adminUpdateSettings,
  adminUploadImage,
} from '../../services/adminService.js';

const POSITIONS = ['hero', 'popup', 'sidebar'];

/* ─── Banner Form ─── */
const BannerForm = ({ initial, onClose }) => {
  const qc = useQueryClient();
  const isEdit = !!initial;
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.image || '');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      title: initial?.title || '',
      link: initial?.link || '',
      position: initial?.position || 'hero',
      order: initial?.order ?? 0,
      isActive: initial?.isActive ?? true,
      startDate: initial?.startDate ? initial.startDate.slice(0, 10) : '',
      endDate: initial?.endDate ? initial.endDate.slice(0, 10) : '',
    },
  });

  const createMut = useMutation({ mutationFn: adminCreateBanner, onSuccess: () => qc.invalidateQueries(['adminBanners']) });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => adminUpdateBanner(id, data), onSuccess: () => qc.invalidateQueries(['adminBanners']) });

  const onSubmit = async (values) => {
    try {
      let imageUrl = initial?.image || '';
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append('image', imageFile);
        const res = await adminUploadImage(fd);
        imageUrl = res.data?.data?.url || imageUrl;
        setUploading(false);
      }
      const payload = { ...values, image: imageUrl, order: Number(values.order) };
      if (isEdit) {
        await updateMut.mutateAsync({ id: initial._id, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      toast.success(isEdit ? 'Cập nhật banner thành công' : 'Tạo banner thành công');
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra!');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{isEdit ? 'Chỉnh sửa banner' : 'Thêm banner mới'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-sm">
          {previewUrl && (
            <img src={previewUrl} alt="preview" className="w-full h-36 object-cover rounded-xl" />
          )}

          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Hình ảnh</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) { setImageFile(file); setPreviewUrl(URL.createObjectURL(file)); }
              }}
              className="text-xs text-gray-500 w-full"
            />
          </div>

          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Tiêu đề</label>
            <input {...register('title')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" placeholder="Banner mùa hè" />
          </div>

          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Đường dẫn</label>
            <input {...register('link')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" placeholder="/shop" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1 block">Vị trí</label>
              <select {...register('position')} className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition">
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1 block">Thứ tự</label>
              <input {...register('order')} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1 block">Ngày bắt đầu</label>
              <input {...register('startDate')} type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" />
            </div>
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1 block">Ngày kết thúc</label>
              <input {...register('endDate')} type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isActive')} className="accent-amber-500 w-4 h-4" />
            <span className="text-xs text-gray-600">Hiển thị</span>
          </label>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Huỷ</button>
            <button type="submit" disabled={isSubmitting || uploading} className="px-5 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition disabled:opacity-60">
              {isSubmitting || uploading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Toggle ─── */
const Toggle = ({ on, onClick }) => (
  <button
    onClick={onClick}
    style={{ backgroundColor: on ? '#34d399' : '#e5e7eb' }}
    className="w-9 h-5 rounded-full relative transition-all duration-200 flex-shrink-0"
  >
    <span
      style={{ transform: on ? 'translateX(16px)' : 'translateX(2px)' }}
      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 block"
    />
  </button>
);

/* ─── Settings ─── */
const SettingsSection = () => {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['adminSettings'], queryFn: adminGetSettings });
  const settings = data?.data?.data || data?.data || {};

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    values: {
      logoUrl: settings.logoUrl || '',
      primaryColor: settings.primaryColor || '#f59e0b',
      secondaryColor: settings.secondaryColor || '#ffffff',
      homepageTagline: settings.homepageTagline || '',
    },
  });

  const updateMut = useMutation({
    mutationFn: adminUpdateSettings,
    onSuccess: () => { qc.invalidateQueries(['adminSettings']); toast.success('Đã lưu cài đặt'); },
    onError: () => toast.error('Lưu thất bại'),
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-gray-800 mb-4">Cài đặt chung</h2>
      <form onSubmit={handleSubmit((values) => updateMut.mutateAsync(values))} className="space-y-4 text-sm">
        <div>
          <label className="text-gray-600 text-xs font-medium mb-1 block">URL Logo</label>
          <input {...register('logoUrl')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" placeholder="https://..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Màu chính</label>
            <div className="flex gap-2 items-center">
              <input {...register('primaryColor')} type="color" className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
              <input {...register('primaryColor')} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" />
            </div>
          </div>
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Màu phụ</label>
            <div className="flex gap-2 items-center">
              <input {...register('secondaryColor')} type="color" className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
              <input {...register('secondaryColor')} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 font-mono text-xs text-gray-700 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" />
            </div>
          </div>
        </div>
        <div>
          <label className="text-gray-600 text-xs font-medium mb-1 block">Tagline trang chủ</label>
          <input {...register('homepageTagline')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition" placeholder="Trang sức tinh tế – Đẳng cấp vượt thời gian" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting || updateMut.isPending} className="px-5 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition disabled:opacity-60">
            {updateMut.isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ─── Main page ─── */
const CMSPage = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['adminBanners'], queryFn: adminGetBanners });
  const banners = data?.data?.data || data?.data || [];

  const deleteMut = useMutation({
    mutationFn: adminDeleteBanner,
    onSuccess: () => { qc.invalidateQueries(['adminBanners']); toast.success('Đã xoá banner'); },
    onError: () => toast.error('Xoá thất bại'),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, data }) => adminUpdateBanner(id, data),
    onSuccess: () => qc.invalidateQueries(['adminBanners']),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Giao diện (CMS)</h1>
        <p className="text-xs text-gray-400 mt-0.5">Quản lý banner và cài đặt trang chủ</p>
      </div>

      {/* Banners */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">Banners ({Array.isArray(banners) ? banners.length : 0})</h2>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition"
          >
            + Thêm banner
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-400 font-medium">
                <th className="text-left px-4 py-3">Ảnh & Tiêu đề</th>
                <th className="text-left py-3 pr-4">Vị trí</th>
                <th className="text-left py-3 pr-4">Thứ tự</th>
                <th className="text-left py-3 pr-4">Hiển thị</th>
                <th className="text-right py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Đang tải...</td></tr>
              ) : !Array.isArray(banners) || banners.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Chưa có banner nào.</td></tr>
              ) : banners.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {b.image ? (
                        <img src={b.image} alt={b.title} className="w-16 h-10 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{b.title || '(Không có tiêu đề)'}</p>
                        {b.link && <p className="text-xs text-gray-400">{b.link}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{b.position}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{b.order}</td>
                  <td className="py-3 pr-4">
                    <Toggle on={b.isActive} onClick={() => toggleMut.mutate({ id: b._id, data: { isActive: !b.isActive } })} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing(b); setShowForm(true); }} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">Sửa</button>
                      <button onClick={() => window.confirm('Xoá banner này?') && deleteMut.mutate(b._id)} className="px-3 py-1.5 text-xs border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition">Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SettingsSection />

      {showForm && (
        <BannerForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
};

export default CMSPage;
