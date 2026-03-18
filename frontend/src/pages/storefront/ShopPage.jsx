import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories } from '../../services/productService.js';
import ProductCard from '../../components/product/ProductCard.jsx';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
  });

  const applySearchParams = (next) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const {
    data: productsRes,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['products', { page, sort, ...filters }],
    queryFn: () =>
      fetchProducts({
        page,
        limit: 12,
        sort,
        search: filters.search || undefined,
        category: filters.category || undefined,
      }),
    keepPreviousData: true,
  });

  const categories = categoriesRes?.data?.data || [];
  const products = productsRes?.data?.data || [];
  const pagination = productsRes?.data?.pagination;

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    setPage(1);
    applySearchParams({ ...nextFilters, page: 1, sort });
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
    applySearchParams({ ...filters, page: 1, sort: value });
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    applySearchParams({ ...filters, page: nextPage, sort });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-10 space-y-5">
      {/* Top bar: title + search + sort */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-600 mb-1">
            Cửa hàng
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Bộ sưu tập trang sức
          </h1>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 text-xs w-full md:w-auto">
          <div className="flex-1 md:flex-none md:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sắp xếp:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="-createdAt">Mới nhất</option>
              <option value="-sold">Bán chạy</option>
              <option value="price">Giá tăng dần</option>
              <option value="-price">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-[11px]">
        <button
          type="button"
          onClick={() => handleFilterChange('category', '')}
          className={`px-3 py-1.5 rounded-full border ${
            !filters.category
              ? 'border-amber-500 bg-amber-50 text-amber-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => handleFilterChange('category', cat.slug)}
            className={`px-3 py-1.5 rounded-full border whitespace-nowrap ${
              filters.category === cat.slug
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product list */}
      <section className="space-y-4">
        {isLoading && (
          <p className="text-xs text-slate-500">Đang tải sản phẩm, vui lòng chờ...</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {products.length === 0 && !isLoading && (
          <p className="text-xs text-slate-400 mt-4">
            Không tìm thấy sản phẩm nào phù hợp bộ lọc hiện tại.
          </p>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4 text-xs">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isFetching}
              className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              Trước
            </button>
            <span className="text-slate-500">
              Trang {page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages || isFetching}
              className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              Sau
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ShopPage;

