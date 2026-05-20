import { useEffect, useRef, useState } from 'react';
import { Button, Card, Carousel, Empty, Spin, Tag, notification } from 'antd';
import { FireOutlined, LeftOutlined, RightOutlined, StarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getHomeApi, getTopProductsApi } from '../util/api';
import ProductCard from '../components/catalog/product-card';
import PostCard from '../components/catalog/post-card';

const TOP_PAGE_SIZE = 10;

const SectionHeader = ({ eyebrow, title, subtitle, action, actionLabel }) => (
    <div className="store-section__head" style={{ marginBottom: 20 }}>
        <div>
            {eyebrow && (
                <div className="store-page-head__eyebrow">
                    {eyebrow}
                </div>
            )}
            <h2 className="store-section__title">{title}</h2>
            {subtitle && <p className="store-section__subtitle">{subtitle}</p>}
        </div>
        {action && (
            <Button onClick={action} style={{ borderRadius: 999, fontWeight: 700 }}>
                {actionLabel || 'Xem tất cả'}
            </Button>
        )}
    </div>
);

const TopProductsSection = ({ eyebrow, title, subtitle, items, loading, railRef, onScrollLeft, onScrollRight }) => (
    <section className="store-section">
        <div className="store-section__head store-section__head--pager" style={{ marginBottom: 20 }}>
            <div>
                {eyebrow && <div className="store-page-head__eyebrow">{eyebrow}</div>}
                <h2 className="store-section__title">{title}</h2>
                {subtitle && <p className="store-section__subtitle">{subtitle}</p>}
            </div>
            <div className="store-section__controls">
                <Button aria-label={`Scroll ${title} left`} icon={<LeftOutlined />} onClick={onScrollLeft} style={{ borderRadius: 999 }} />
                <Button aria-label={`Scroll ${title} right`} icon={<RightOutlined />} onClick={onScrollRight} style={{ borderRadius: 999 }} />
            </div>
        </div>

        {loading ? (
            <div className="store-loading">
                <Spin size="large" />
            </div>
        ) : items.length > 0 ? (
            <div className="store-horizontal-rail" ref={railRef}>
                {items.map((product) => (
                    <ProductCard key={product.slug} product={product} compact />
                ))}
            </div>
        ) : (
            <Empty description="Chưa có dữ liệu" />
        )}
    </section>
);

const HomePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [topBestSeller, setTopBestSeller] = useState({ items: [], total: 0 });
    const [topMostViewed, setTopMostViewed] = useState({ items: [], total: 0 });
    const [topBestSellerLoading, setTopBestSellerLoading] = useState(false);
    const [topMostViewedLoading, setTopMostViewedLoading] = useState(false);
    const bestSellerRailRef = useRef(null);
    const mostViewedRailRef = useRef(null);

    const scrollRail = (ref, direction) => {
        const rail = ref.current;
        if (!rail) return;
        const cardWidth = rail.querySelector('.catalog-product-card')?.getBoundingClientRect().width || 280;
        rail.scrollBy({ left: direction * (cardWidth + 20) * 2, behavior: 'smooth' });
    };

    const fetchTopProducts = async (type, setState, setLoadingState) => {
        setLoadingState(true);
        const res = await getTopProductsApi({ type, page: 1, limit: TOP_PAGE_SIZE });
        const hasError = Boolean(res?.message);
        if (hasError && res.message !== 'Đã xảy ra lỗi máy chủ') {
            notification.error({ message: 'Tải sản phẩm', description: res.message });
        }
        const nextItems = Array.isArray(res?.items) ? res.items : [];
        const nextTotal = typeof res?.total === 'number' ? res.total : nextItems.length;
        setState({ items: hasError ? [] : nextItems, total: hasError ? 0 : nextTotal });
        setLoadingState(false);
    };

    useEffect(() => {
        const fetchHome = async () => {
            setLoading(true);
            const res = await getHomeApi();
            const hasError = Boolean(res?.message);
            if (hasError && res.message !== 'Đã xảy ra lỗi máy chủ') {
                notification.error({ message: 'Tải trang chủ', description: res.message });
            }
            setData(hasError ? null : res);
            setLoading(false);
        };
        fetchHome();
        fetchTopProducts('bestSeller', setTopBestSeller, setTopBestSellerLoading);
        fetchTopProducts('mostViewed', setTopMostViewed, setTopMostViewedLoading);
    }, []);

    if (loading) {
        return (
            <div className="store-layout store-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!data) return null;

    const promotions = Array.isArray(data.promotions) ? data.promotions : [];
    const heroSlides = promotions.length > 0 ? promotions : [data.heroPromotion].filter(Boolean);

    return (
        <div className="home-page-wrapper">
            <div className="home-container">
                {/* Hero Banner Carousel - Constrained within the container for perfect design */}
                <section className="store-hero store-hero--solo">
                    <div className="store-hero__panel">
                        <Carousel autoplay dots autoplaySpeed={4500}>
                            {heroSlides.map((promo) => (
                                <div
                                    key={promo.slug}
                                    className="store-hero__slide"
                                    style={{ backgroundImage: `url(${promo.banner})` }}
                                >
                                    <div className="store-hero__content-overlay">
                                        <div className="store-hero__content">
                                            <div className="store-hero__eyebrow">
                                                <ThunderboltOutlined />
                                                {promo.badge}
                                            </div>
                                            <h1 className="store-hero__title">{promo.title}</h1>
                                            <p className="store-hero__description">{promo.description}</p>
                                            <p className="store-hero__description">{promo.highlight}</p>
                                            <div className="store-hero__actions">
                                                <Button type="primary" size="large" onClick={() => navigate('/products')} style={{ borderRadius: 999, fontWeight: 700 }}>
                                                    Khám phá ngay
                                                </Button>
                                                <Button size="large" onClick={() => navigate('/products?onSale=true')}
                                                    style={{ borderRadius: 999, fontWeight: 700, borderColor: 'rgba(255,255,255,0.4)', color: '#fff', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                                                    Xem khuyến mãi
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </section>

                {/* Featured Promotions */}
                {promotions.length > 0 && (
                    <section className="store-section">
                        <SectionHeader
                            eyebrow={<><ThunderboltOutlined /> Ưu đãi nổi bật</>}
                            title="Khuyến mãi đặc biệt"
                            subtitle="Những deal hấp dẫn dành riêng cho thành viên tuần này."
                            action={() => navigate('/products?onSale=true')}
                            actionLabel="Xem tất cả"
                        />
                        <div className="store-grid--3">
                            {promotions.map((promotion) => (
                                <Card
                                    key={promotion.slug}
                                    bordered={false}
                                    hoverable
                                    className="home-promotion-card"
                                    styles={{ body: { padding: 20 } }}
                                >
                                    <div className="home-promotion-card__media">
                                        <img
                                            src={promotion.banner}
                                            alt={promotion.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="home-promotion-card__body">
                                        <Tag color="blue" style={{ marginBottom: 8, alignSelf: 'flex-start' }}>{promotion.badge}</Tag>
                                        <h3 className="home-promotion-card__title">{promotion.title}</h3>
                                        <p className="home-promotion-card__excerpt">{promotion.highlight}</p>
                                        <Button type="primary" size="small" onClick={() => navigate('/products?onSale=true')}
                                            style={{ borderRadius: 999, fontWeight: 700, alignSelf: 'flex-start' }}>
                                            {promotion.buttonLabel || 'Mua ngay'}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Shop by Category */}
                <section className="store-section">
                    <SectionHeader
                        eyebrow={<><StarOutlined /> Danh mục</>}
                        title="Mua sắm theo danh mục"
                        subtitle="Các danh mục được chọn lọc kỹ càng cho cửa hàng công nghệ."
                        action={() => navigate('/products')}
                        actionLabel="Xem tất cả"
                    />
                    <div className="home-categories-grid">
                        {data.categories?.map((category) => (
                            <div
                                key={category.slug}
                                className="home-category-item"
                                onClick={() => navigate(`/products?category=${category.slug}`)}
                            >
                                <div className="home-category-item__media">
                                    <img src={category.image} alt={category.name} className="home-category-item__image" />
                                </div>
                                <h3 className="home-category-item__name">{category.name}</h3>
                                <p className="home-category-item__desc">{category.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Newest Drops */}
                <section className="store-section">
                    <SectionHeader
                        eyebrow={<><ThunderboltOutlined /> Mới nhất</>}
                        title="Hàng mới về"
                        subtitle="Những sản phẩm mới nhất vừa ra mắt."
                        action={() => navigate('/products?sort=newest')}
                        actionLabel="Xem tất cả"
                    />
                    <div className="store-grid--4">
                        {data.newestProducts?.map((product) => (
                            <ProductCard key={product.slug} product={product} />
                        ))}
                    </div>
                </section>

                {/* Top Best Sellers */}
                <TopProductsSection
                    eyebrow={<><FireOutlined /> Bán chạy</>}
                    title="Top 10 bán chạy nhất"
                    subtitle="Sản phẩm được mua nhiều nhất tuần này."
                    items={topBestSeller.items}
                    loading={topBestSellerLoading}
                    railRef={bestSellerRailRef}
                    onScrollLeft={() => scrollRail(bestSellerRailRef, -1)}
                    onScrollRight={() => scrollRail(bestSellerRailRef, 1)}
                />

                {/* Top Most Viewed */}
                <TopProductsSection
                    eyebrow={<><StarOutlined /> Nổi bật</>}
                    title="Top 10 xem nhiều nhất"
                    subtitle="Những sản phẩm được xem nhiều nhất."
                    items={topMostViewed.items}
                    loading={topMostViewedLoading}
                    railRef={mostViewedRailRef}
                    onScrollLeft={() => scrollRail(mostViewedRailRef, -1)}
                    onScrollRight={() => scrollRail(mostViewedRailRef, 1)}
                />

                {/* Latest Posts */}
                <section className="store-section" style={{ marginBottom: 40 }}>
                    <SectionHeader
                        eyebrow="📰 Tin tức"
                        title="Bài viết mới nhất"
                        subtitle="Những bài viết ngắn giúp bạn chọn được setup phù hợp."
                        action={() => navigate('/posts')}
                        actionLabel="Xem tất cả"
                    />
                    <div className="store-grid--3">
                        {data.latestPosts?.map((post) => (
                            <PostCard key={post.slug} post={post} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
