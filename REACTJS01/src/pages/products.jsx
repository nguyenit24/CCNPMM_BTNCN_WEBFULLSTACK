import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Empty, Select, Slider, Spin, Tag, notification } from 'antd';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/catalog/product-card';
import { getProductsApi } from '../util/api';

const sortOptions = [
    { value: 'featured', label: 'Nổi bật' },
    { value: 'popular', label: 'Bán chạy' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'priceAsc', label: 'Giá tăng dần' },
    { value: 'priceDesc', label: 'Giá giảm dần' },
];

const statusOptions = [
    { value: 'inStock', label: 'Còn hàng' },
    { value: 'bestSeller', label: 'Bán chạy' },
    { value: 'onSale', label: 'Khuyến mãi' },
    { value: 'isNew', label: 'Hàng mới' },
    { value: 'featured', label: 'Nổi bật' },
];

const ProductsPage = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState(['inStock']);
    const [priceRange, setPriceRange] = useState([0, 400]);
    const [sortValue, setSortValue] = useState('featured');

    useEffect(() => {
        const nextKeyword = searchParams.get('q') ?? '';
        const nextCategories = (searchParams.get('category') ?? '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        const nextStatuses = [];

        if ((searchParams.get('inStock') ?? 'true') !== 'false') {
            nextStatuses.push('inStock');
        }

        ['bestSeller', 'onSale', 'isNew', 'featured'].forEach((flag) => {
            const value = searchParams.get(flag);
            if (value === 'true' || value === '1') {
                nextStatuses.push(flag);
            }
        });

        const nextSort = searchParams.get('sort');

        setKeyword(nextKeyword);
        setSelectedCategories(nextCategories);
        setSelectedStatuses(nextStatuses.length > 0 ? nextStatuses : ['inStock']);
        setSortValue(sortOptions.some((option) => option.value === nextSort) ? nextSort : 'featured');
    }, [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);

            const filters = {
                q: keyword,
                category: selectedCategories.join(','),
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                sort: sortValue,
                inStock: selectedStatuses.includes('inStock'),
                bestSeller: selectedStatuses.includes('bestSeller'),
                onSale: selectedStatuses.includes('onSale'),
                isNew: selectedStatuses.includes('isNew'),
                featured: selectedStatuses.includes('featured'),
                limit: 24,
            };

            const res = await getProductsApi(filters);

            if (res?.message && res.message !== 'Đã xảy ra lỗi máy chủ') {
                notification.error({
                    message: 'Lấy danh sách sản phẩm',
                    description: res.message,
                });
            }

            const nextItems = Array.isArray(res?.items) ? res.items : [];
            const nextCategories = Array.isArray(res?.categories) ? res.categories : [];
            const nextTotal = typeof res?.total === 'number' ? res.total : nextItems.length;

            setItems(nextItems);
            setCategories(nextCategories);
            setTotal(nextTotal);
            setLoading(false);
        };

        fetchProducts();
    }, [keyword, priceRange, selectedCategories, selectedStatuses, sortValue]);

    const categoryOptions = useMemo(() => categories.map((category) => ({
        label: category.name,
        value: category.slug,
    })), [categories]);

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedStatuses(['inStock']);
        setPriceRange([0, 400]);
        setSortValue('featured');
    };

    const hasActiveFilters = Boolean(
        keyword ||
        selectedCategories.length > 0 ||
        priceRange[0] > 0 ||
        priceRange[1] < 400 ||
        selectedStatuses.length > 1 ||
        (selectedStatuses.length === 1 && !selectedStatuses.includes('inStock'))
    );

    return (
        <div className="store-layout">
            {hasActiveFilters && (
                <div className="product-active-filters">
                    <div className="product-active-filters__container">
                        <span className="product-active-filters__label">Bộ lọc đang áp dụng:</span>
                        <div className="product-active-filters__list">
                            {keyword && <Tag closable onClose={() => setKeyword('')}>Từ khóa: {keyword}</Tag>}
                            {selectedCategories.map(cat => (
                                <Tag key={cat} closable onClose={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}>
                                    {categories.find(c => c.slug === cat)?.name || cat}
                                </Tag>
                            ))}
                            {(priceRange[0] > 0 || priceRange[1] < 400) && (
                                <Tag closable onClose={() => setPriceRange([0, 400])}>
                                    Giá: ${priceRange[0]} - ${priceRange[1]}
                                </Tag>
                            )}
                            {selectedStatuses.map(status => {
                                const statusLabel = statusOptions.find(s => s.value === status)?.label;
                                return statusLabel ? (
                                    <Tag key={status} closable onClose={() => {
                                        const nextStatuses = selectedStatuses.filter(s => s !== status);
                                        setSelectedStatuses(nextStatuses.length > 0 ? nextStatuses : ['inStock']);
                                    }}>
                                        {statusLabel}
                                    </Tag>
                                ) : null;
                            })}
                        </div>
                        <Button type="link" danger size="small" onClick={clearFilters}>
                            Xóa tất cả
                        </Button>
                    </div>
                </div>
            )}

            <div className="product-page">
                <aside className="product-filter">
                    <div className="product-filter__section">
                        <div className="product-filter__title">Giá</div>
                        <Slider range min={0} max={400} step={5} value={priceRange} onChange={setPriceRange} />
                        <div className="product-filter__range">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                        </div>
                    </div>

                    <div className="product-filter__section">
                        <div className="product-filter__title">Danh mục</div>
                        <Checkbox.Group
                            className="product-filter__group"
                            options={categoryOptions}
                            value={selectedCategories}
                            onChange={setSelectedCategories}
                        />
                    </div>

                    <div className="product-filter__section">
                        <div className="product-filter__title">Trạng thái</div>
                        <Checkbox.Group
                            className="product-filter__group"
                            options={statusOptions}
                            value={selectedStatuses}
                            onChange={setSelectedStatuses}
                        />
                    </div>

                    <button type="button" className="store-filter-reset" onClick={clearFilters}>
                        Xóa bộ lọc
                    </button>
                </aside>

                <section className="product-content">
                    <div className="product-toolbar">
                        <div className="product-toolbar__summary">Hiển thị {items.length} / {total} sản phẩm</div>
                        <Select className="product-toolbar__sort" value={sortValue} options={sortOptions} onChange={setSortValue} />
                    </div>

                    {loading ? (
                        <div className="store-loading">
                            <Spin size="large" />
                        </div>
                    ) : items.length > 0 ? (
                        <div className="store-grid--3">
                            {items.map((product) => (
                                <ProductCard key={product.slug} product={product} />
                            ))}
                        </div>
                    ) : (
                        <Empty description="Không có sản phẩm phù hợp" />
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProductsPage;