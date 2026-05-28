import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Empty, Result, Spin, Tag, notification } from 'antd';
import { MinusOutlined, PlusOutlined, StarFilled } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/catalog/product-card';
import {
    addCartItemApi,
    getProductDetailApi,
    addFavoriteApi,
    removeFavoriteApi,
    getMyFavoritesApi,
    addViewHistoryApi,
    getMyViewHistoryApi,
    getProductStatisticsApi,
    getProductReviewsApi
} from '../util/api';
import { AuthContext } from '../components/context/auth.context';

const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    return price.toLocaleString('vi-VN') + 'đ';
};

const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);
    
    // Feature integrations state
    const [isFavorite, setIsFavorite] = useState(false);
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [viewHistory, setViewHistory] = useState([]);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const viewedProductRef = useRef(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setAddingToCart(false);
            setQuantity(1);
            setActiveImageIndex(0);

            const res = await getProductDetailApi(slug);

            if (res?.message && res.message !== 'Đã xảy ra lỗi máy chủ' && res.message !== 'Không tìm thấy sản phẩm') {
                notification.error({
                    message: 'Load product details',
                    description: res.message,
                });
            }

            if (res?.product) {
                const productId = res.product._id;

                // Fire async helper tasks
                const promises = [
                    getProductStatisticsApi(productId),
                    getProductReviewsApi(productId)
                ];

                if (auth?.isAuthenticated) {
                    if (viewedProductRef.current !== productId) {
                        viewedProductRef.current = productId;
                        promises.push(addViewHistoryApi(productId));
                    }
                    promises.push(getMyFavoritesApi());
                    promises.push(getMyViewHistoryApi({ limit: 4 }));
                }

                const results = await Promise.allSettled(promises);

                // Parse stats
                if (results[0].status === 'fulfilled' && results[0].value && results[0].value.success !== false) {
                    setStats(results[0].value);
                }

                // Parse reviews
                if (results[1].status === 'fulfilled' && results[1].value?.items) {
                    setReviews(results[1].value.items);
                }

                if (auth?.isAuthenticated) {
                    // Parse favorites check
                    if (results[3] && results[3].status === 'fulfilled' && results[3].value && results[3].value.success !== false) {
                        const favItems = results[3].value.items || [];
                        const isFav = favItems.some(item => item._id === productId);
                        setIsFavorite(isFav);
                    }

                    // Parse view history
                    if (results[4] && results[4].status === 'fulfilled' && results[4].value && results[4].value.success !== false) {
                        setViewHistory(results[4].value.items || []);
                    }
                }
            }

            setData(res);
            setLoading(false);
        };

        fetchDetail();
    }, [slug, auth?.isAuthenticated]);

    const handleAddToCart = async () => {
        if (!auth?.isAuthenticated) {
            notification.info({
                message: 'Bạn cần đăng nhập',
                description: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
            });
            navigate('/login');
            return;
        }

        setAddingToCart(true);
        const res = await addCartItemApi({ slug, quantity });

        if (res?.message) {
            notification.error({
                message: 'Thêm vào giỏ hàng',
                description: res.message,
            });
        } else {
            notification.success({
                message: 'Đã thêm vào giỏ hàng',
                description: `${product.name} x${quantity}`,
            });
        }

        setAddingToCart(false);
    };

    const handleToggleFavorite = async () => {
        if (!auth?.isAuthenticated) {
            notification.info({
                message: 'Đăng nhập',
                description: 'Vui lòng đăng nhập để lưu sản phẩm yêu thích.',
            });
            navigate('/login');
            return;
        }

        setFavoriteLoading(true);
        if (isFavorite) {
            const res = await removeFavoriteApi(product._id);
            if (res && res.success !== false) {
                setIsFavorite(false);
                notification.success({
                    message: 'Yêu thích',
                    description: 'Đã xóa sản phẩm khỏi danh sách yêu thích',
                });
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: res?.message || 'Có lỗi xảy ra',
                });
            }
        } else {
            const res = await addFavoriteApi(product._id);
            if (res && res.success !== false) {
                setIsFavorite(true);
                notification.success({
                    message: 'Yêu thích',
                    description: 'Đã thêm sản phẩm vào danh sách yêu thích',
                });
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: res?.message || 'Có lỗi xảy ra',
                });
            }
        }
        setFavoriteLoading(false);
    };

    if (loading) {
        return (
            <div className="store-layout store-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!data?.product) {
        return <Result status="404" title="Product not found" />;
    }

    const { product, category, similarProducts } = data;
    const maxQuantity = Math.max(product.stock || 1, 1);
    const isOutOfStock = product.stock <= 0;
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const hasImages = images.length > 0;
    const safeActiveIndex = hasImages ? Math.min(activeImageIndex, images.length - 1) : 0;
    const activeImage = hasImages ? images[safeActiveIndex] : null;
    const specs = Array.isArray(product.specs)
        ? product.specs.filter((spec) => spec?.label && spec?.value)
        : [];
    const summaryDescription = product.shortDescription || product.description;
    const fullDescription = product.description || product.shortDescription;

    return (
        <div className="store-layout">
            <div className="store-breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/products">Products</Link>
                <span>/</span>
                <span>{product.name}</span>
            </div>

            <div className="product-detail">
                <div className="product-detail__gallery">
                    <div className="product-gallery">
                        <div className="product-gallery__main">
                            {activeImage ? (
                                <img
                                    className="product-gallery__image"
                                    src={activeImage}
                                    alt={`${product.name} ${safeActiveIndex + 1}`}
                                />
                            ) : (
                                <div className="product-gallery__placeholder">No product images available</div>
                            )}
                        </div>
                        {images.length > 1 ? (
                            <div className="product-gallery__thumbs">
                                {images.map((image, index) => (
                                    <button
                                        key={`${product.slug}-${index}`}
                                        type="button"
                                        className={`product-gallery__thumb ${safeActiveIndex === index ? 'is-active' : ''}`}
                                        onClick={() => setActiveImageIndex(index)}
                                        aria-pressed={safeActiveIndex === index}
                                    >
                                        <img src={image} alt={`${product.name} ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="product-detail__info">
                    <div className="product-detail__tags">
                        <Tag color="blue">{category?.name || product.categoryName}</Tag>
                        {product.isNew ? <Tag color="gold">New</Tag> : null}
                        {product.onSale ? <Tag color="red">Sale</Tag> : null}
                    </div>

                    <h1 className="product-detail__title">{product.name}</h1>
                    {summaryDescription ? (
                        <p className="product-detail__description">{summaryDescription}</p>
                    ) : null}

                    <div className="product-detail__pricing">
                        <span className="product-detail__price">{formatPrice(product.price)}</span>
                        {product.compareAtPrice > product.price ? (
                            <span className="product-detail__compare">{formatPrice(product.compareAtPrice)}</span>
                        ) : null}
                        {product.salePercent > 0 ? <Tag color="volcano">-{product.salePercent}%</Tag> : null}
                    </div>

                    <div className="product-detail__meta">
                        <div className="product-detail__meta-item">
                            <strong>{product.stock}</strong>
                            <span>Tồn kho</span>
                        </div>
                        <div className="product-detail__meta-item">
                            <strong>{stats?.sold !== undefined ? stats.sold : product.sold}</strong>
                            <span>Đã bán</span>
                        </div>
                        <div className="product-detail__meta-item">
                            <strong>{stats?.views !== undefined ? stats.views : (product.views || 0)}</strong>
                            <span>Lượt xem</span>
                        </div>
                        <div className="product-detail__meta-item">
                            <strong><StarFilled /> {Number(stats?.rating !== undefined ? stats.rating : (product.rating || 0)).toFixed(1)}</strong>
                            <span>({reviews.length} đánh giá)</span>
                        </div>
                    </div>

                    <div className="product-detail__quantity">
                        <span>Quantity</span>
                        <div className="quantity-stepper">
                            <Button icon={<MinusOutlined />} onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} />
                            <span className="quantity-stepper__value">{quantity}</span>
                            <Button icon={<PlusOutlined />} onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} disabled={isOutOfStock || quantity >= maxQuantity} />
                        </div>
                    </div>

                    <div className="product-detail__stock-note">
                        {isOutOfStock ? 'Out of stock' : `${product.stock} items left in stock`}
                    </div>

                    <div className="product-detail__actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || addingToCart}
                            style={{ flex: 1, minWidth: '200px' }}
                        >
                            Thêm vào giỏ hàng
                        </Button>
                        <Button
                            size="large"
                            onClick={handleToggleFavorite}
                            loading={favoriteLoading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                borderColor: isFavorite ? '#ef4444' : '#d9d9d9',
                                color: isFavorite ? '#ef4444' : '#0f172a',
                                background: isFavorite ? '#fee2e2' : '#ffffff',
                            }}
                            title={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                        >
                            <svg width="20" height="20" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </Button>
                        <Button size="large" onClick={() => navigate('/cart')} style={{ width: '100%' }}>
                            Xem giỏ hàng
                        </Button>
                    </div>

                </div>
            </div>

            <div className="product-detail__content">
                <div className="product-detail__summary">
                    <div className="content-card">
                        <h2 className="content-card__title">Product description</h2>
                        {fullDescription ? <p className="content-card__text">{fullDescription}</p> : null}
                        <p className="content-card__text">
                            This product belongs to <strong>{category?.name || product.categoryName}</strong> and is a good fit for members who want a compact, premium setup focused on real-world experience.
                        </p>
                    </div>
                    <div className="content-card product-detail__spec-card">
                        <h2 className="content-card__title">Specifications</h2>
                        {specs.length > 0 ? (
                            <dl className="product-detail__specs">
                                {specs.map((spec, index) => (
                                    <div key={`${spec.label}-${index}`} className="product-detail__spec">
                                        <dt>{spec.label}</dt>
                                        <dd>{spec.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : (
                            <p className="product-detail__spec-empty">No specifications available.</p>
                        )}
                    </div>
                </div>

                {/* Reviews Testimonials Section */}
                <div className="content-card" style={{ marginTop: '24px' }}>
                    <h2 className="content-card__title" style={{ marginBottom: '20px' }}>Đánh giá từ khách hàng ({reviews.length})</h2>
                    {reviews.length > 0 ? (
                        <div className="product-reviews-list">
                            {reviews.map((r, i) => (
                                <div key={r._id || i} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <strong>{r.userId?.name || 'Khách hàng ẩn danh'}</strong>
                                        <span style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                                            {Array.from({ length: 5 }).map((_, idx) => (
                                                <StarFilled key={idx} style={{ color: idx < r.rating ? '#f59e0b' : '#cbd5e1' }} />
                                            ))}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>{r.comment}</p>
                                    {r.images?.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                            {r.images.map((img, imgIdx) => (
                                                <img key={imgIdx} src={img} alt="review attachment" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description="Chưa có đánh giá nào cho sản phẩm này. Hãy mua sản phẩm và trở thành người đầu tiên đánh giá!" />
                    )}
                </div>

                {/* Recently Viewed Products Section */}
                {auth?.isAuthenticated && viewHistory.length > 0 && (
                    <div className="content-card" style={{ marginTop: '24px' }}>
                        <h2 className="content-card__title" style={{ marginBottom: '20px' }}>Sản phẩm đã xem gần đây</h2>
                        <div className="store-grid--4">
                            {viewHistory.slice(0, 4).map((item) => (
                                <ProductCard key={item.slug} product={item} compact />
                            ))}
                        </div>
                    </div>
                )}

                <div className="content-card" style={{ marginTop: '24px' }}>
                    <h2 className="content-card__title">Similar products</h2>
                    {similarProducts?.length > 0 ? (
                        <div className="store-grid--4">
                            {similarProducts.map((item) => (
                                <ProductCard key={item.slug} product={item} compact />
                            ))}
                        </div>
                    ) : (
                            <Empty description="No similar products" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;