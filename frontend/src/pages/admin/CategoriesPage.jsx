import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminUploadImage,
} from '../../services/adminService.js';

/* ─── Form Modal ─── */
const CategoryForm = ({ initial, allCategories, onClose }) => {
  const qc = useQueryClient();
  const isEdit = !!initial;
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.image || '');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: initial?.name || '',
      parent: initial?.parent || '',
      level: initial?.level || 1,
      isActive: initial?.isActive ?? true,
    },
  });

  const createMut = useMutation({
    mutationFn: adminCreateCategory,
    onSuccess: () => qc.invalidateQueries(['adminCategories']),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => adminUpdateCategory(id, data),
    onSuccess: () => qc.invalidateQueries(['adminCategories']),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

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

      const payload = {
        name: values.name,
        image: imageUrl || undefined,
        parent: values.parent || undefined,
        level: Number(values.level),
        isActive: values.isActive,
      };

      if (isEdit) {
        await updateMut.mutateAsync({ id: initial._id, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }

      toast.success(isEdit ? 'Cập nhật danh mục thành công' : 'Tạo danh mục thành công');
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra!';
      toast.error(msg);
      setUploading(false);
    }
  };

  const parents = allCategories.filter((c) => c._id !== initial?._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-sm">
          {/* Image */}
          <div>
            <label className="text-gray-600 text-xs font-medium mb-2 block">Ảnh danh mục</label>
            {previewUrl && (
              <img src={previewUrl} alt="preview" className="w-full h-32 object-cover rounded-xl mb-2" />
            )}
            <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-500 hover:border-amber-400 hover:text-amber-500 transition">
              <span>{imageFile ? imageFile.name : '+ Chọn ảnh'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Tên danh mục *</label>
            <input
              {...register('name', { required: 'Vui lòng nhập tên danh mục' })}
              className={`w-full border rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="Nhẫn, Vòng cổ, Bông tai..."
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Parent category */}
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">
              Danh mục cha <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
            </label>
            <select
              {...register('parent')}
              className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
            >
              <option value="">Không có (danh mục gốc)</option>
              {parents.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Cấp độ</label>
            <select
              {...register('level')}
              className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
            >
              <option value={1}>Cấp 1 (gốc)</option>
              <option value={2}>Cấp 2 (con)</option>
              <option value={3}>Cấp 3</option>
            </select>
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isActive')} className="accent-amber-500 w-4 h-4" />
            <span className="text-xs text-gray-600">Hiển thị trên storefront</span>
          </label>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="px-5 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition disabled:opacity-60"
            >
              {isSubmitting || uploading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main page ─── */
const CategoriesPage = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: adminGetCategories,
  });

  const categories = data?.data?.data || data?.data || [];

  const deleteMut = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => { qc.invalidateQueries(['adminCategories']); toast.success('Đã xoá danh mục'); },
    onError: (err) => toast.error(err?.response?.data?.message || 'Xoá thất bại'),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, data }) => adminUpdateCategory(id, data),
    onSuccess: () => qc.invalidateQueries(['adminCategories']),
  });

  const handleDelete = (cat) => {
    if (window.confirm(`Xoá danh mục "${cat.name}"?`)) {
      deleteMut.mutate(cat._id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Danh mục</h1>
          <p className="text-xs text-gray-400 mt-0.5">{categories.length} danh mục</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition"
        >
          + Thêm danh mục
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Đang tải...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          Chưa có danh mục nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
            >
              {/* Image */}
              <div className="h-32 bg-gray-50 overflow-hidden relative">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200 text-5xl">
                    ◻
                  </div>
                )}
                {/* Level badge */}
                <span className="absolute top-2 left-2 bg-white/90 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-200">
                  Cấp {cat.level}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{cat.slug}</p>
                  </div>
                  {/* Active toggle */}
                  <button
                    type="button"
                    onClick={() => toggleMut.mutate({ id: cat._id, data: { isActive: !cat.isActive } })}
                    style={{ backgroundColor: cat.isActive ? '#34d399' : '#e5e7eb' }}
                    className="w-9 h-5 rounded-full relative transition-all duration-200 shrink-0 mt-0.5"
                  >
                    <span
                      style={{ transform: cat.isActive ? 'translateX(16px)' : 'translateX(2px)' }}
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 block"
                    />
                  </button>
                </div>

                {cat.parent && (
                  <p className="text-xs text-gray-400 mt-1">
                    Thuộc: {categories.find((c) => c._id === cat.parent)?.name || 'Danh mục khác'}
                  </p>
                )}

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => { setEditing(cat); setShowForm(true); }}
                    className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="flex-1 py-1.5 text-xs border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryForm
          initial={editing}
          allCategories={categories}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
