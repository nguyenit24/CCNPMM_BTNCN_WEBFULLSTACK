import { useEffect, useRef, useState } from 'react';
import { Button, Card, Carousel, Empty, Spin, Tag, notification } from 'antd';
import { LeftOutlined, RightOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getHomeApi, getTopProductsApi } from '../util/api';
import ProductCard from '../components/catalog/product-card';
import PostCard from '../components/catalog/post-card';

const TOP_PAGE_SIZE = 10;

const TopProductsSection = ({ title, subtitle, items, loading, railRef, onScrollLeft, onScrollRight }) => (
    <section className="store-section">
        <div className="store-section__head store-section__head--pager">
            <div>
                <h2 className="store-section__title">{title}</h2>
                <p className="store-section__subtitle">{subtitle}</p>
            </div>
            <div className="store-section__controls">
                <Button aria-label={`Scroll ${title} left`} icon={<LeftOutlined />} onClick={onScrollLeft} />
                <Button aria-label={`Scroll ${title} right`} icon={<RightOutlined />} onClick={onScrollRight} />
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
            <Empty description="No data yet" />
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
        if (!rail) {
            return;
        }

        const cardWidth = rail.querySelector('.catalog-product-card')?.getBoundingClientRect().width || 280;
        rail.scrollBy({ left: direction * (cardWidth + 20) * 2, behavior: 'smooth' });
    };

    const fetchTopProducts = async (type, setState, setLoadingState) => {
        setLoadingState(true);

        const res = await getTopProductsApi({ type, page: 1, limit: TOP_PAGE_SIZE });
        const hasError = Boolean(res?.message);

        if (hasError && res.message !== 'Đã xảy ra lỗi máy chủ') {
            notification.error({
                message: 'Load products',
                description: res.message,
            });
        }

        const nextItems = Array.isArray(res?.items) ? res.items : [];
        const nextTotal = typeof res?.total === 'number' ? res.total : nextItems.length;

        setState({
            items: hasError ? [] : nextItems,
            total: hasError ? 0 : nextTotal,
        });
        setLoadingState(false);
    };

    useEffect(() => {
        const fetchHome = async () => {
            setLoading(true);

            const res = await getHomeApi();
            const hasError = Boolean(res?.message);

            if (hasError && res.message !== 'Đã xảy ra lỗi máy chủ') {
                notification.error({
                    message: 'Load home data',
                    description: res.message,
                });
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

    if (!data) {
        return null;
    }

    const promotions = Array.isArray(data.promotions) ? data.promotions : [];
    const heroSlides = promotions.length > 0 ? promotions : [data.heroPromotion].filter(Boolean);

    return (
        <div className="store-layout home-page">
            <section className="store-hero store-hero--solo">
                <div className="store-hero__panel">
                    <Carousel autoplay dots>
                        {heroSlides.map((promo) => (
                            <div
                                key={promo.slug}
                                className="store-hero__slide"
                                style={{ backgroundImage: `url(${promo.banner})` }}
                            >
                                <div className="store-hero__content">
                                    <div className="store-hero__eyebrow">
                                        <ThunderboltOutlined />
                                        {promo.badge}
                                    </div>
                                    <h1 className="store-hero__title">{promo.title}</h1>
                                    <p className="store-hero__description">{promo.description}</p>
                                    <p className="store-hero__description">{promo.highlight}</p>
                                    <div className="store-hero__actions">
                                        <Button type="primary" size="large" onClick={() => navigate('/products')}>
                                            Explore products
                                        </Button>
                                        <Button size="large" onClick={() => navigate('/products?onSale=true')}>
                                            View deals
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>
            </section>

            <section className="store-section">
                <div className="store-section__head">
                    <div>
                        <h2 className="store-section__title">Featured promotions</h2>
                        <p className="store-section__subtitle">Featured offers for members this week.</p>
                    </div>
                    <Button onClick={() => navigate('/products?onSale=true')}>View all</Button>
                </div>

                <div className="store-grid--3">
                    {promotions.map((promotion) => (
                        <Card key={promotion.slug} bordered={false}>
                            <img
                                src={promotion.banner}
                                alt={promotion.title}
                                style={{ width: '100%', borderRadius: 20, marginBottom: 14 }}
                            />
                            <Tag color="blue">{promotion.badge}</Tag>
                            <h3>{promotion.title}</h3>
                            <p>{promotion.highlight}</p>
                            <Button type="link" onClick={() => navigate('/products?onSale=true')}>
                                {promotion.buttonLabel}
                            </Button>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="store-section">
                <div className="store-section__head">
                    <div>
                        <h2 className="store-section__title">Shop by Category</h2>
                        <p className="store-section__subtitle">Curated categories for a premium tech store.</p>
                    </div>
                    <Button onClick={() => navigate('/products')}>View all</Button>
                </div>

                <div className="store-grid--4">
                    {data.categories?.map((category) => (
                        <Card
                            key={category.slug}
                            bordered={false}
                            hoverable
                            className="store-category-card"
                            onClick={() => navigate(`/products?category=${category.slug}`)}
                        >
                            <div className="store-category-card__media">
                                <img src={category.image} alt={category.name} className="store-category-card__image" />
                            </div>
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="store-section">
                <div className="store-section__head">
                    <div>
                        <h2 className="store-section__title">Newest Drops</h2>
                        <p className="store-section__subtitle">Latest products for members.</p>
                    </div>
                    <Button onClick={() => navigate('/products?sort=newest')}>View all</Button>
                </div>

                <div className="store-grid--4">
                    {data.newestProducts?.map((product) => (
                        <ProductCard key={product.slug} product={product} />
                    ))}
                </div>
            </section>

            <TopProductsSection
                title="Top 10 best sellers"
                subtitle="The best-selling products this week."
                items={topBestSeller.items}
                loading={topBestSellerLoading}
                railRef={bestSellerRailRef}
                onScrollLeft={() => scrollRail(bestSellerRailRef, -1)}
                onScrollRight={() => scrollRail(bestSellerRailRef, 1)}
            />

            <TopProductsSection
                title="Top 10 most viewed"
                subtitle="The most viewed products."
                items={topMostViewed.items}
                loading={topMostViewedLoading}
                railRef={mostViewedRailRef}
                onScrollLeft={() => scrollRail(mostViewedRailRef, -1)}
                onScrollRight={() => scrollRail(mostViewedRailRef, 1)}
            />

            <section className="store-section">
                <div className="store-section__head">
                    <div>
                        <h2 className="store-section__title">Latest posts</h2>
                        <p className="store-section__subtitle">Short reads to help members choose the right setup.</p>
                    </div>
                    <Button onClick={() => navigate('/posts')}>View all</Button>
                </div>

                <div className="store-grid--3">
                    {data.latestPosts?.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
