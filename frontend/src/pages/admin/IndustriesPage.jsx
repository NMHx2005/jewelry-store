import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  adminGetIndustries,
  adminCreateIndustry,
  adminUpdateIndustry,
  adminDeleteIndustry,
  adminUploadImage,
} from '../../services/adminService.js';

/* ─── Form Modal ─── */
const IndustryForm = ({ initial, onClose }) => {
  const qc = useQueryClient();
  const isEdit = !!initial;
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.image || '');
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: initial?.name || '',
      description: initial?.description || '',
      order: initial?.order ?? 0,
      isActive: initial?.isActive ?? true,
    },
  });

  const createMut = useMutation({
    mutationFn: adminCreateIndustry,
    onSuccess: () => qc.invalidateQueries(['adminIndustries']),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => adminUpdateIndustry(id, data),
    onSuccess: () => qc.invalidateQueries(['adminIndustries']),
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
        description: values.description,
        image: imageUrl || undefined,
        order: Number(values.order),
        isActive: values.isActive,
      };

      if (isEdit) {
        await updateMut.mutateAsync({ id: initial._id, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }

      toast.success(isEdit ? 'Cập nhật ngành thành công' : 'Tạo ngành thành công');
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra!';
      toast.error(msg);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {isEdit ? 'Chỉnh sửa ngành' : 'Thêm ngành mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-sm">
          {/* Image */}
          <div>
            <label className="text-gray-600 text-xs font-medium mb-2 block">Ảnh đại diện ngành</label>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-32 object-cover rounded-xl mb-2"
              />
            )}
            <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-500 hover:border-amber-400 hover:text-amber-500 transition">
              <span>{imageFile ? imageFile.name : '+ Chọn ảnh'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Tên ngành *</label>
            <input
              {...register('name', { required: 'Vui lòng nhập tên ngành' })}
              className={`w-full border rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="Trang sức, Đồng hồ, Phụ kiện..."
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Mô tả</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition resize-none"
              placeholder="Mô tả ngắn về ngành hàng..."
            />
          </div>

          {/* Order */}
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">
              Thứ tự hiển thị
            </label>
            <input
              {...register('order')}
              type="number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
              placeholder="0"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isActive')}
              className="accent-amber-500 w-4 h-4"
            />
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

/* ─── Main Page ─── */
const IndustriesPage = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminIndustries'],
    queryFn: adminGetIndustries,
  });

  const industries = data?.data?.data || data?.data || [];

  const deleteMut = useMutation({
    mutationFn: adminDeleteIndustry,
    onSuccess: () => {
      qc.invalidateQueries(['adminIndustries']);
      toast.success('Đã xoá ngành');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Xoá thất bại'),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, data }) => adminUpdateIndustry(id, data),
    onSuccess: () => qc.invalidateQueries(['adminIndustries']),
  });

  const handleDelete = (ind) => {
    if (
      window.confirm(
        `Xoá ngành "${ind.name}"?\nCác danh mục thuộc ngành này sẽ bị bỏ liên kết.`,
      )
    ) {
      deleteMut.mutate(ind._id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Ngành hàng</h1>
          <p className="text-xs text-gray-400 mt-0.5">{industries.length} ngành</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition"
        >
          + Thêm ngành
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Đang tải...</div>
      ) : industries.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          <p className="mb-1">Chưa có ngành hàng nào.</p>
          <p className="text-xs">Tạo ngành đầu tiên, sau đó gán danh mục vào ngành để phân loại sản phẩm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map((ind) => (
            <div
              key={ind._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
            >
              <div className="h-36 bg-gray-50 overflow-hidden relative">
                {ind.image ? (
                  <img
                    src={ind.image}
                    alt={ind.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200 text-5xl">
                    ◻
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-white/90 text-amber-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                  #{ind.order}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{ind.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{ind.slug}</p>
                    {ind.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ind.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleMut.mutate({ id: ind._id, data: { isActive: !ind.isActive } })
                    }
                    style={{ backgroundColor: ind.isActive ? '#34d399' : '#e5e7eb' }}
                    className="w-9 h-5 rounded-full relative transition-all duration-200 shrink-0 mt-0.5"
                  >
                    <span
                      style={{
                        transform: ind.isActive ? 'translateX(16px)' : 'translateX(2px)',
                      }}
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 block"
                    />
                  </button>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => {
                      setEditing(ind);
                      setShowForm(true);
                    }}
                    className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(ind)}
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
        <IndustryForm
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

export default IndustriesPage;
