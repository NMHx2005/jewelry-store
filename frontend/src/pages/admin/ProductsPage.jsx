import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetCategories,
  adminUploadImage,
} from '../../services/adminService.js';

const MATERIAL_SUGGESTIONS = [
  'Vàng 9K', 'Vàng 10K', 'Vàng 14K', 'Vàng 18K', 'Vàng 24K',
  'Vàng trắng 14K', 'Vàng trắng 18K',
  'Vàng hồng 14K', 'Vàng hồng 18K',
  'Bạc 925', 'Bạc 999',
  'Bạch kim 950', 'Platinum 950',
  'Titanium', 'Thép không gỉ',
];
const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

/* ─── Image Manager inside form ─── */
const ImageManager = ({ existingImages, onChange }) => {
  const [images, setImages] = useState(existingImages || []);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData();
          fd.append('image', file);
          const res = await adminUploadImage(fd);
          return res.data?.data?.url || '';
        }),
      );
      const next = [...images, ...urls.filter(Boolean)];
      setImages(next);
      onChange(next);
    } catch {
      toast.error('Upload ảnh thất bại');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = (idx) => {
    const next = images.filter((_, i) => i !== idx);
    setImages(next);
    onChange(next);
  };

  const setMain = (idx) => {
    const next = [images[idx], ...images.filter((_, i) => i !== idx)];
    setImages(next);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, idx) => (
            <div key={url + idx} className="relative group">
              <img
                src={url}
                alt={`img-${idx}`}
                className={`w-20 h-20 object-cover rounded-xl border-2 transition ${
                  idx === 0 ? 'border-amber-400' : 'border-transparent'
                }`}
              />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-amber-400 text-white text-[9px] font-bold px-1 rounded">
                  Chính
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setMain(idx)}
                    title="Đặt làm ảnh chính"
                    className="w-6 h-6 rounded-full bg-amber-400 text-white text-xs flex items-center justify-center"
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  title="Xoá ảnh"
                  className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className={`inline-flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-500 hover:border-amber-400 hover:text-amber-500 transition ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
        <span>{uploading ? 'Đang upload...' : '+ Thêm ảnh'}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      <p className="text-[10px] text-gray-400">
        Hover vào ảnh để xoá hoặc đặt làm ảnh chính (viền vàng).
      </p>
    </div>
  );
};

/* ─── Variant Manager ─────────────────────────────────────── */
const cartesian = (arrays) =>
  arrays.reduce(
    (acc, opt) => {
      const out = [];
      acc.forEach((combo) => opt.values.forEach((val) => out.push({ ...combo, [opt.name]: val })));
      return out;
    },
    [{}],
  );

const VariantManager = ({ initialOptions = [], initialVariants = [], onChange }) => {
  const [options, setOptions] = useState(() =>
    initialOptions.length > 0
      ? initialOptions.map((o) => {
          const raw = o.valueImages instanceof Map ? Object.fromEntries(o.valueImages) : (o.valueImages || {});
          return {
            ...o,
            valueImages: raw,
            hasImages: Object.keys(raw).length > 0,
          };
        })
      : [],
  );
  const [variants, setVariants] = useState(() => {
    if (initialVariants.length > 0) {
      return initialVariants.map((v) => ({
        combination: v.combination instanceof Map ? Object.fromEntries(v.combination) : (v.combination || {}),
        stock: v.stock ?? 0,
        price: v.price ?? '',
        sku: v.sku ?? '',
      }));
    }
    return [];
  });
  const [newOptionName, setNewOptionName] = useState('');
  const [newValues, setNewValues] = useState({});
  const [uploadingImg, setUploadingImg] = useState({});

  const notify = useCallback((nextOpts, nextVars) => {
    onChange({
      options: nextOpts.map(({ hasImages, ...rest }) => rest),
      variants: nextVars,
    });
  }, [onChange]);

  const toggleHasImages = (optName) => {
    const nextOpts = options.map((o) =>
      o.name === optName ? { ...o, hasImages: !o.hasImages, valueImages: !o.hasImages ? o.valueImages : {} } : o,
    );
    setOptions(nextOpts);
    notify(nextOpts, variants);
  };

  const uploadValueImage = async (optName, val, file) => {
    const key = `${optName}__${val}`;
    setUploadingImg((p) => ({ ...p, [key]: true }));
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await adminUploadImage(fd);
      const url = res.data?.data?.url || '';
      if (!url) return;
      const nextOpts = options.map((o) =>
        o.name === optName
          ? { ...o, valueImages: { ...(o.valueImages || {}), [val]: url } }
          : o,
      );
      setOptions(nextOpts);
      notify(nextOpts, variants);
    } catch {
      toast.error('Upload ảnh thất bại');
    } finally {
      setUploadingImg((p) => ({ ...p, [key]: false }));
    }
  };

  const removeValueImage = (optName, val) => {
    const nextOpts = options.map((o) => {
      if (o.name !== optName) return o;
      const imgs = { ...(o.valueImages || {}) };
      delete imgs[val];
      return { ...o, valueImages: imgs };
    });
    setOptions(nextOpts);
    notify(nextOpts, variants);
  };

  const regenerateVariants = (nextOptions, currentVariants) => {
    if (!nextOptions.length || nextOptions.some((o) => !o.values.length)) return [];
    const combos = cartesian(nextOptions);
    return combos.map((combo) => {
      const existing = currentVariants.find((v) => {
        const c = v.combination || {};
        return Object.entries(combo).every(([k, val]) => c[k] === val);
      });
      return {
        combination: combo,
        stock: existing?.stock ?? 0,
        price: existing?.price ?? '',
        sku: existing?.sku ?? '',
      };
    });
  };

  const addOption = () => {
    if (!newOptionName.trim()) return;
    if (options.find((o) => o.name === newOptionName.trim())) {
      toast.error('Option này đã tồn tại');
      return;
    }
    const nextOpts = [...options, { name: newOptionName.trim(), values: [] }];
    const nextVars = regenerateVariants(nextOpts, variants);
    setOptions(nextOpts);
    setVariants(nextVars);
    setNewOptionName('');
    notify(nextOpts, nextVars);
  };

  const removeOption = (optName) => {
    const nextOpts = options.filter((o) => o.name !== optName);
    const nextVars = regenerateVariants(nextOpts, variants);
    setOptions(nextOpts);
    setVariants(nextVars);
    notify(nextOpts, nextVars);
  };

  const addValue = (optName) => {
    const val = (newValues[optName] || '').trim();
    if (!val) return;
    const nextOpts = options.map((o) =>
      o.name === optName && !o.values.includes(val)
        ? { ...o, values: [...o.values, val] }
        : o,
    );
    const nextVars = regenerateVariants(nextOpts, variants);
    setOptions(nextOpts);
    setVariants(nextVars);
    setNewValues((prev) => ({ ...prev, [optName]: '' }));
    notify(nextOpts, nextVars);
  };

  const removeValue = (optName, val) => {
    const nextOpts = options.map((o) =>
      o.name === optName ? { ...o, values: o.values.filter((v) => v !== val) } : o,
    );
    const nextVars = regenerateVariants(nextOpts, variants);
    setOptions(nextOpts);
    setVariants(nextVars);
    notify(nextOpts, nextVars);
  };

  const updateVariant = (idx, field, value) => {
    const nextVars = variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v));
    setVariants(nextVars);
    notify(options, nextVars);
  };

  return (
    <div className="space-y-4 border border-amber-100 rounded-xl p-4 bg-amber-50/30">
      <p className="text-xs font-semibold text-gray-700">Biến thể sản phẩm</p>
      <p className="text-[10px] text-gray-400">
        Thêm option (VD: Size, Màu) → thêm giá trị → bảng biến thể sẽ tự tạo ra.
      </p>

      {/* Existing options */}
      {options.map((opt) => (
        <div key={opt.name} className="space-y-2 bg-white rounded-xl p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-800">{opt.name}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!opt.hasImages}
                  onChange={() => toggleHasImages(opt.name)}
                  className="accent-amber-500 w-3.5 h-3.5"
                />
                <span className="text-[10px] text-gray-500">Có ảnh riêng</span>
              </label>
              <button
                type="button"
                onClick={() => removeOption(opt.name)}
                className="text-[10px] text-red-400 hover:text-red-600"
              >
                Xoá option
              </button>
            </div>
          </div>

          {/* Values — hiển thị dạng grid khi có ảnh */}
          {opt.hasImages ? (
            <div className="grid grid-cols-3 gap-2">
              {opt.values.map((v) => {
                const imgUrl = opt.valueImages?.[v];
                const key = `${opt.name}__${v}`;
                const isUploading = !!uploadingImg[key];
                return (
                  <div key={v} className="border border-gray-100 rounded-xl p-2 space-y-1.5 text-center">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50">
                      {imgUrl ? (
                        <>
                          <img src={imgUrl} alt={v} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeValueImage(opt.name, v)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <label className={`flex flex-col items-center justify-center h-full cursor-pointer text-gray-400 hover:text-amber-500 transition ${isUploading ? 'pointer-events-none' : ''}`}>
                          <span className="text-lg">{isUploading ? '…' : '+'}</span>
                          <span className="text-[9px]">{isUploading ? 'Đang tải' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) uploadValueImage(opt.name, v, f);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] text-gray-700 truncate flex-1">{v}</span>
                      <button
                        type="button"
                        onClick={() => removeValue(opt.name, v)}
                        className="text-[10px] text-red-400 hover:text-red-600 leading-none flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {opt.values.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 text-[11px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full"
                >
                  {v}
                  <button
                    type="button"
                    onClick={() => removeValue(opt.name, v)}
                    className="text-amber-400 hover:text-red-500 leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newValues[opt.name] || ''}
              onChange={(e) => setNewValues((p) => ({ ...p, [opt.name]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addValue(opt.name))}
              placeholder="+ giá trị"
              className="text-[11px] border border-dashed border-gray-300 rounded-full px-2 py-0.5 w-24 outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => addValue(opt.name)}
              className="text-[11px] text-amber-600 font-medium"
            >
              Thêm
            </button>
          </div>
        </div>
      ))}

      {/* Add new option */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newOptionName}
          onChange={(e) => setNewOptionName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
          placeholder="Tên option (VD: Size, Màu, Tuổi vàng)"
          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-amber-400"
        />
        <button
          type="button"
          onClick={addOption}
          className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-medium"
        >
          + Option
        </button>
      </div>

      {/* Variants table */}
      {variants.length > 0 && (
        <div className="overflow-x-auto">
          <p className="text-[10px] text-gray-500 mb-2">
            {variants.length} biến thể — điền giá và tồn kho cho từng biến thể:
          </p>
          <table className="w-full text-xs border border-gray-100 rounded-xl overflow-hidden">
            <thead className="bg-gray-50 text-[10px] text-gray-500">
              <tr>
                <th className="text-left px-3 py-2">Biến thể</th>
                <th className="text-left px-3 py-2">Giá (₫)</th>
                <th className="text-left px-3 py-2">Tồn kho</th>
                <th className="text-left px-3 py-2">SKU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {variants.map((v, idx) => {
                const label = Object.entries(v.combination).map(([k, val]) => `${k}: ${val}`).join(' / ');
                return (
                  <tr key={label}>
                    <td className="px-3 py-2 text-gray-700 font-medium whitespace-nowrap">{label}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                        placeholder="để trống = giá gốc"
                        className="w-28 border border-gray-200 rounded-lg px-2 py-1 text-[11px] outline-none focus:border-amber-400"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={v.stock}
                        min={0}
                        onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-[11px] outline-none focus:border-amber-400"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                        placeholder="SKU-001"
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-[11px] outline-none focus:border-amber-400"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── Form Modal ─── */
const ProductForm = ({ initial, categories, onClose }) => {
  const qc = useQueryClient();
  const isEdit = !!initial;
  const [finalImages, setFinalImages] = useState(initial?.images || []);
  const [variantData, setVariantData] = useState({
    options: initial?.options || [],
    variants: initial?.variants || [],
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: initial?.name || '',
      description: initial?.description || '',
      price: initial?.price || '',
      salePrice: initial?.salePrice || '',
      stock: initial?.stock || '',
      material: initial?.material || '',
      gemstone: initial?.gemstone || '',
      weight: initial?.weight || '',
      materialDetail: initial?.materialDetail || '',
      category: initial?.category?._id || initial?.category || '',
      isActive: initial?.isActive ?? true,
      isFeatured: initial?.isFeatured ?? false,
      tags: initial?.tags?.join(',') || '',
    },
  });

  const createMut = useMutation({
    mutationFn: adminCreateProduct,
    onSuccess: () => qc.invalidateQueries(['adminProducts']),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => adminUpdateProduct(id, data),
    onSuccess: () => qc.invalidateQueries(['adminProducts']),
  });

  const onSubmit = async (values) => {
    const hasVariants = variantData.options.length > 0 && variantData.variants.length > 0;
    const totalStock = hasVariants
      ? variantData.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0)
      : Number(values.stock);

    const payload = {
      ...values,
      price: Number(values.price),
      salePrice: values.salePrice ? Number(values.salePrice) : undefined,
      stock: totalStock,
      weight: values.weight ? Number(values.weight) : undefined,
      tags: values.tags ? values.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      images: finalImages,
      options: hasVariants ? variantData.options : [],
      variants: hasVariants
        ? variantData.variants.map((v) => ({
            combination: v.combination,
            stock: Number(v.stock) || 0,
            price: v.price ? Number(v.price) : undefined,
            sku: v.sku || undefined,
          }))
        : [],
    };
    try {
      if (isEdit) {
        await updateMut.mutateAsync({ id: initial._id, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      toast.success(isEdit ? 'Cập nhật thành công' : 'Tạo sản phẩm thành công');
      onClose();
    } catch {
      toast.error('Có lỗi xảy ra!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-sm">
          {/* Images */}
          <div>
            <label className="text-gray-600 text-xs font-medium mb-2 block">
              Hình ảnh sản phẩm
            </label>
            <ImageManager existingImages={initial?.images || []} onChange={setFinalImages} />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="text-gray-600 text-xs font-medium mb-1 block">Tên sản phẩm *</label>
            <input
              {...register('name', { required: true })}
              className={`w-full border rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="Nhẫn vàng 18K"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1 block">Giá *</label>
              <input
                {...register('price', { required: true })}
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
                placeholder="1500000"
              />
            </div>
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1 block">Giá khuyến mãi</label>
              <input
                {...register('salePrice')}
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
                placeholder="1200000"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">
              Tồn kho
              {variantData.options.length > 0 && (
                <span className="ml-1 text-[10px] text-amber-500 font-normal">(tự tính từ variants)</span>
              )}
            </label>
            <input
              {...register('stock')}
              type="number"
              disabled={variantData.options.length > 0}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1 block">Danh mục</label>
              <select
                {...register('category')}
                className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
              >
                <option value="">-- Chọn --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1 block">Chất liệu *</label>
              <input
                {...register('material', { required: true })}
                list="material-list"
                className={`w-full border rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition ${errors.material ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="VD: Vàng 18K, Bạc 925..."
              />
              <datalist id="material-list">
                {MATERIAL_SUGGESTIONS.map((m) => <option key={m} value={m} />)}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1 block">Đá quý</label>
              <input
                {...register('gemstone')}
                list="gemstone-list"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
                placeholder="Diamond, Ruby..."
              />
              <datalist id="gemstone-list">
                {['Kim cương', 'Kim cương nhân tạo CVD', 'Moissanite', 'Ruby', 'Sapphire', 'Emerald',
                  'Topaz', 'Amethyst', 'Ngọc trai', 'Ngọc trai nước ngọt', 'Cubic Zirconia', 'Moonstone',
                  'Opal', 'Garnet', 'Tourmaline'].map((g) => <option key={g} value={g} />)}
              </datalist>
            </div>
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1 block">Trọng lượng (g)</label>
              <input
                {...register('weight')}
                type="number"
                step="0.1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">
              Thông tin chất liệu
              <span className="ml-1 font-normal text-gray-400">(hiển thị trong tab Chất liệu ở trang sản phẩm)</span>
            </label>
            <textarea
              {...register('materialDetail')}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition resize-none"
              placeholder="VD: Vàng 18K độ tinh khiết 75%, đã qua kiểm định chất lượng. Bảo quản bằng khăn mềm, tránh tiếp xúc hoá chất. Bảo hành 12 tháng."
            />
          </div>

          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Tags (cách dấu ,)</label>
            <input
              {...register('tags')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
              placeholder="necklace, wedding, gold"
            />
          </div>

          {/* Variant Manager */}
          <VariantManager
            initialOptions={initial?.options || []}
            initialVariants={initial?.variants || []}
            onChange={setVariantData}
          />

          <div>
            <label className="text-gray-600 text-xs font-medium mb-1 block">Mô tả</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition resize-none"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="accent-amber-500 w-4 h-4" />
              <span className="text-xs text-gray-600">Đang bán</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="accent-amber-500 w-4 h-4" />
              <span className="text-xs text-gray-600">Nổi bật</span>
            </label>
          </div>

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
              disabled={isSubmitting}
              className="px-5 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition disabled:opacity-60"
            >
              {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Toggle Switch ─── */
const Toggle = ({ on, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{ backgroundColor: on ? '#34d399' : '#e5e7eb' }}
    className="w-9 h-5 rounded-full relative transition-all duration-200 shrink-0"
  >
    <span
      style={{ transform: on ? 'translateX(16px)' : 'translateX(2px)' }}
      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 block"
    />
  </button>
);

/* ─── Main page ─── */
const ProductsPage = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: catRes } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: adminGetCategories,
  });
  const categories = catRes?.data?.data || catRes?.data || [];

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', page, search, categoryFilter],
    queryFn: () =>
      adminGetProducts({
        page,
        limit: 10,
        search: search || undefined,
        category: categoryFilter || undefined,
      }),
    keepPreviousData: true,
  });

  const products = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  const deleteMut = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => { qc.invalidateQueries(['adminProducts']); toast.success('Đã xoá sản phẩm'); },
    onError: () => toast.error('Xoá thất bại'),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, data }) => adminUpdateProduct(id, data),
    onSuccess: () => qc.invalidateQueries(['adminProducts']),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Sản phẩm</h1>
          <p className="text-xs text-gray-400 mt-0.5">{pagination.total || 0} sản phẩm</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm tên sản phẩm..."
          className="flex-1 border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs text-gray-400 font-medium">
              <th className="text-left px-4 py-3">Sản phẩm</th>
              <th className="text-left py-3 pr-4">Giá</th>
              <th className="text-left py-3 pr-4">Tồn</th>
              <th className="text-left py-3 pr-4">Đang bán</th>
              <th className="text-left py-3 pr-4">Nổi bật</th>
              <th className="text-right py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Đang tải...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Không có sản phẩm nào.</td></tr>
            ) : products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50/50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-xl shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center text-gray-300 text-lg">
                        ◻
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category?.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  {p.salePrice ? (
                    <div>
                      <p className="font-medium text-amber-600">{fmt(p.salePrice)}</p>
                      <p className="text-xs text-gray-400 line-through">{fmt(p.price)}</p>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-700">{fmt(p.price)}</p>
                  )}
                </td>
                <td className="py-3 pr-4 text-gray-600">{p.stock}</td>
                <td className="py-3 pr-4">
                  <Toggle on={p.isActive} onClick={() => toggleMut.mutate({ id: p._id, data: { isActive: !p.isActive } })} />
                </td>
                <td className="py-3 pr-4">
                  <Toggle on={p.isFeatured} onClick={() => toggleMut.mutate({ id: p._id, data: { isFeatured: !p.isFeatured } })} />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditing(p); setShowForm(true); }}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => window.confirm('Xoá sản phẩm này?') && deleteMut.mutate(p._id)}
                      className="px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 text-xs transition"
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 text-xs rounded-lg border transition ${
                p === page
                  ? 'bg-amber-500 border-amber-500 text-white font-semibold'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          initial={editing}
          categories={categories}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
};

export default ProductsPage;
