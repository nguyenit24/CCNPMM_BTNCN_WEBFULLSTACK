import { useEffect, useState } from 'react';
import { Button, Card, Carousel, Spin, Tag, notification } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getHomeApi } from '../util/api';
import ProductCard from '../components/catalog/product-card';
import PostCard from '../components/catalog/post-card';

const HomePage = () => {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchHome = async () => {
            setLoading(true);

            const res = await getHomeApi();
            const hasError = Boolean(res?.message);

            if (hasError && res.message !== 'Đã xảy ra lỗi máy chủ') {
                notification.error({
                    message: 'Lấy dữ liệu trang chủ',
                    description: res.message,
                });
            }

            setData(hasError ? null : res);
            setLoading(false);
        };

        fetchHome();
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
                                            Khám phá sản phẩm
                                        </Button>
                                        <Button size="large" onClick={() => navigate('/products?onSale=true')}>
                                            Xem deal
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
                        <h2 className="store-section__title">Khuyến mãi nổi bật</h2>
                        <p className="store-section__subtitle">Các ưu đãi chính dành cho member trong tuần này.</p>
                    </div>
                    <Button onClick={() => navigate('/products?onSale=true')}>Xem tất cả</Button>
                </div>

                <div className="store-grid--3">
                    {promotions.map((promotion) => (
                        <Card key={promotion.slug} bordered={false}>
                            <img src={promotion.banner} alt={promotion.title} style={{ width: '100%', borderRadius: 20, marginBottom: 14 }} />
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
                        <p className="store-section__subtitle">Danh mục gọn gàng cho một store high-end tech.</p>
                    </div>
                    <Button onClick={() => navigate('/products')}>View all</Button>
                </div>

                <div className="store-grid--4">
                    {data.categories?.map((category) => (
                        <Card
                            key={category.slug}
                            bordered={false}
                            hoverable
                            onClick={() => navigate(`/products?category=${category.slug}`)}
                        >
                            <img src={category.image} alt={category.name} style={{ width: '100%', borderRadius: 20, marginBottom: 14 }} />
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
                        <p className="store-section__subtitle">Các sản phẩm mới nhất dành cho member.</p>
                    </div>
                    <Button onClick={() => navigate('/products?sort=newest')}>View all</Button>
                </div>

                <div className="store-grid--4">
                    {data.newestProducts?.map((product) => (
                        <ProductCard key={product.slug} product={product} />
                    ))}
                </div>
            </section>

            <section className="store-section">
                <div className="store-section__head">
                    <div>
                        <h2 className="store-section__title">Best Sellers</h2>
                        <p className="store-section__subtitle">Những sản phẩm được bán nhiều nhất và đáng tiền nhất.</p>
                    </div>
                    <Button onClick={() => navigate('/products?bestSeller=true')}>View all</Button>
                </div>

                <div className="store-grid--5">
                    {data.bestSellerProducts?.map((product) => (
                        <ProductCard key={product.slug} product={product} compact />
                    ))}
                </div>
            </section>

            <section className="store-section">
                <div className="store-section__head">
                    <div>
                        <h2 className="store-section__title">Tin mới nhất</h2>
                        <p className="store-section__subtitle">Bài viết ngắn giúp member chọn setup phù hợp hơn.</p>
                    </div>
                    <Button onClick={() => navigate('/posts')}>Xem tất cả</Button>
                </div>

                <div className="store-grid--3">
                    {data.latestPosts?.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))}
                </div>
            </section>
        </div>
    )
}

export default HomePage;