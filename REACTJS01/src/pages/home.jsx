import { useContext, useEffect, useState } from 'react';
import { Button, Card, Carousel, Spin, Tag, notification } from 'antd';
import { LogoutOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getHomeApi } from '../util/api';
import ProductCard from '../components/catalog/product-card';
import PostCard from '../components/catalog/post-card';
import { getMockHomeData } from '../data/store.mock';

const HomePage = () => {

    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const memberFallback = auth?.user || {};
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchHome = async () => {
            setLoading(true);

            const res = await getHomeApi();

            if (res?.message && res.message !== 'Đã xảy ra lỗi máy chủ') {
                notification.error({
                    message: 'Lấy dữ liệu trang chủ',
                    description: res.message,
                });
            }

            setData(res?.emptyStore ? getMockHomeData(memberFallback) : res);
            setLoading(false);
        };

        fetchHome();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({
            isAuthenticated: false,
            user: {
                email: '',
                name: '',
                role: 'Member',
            },
        });
        navigate('/login');
    };

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

    const promotions = data.promotions ?? [];
    const heroSlides = promotions.length > 0 ? promotions : [data.heroPromotion].filter(Boolean);
    const member = data.member || memberFallback;

    return (
        <div className="store-layout home-page">
            <section className="store-hero">
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

                <div className="store-hero__meta">
                    <Card className="member-card" bordered={false}>
                        <h2 className="member-card__title">Thông tin thành viên</h2>
                        <div className="member-card__meta">
                            <div className="member-card__row">
                                <span>Họ tên</span>
                                <strong>{member.name || 'Member'}</strong>
                            </div>
                            <div className="member-card__row">
                                <span>Email</span>
                                <strong>{member.email || '---'}</strong>
                            </div>
                            <div className="member-card__row">
                                <span>Vai trò</span>
                                <strong>{member.role || 'Member'}</strong>
                            </div>
                        </div>
                        <div className="member-card__actions">
                            <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
                                Đăng xuất
                            </Button>
                            <Button onClick={() => navigate('/products?featured=true')}>
                                Xem sản phẩm nổi bật
                            </Button>
                        </div>
                    </Card>

                    <Card className="member-card" bordered={false}>
                        <h2 className="member-card__title">Tóm tắt nhanh</h2>
                        <div className="member-card__meta">
                            <div className="member-card__row">
                                <span>Danh mục</span>
                                <strong>{data.categories?.length || 0}</strong>
                            </div>
                            <div className="member-card__row">
                                <span>Sản phẩm mới</span>
                                <strong>{data.newestProducts?.length || 0}</strong>
                            </div>
                            <div className="member-card__row">
                                <span>Bán chạy</span>
                                <strong>{data.bestSellerProducts?.length || 0}</strong>
                            </div>
                        </div>
                    </Card>
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