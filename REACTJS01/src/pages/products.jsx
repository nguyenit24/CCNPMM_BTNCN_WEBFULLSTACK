import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Empty, Select, Slider, Spin, Tag, notification } from 'antd';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/catalog/product-card';
import { getProductsApi } from '../util/api';

const parseQueryCategories = (searchParams) => (searchParams.get('category') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseQueryStatuses = (searchParams) => {
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

    return nextStatuses.length > 0 ? nextStatuses : ['inStock'];
};

const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'popular', label: 'Best selling' },
    { value: 'newest', label: 'Newest' },
    { value: 'priceAsc', label: 'Price: Low to High' },
    { value: 'priceDesc', label: 'Price: High to Low' },
];

const statusOptions = [
    { value: 'inStock', label: 'In stock' },
    { value: 'bestSeller', label: 'Best seller' },
    { value: 'onSale', label: 'Sale' },
    { value: 'isNew', label: 'New arrivals' },
    { value: 'featured', label: 'Featured' },
];

const PAGE_LIMIT = 10;

const ProductsPage = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
    const [selectedCategories, setSelectedCategories] = useState(() => parseQueryCategories(searchParams));
    const [selectedStatuses, setSelectedStatuses] = useState(() => parseQueryStatuses(searchParams));
    const [priceRange, setPriceRange] = useState([0, 400]);
    const [sortValue, setSortValue] = useState(() => {
        const nextSort = searchParams.get('sort');
        return sortOptions.some((option) => option.value === nextSort) ? nextSort : 'featured';
    });
    const loadMoreRef = useRef(null);
    const requestIdRef = useRef(0);
    const pendingFilterResetRef = useRef(false);

    const filtersKey = useMemo(() => JSON.stringify({
        keyword,
        priceRange,
        selectedCategories,
        selectedStatuses,
        sortValue,
    }), [keyword, priceRange, selectedCategories, selectedStatuses, sortValue]);

    useEffect(() => {
        const nextKeyword = searchParams.get('q') ?? '';
        const nextCategories = parseQueryCategories(searchParams);
        const nextStatuses = parseQueryStatuses(searchParams);
        const nextSort = searchParams.get('sort');

        setKeyword(nextKeyword);
        setSelectedCategories(nextCategories);
        setSelectedStatuses(nextStatuses);
        setSortValue(sortOptions.some((option) => option.value === nextSort) ? nextSort : 'featured');
    }, [searchParams]);

    useEffect(() => {
        pendingFilterResetRef.current = true;
        setPage(1);
        setItems([]);
        setTotal(0);
        setHasMore(true);
    }, [filtersKey]);

    useEffect(() => {
        const requestId = ++requestIdRef.current;

        const fetchProducts = async () => {
            if (pendingFilterResetRef.current && page !== 1) {
                return;
            }

            if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

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
                limit: PAGE_LIMIT,
                page,
            };

            const res = await getProductsApi(filters);

            if (requestId !== requestIdRef.current) {
                return;
            }

            if (res?.message && res.message !== 'Đã xảy ra lỗi máy chủ') {
                notification.error({
                    message: 'Load products',
                    description: res.message,
                });
            }

            const nextItems = Array.isArray(res?.items) ? res.items : [];
            const nextCategories = Array.isArray(res?.categories) ? res.categories : [];
            const nextTotal = typeof res?.total === 'number' ? res.total : nextItems.length;

            setItems((prevItems) => {
                const mergedItems = page === 1 ? nextItems : [...prevItems, ...nextItems];
                setHasMore(mergedItems.length < nextTotal && nextItems.length > 0);
                return mergedItems;
            });
            setCategories(nextCategories);
            setTotal(nextTotal);
            pendingFilterResetRef.current = false;
            setLoading(false);
            setLoadingMore(false);
        };

        fetchProducts();
    }, [filtersKey, page]);

    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || loading || loadingMore) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore) {
                    setPage((prevPage) => prevPage + 1);
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore]);

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
                        <span className="product-active-filters__label">Active filters:</span>
                        <div className="product-active-filters__list">
                            {keyword && <Tag closable onClose={() => setKeyword('')}>Keyword: {keyword}</Tag>}
                            {selectedCategories.map(cat => (
                                <Tag key={cat} closable onClose={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}>
                                    {categories.find(c => c.slug === cat)?.name || cat}
                                </Tag>
                            ))}
                            {(priceRange[0] > 0 || priceRange[1] < 400) && (
                                <Tag closable onClose={() => setPriceRange([0, 400])}>
                                    Price: ${priceRange[0]} - ${priceRange[1]}
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
                            Clear all
                        </Button>
                    </div>
                </div>
            )}

            <div className="product-page">
                <aside className="product-filter">
                    <div className="product-filter__section">
                        <div className="product-filter__title">Price</div>
                        <Slider range min={0} max={400} step={5} value={priceRange} onChange={setPriceRange} />
                        <div className="product-filter__range">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                        </div>
                    </div>

                    <div className="product-filter__section">
                        <div className="product-filter__title">Category</div>
                        <Checkbox.Group
                            className="product-filter__group"
                            options={categoryOptions}
                            value={selectedCategories}
                            onChange={setSelectedCategories}
                        />
                    </div>

                    <div className="product-filter__section">
                        <div className="product-filter__title">Status</div>
                        <Checkbox.Group
                            className="product-filter__group"
                            options={statusOptions}
                            value={selectedStatuses}
                            onChange={setSelectedStatuses}
                        />
                    </div>

                    <button type="button" className="store-filter-reset" onClick={clearFilters}>
                        Reset filters
                    </button>
                </aside>

                <section className="product-content">
                    <div className="product-toolbar">
                        <div className="product-toolbar__summary">Showing {items.length} / {total} products</div>
                        <Select className="product-toolbar__sort" value={sortValue} options={sortOptions} onChange={setSortValue} />
                    </div>

                    {loading ? (
                        <div className="store-loading">
                            <Spin size="large" />
                        </div>
                    ) : items.length > 0 ? (
                        <>
                            <div className="store-grid--3">
                                {items.map((product) => (
                                    <ProductCard key={product.slug} product={product} />
                                ))}
                            </div>
                            <div ref={loadMoreRef} className="product-load-more">
                                {loadingMore ? (
                                    <Spin />
                                ) : hasMore ? (
                                    <span>Scroll down to load more products</span>
                                ) : (
                                    <span>All products loaded</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <Empty description="No matching products" />
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProductsPage;