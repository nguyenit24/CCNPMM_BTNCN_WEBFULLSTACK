import { Link } from 'react-router-dom';
import { StarFilled } from '@ant-design/icons';
import { notification } from 'antd';
import { addFavoriteApi } from '../../util/api';

const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    return price.toLocaleString('vi-VN') + 'đ';
};

const getTagStyle = (tag) => {
    const t = tag.toLowerCase().trim();
    if (t === 'custom' || t === 'mạch xuôi' || t === 'mach xuoi') {
        return { bg: '#fee2e2', text: '#ef4444' };
    }
    if (t === 'premium') {
        return { bg: '#fef3c7', text: '#b45309' };
    }
    const colorSchemes = [
        { bg: '#fee2e2', text: '#ef4444' }, // Soft Red
        { bg: '#e0f2fe', text: '#0284c7' }, // Soft Blue
        { bg: '#fef3c7', text: '#b45309' }, // Soft Yellow/Orange
        { bg: '#f3e8ff', text: '#7e22ce' }  // Soft Purple
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorSchemes[Math.abs(hash) % colorSchemes.length];
};

const ProductCard = ({ product, compact = false }) => {
    if (!product) {
        return null;
    }

    const salePercent = product.salePercent || (product.compareAtPrice && product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0);
    const onSale = product.onSale || (product.compareAtPrice > product.price);

    // Extract tags dynamically from the response
    const tags = Array.isArray(product.tags) ? product.tags : [];

    const handleWishlistClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await addFavoriteApi(product._id);
            if (res && res.success !== false) {
                notification.success({
                    message: 'Yêu thích',
                    description: `Đã thêm sản phẩm "${product.name}" vào danh sách yêu thích thành công!`,
                });
            } else {
                notification.error({
                    message: 'Yêu thích',
                    description: res?.message || 'Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Yêu thích',
                description: 'Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.',
            });
        }
    };

    return (
        <Link to={`/products/${product.slug}`} className={`catalog-product-card ${compact ? 'catalog-product-card--compact' : ''}`}>
            <div className="catalog-product-card__media">
                <img className="catalog-product-card__image" src={product.images?.[0]} alt={product.name} />
                
                {/* Discount Badge */}
                {onSale && salePercent > 0 ? (
                    <div className="catalog-product-card__discount-badge">
                        -{salePercent}%
                    </div>
                ) : null}

                {/* Wishlist Heart Button */}
                <div className="catalog-product-card__wishlist-btn" onClick={handleWishlistClick}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
            </div>
            
            <div className="catalog-product-card__body">
                {/* Horizontal pastel tags rendered dynamically from product.tags */}
                {tags.length > 0 ? (
                    <div className="catalog-product-card__horizontal-tags">
                        {tags.slice(0, 3).map((tag, idx) => {
                            const scheme = getTagStyle(tag);
                            return (
                                <span
                                    key={idx}
                                    className="catalog-product-card__badge-pill"
                                    style={{ backgroundColor: scheme.bg, color: scheme.text }}
                                >
                                    {tag}
                                </span>
                            );
                        })}
                    </div>
                ) : null}

                <h3 className="catalog-product-card__title">{product.name}</h3>

                {/* Rating & Sold Row */}
                <div className="catalog-product-card__rating-row">
                    <span className="catalog-product-card__star-icon"><StarFilled /></span>
                    <span className="catalog-product-card__rating-val">{Number(product.rating || 4.8).toFixed(1)}</span>
                    <span className="catalog-product-card__separator">|</span>
                    <span className="catalog-product-card__sold-val">{product.sold || 0} đã bán</span>
                </div>
                
                {/* Price Section */}
                <div className="catalog-product-card__price-container">
                    <span className="catalog-product-card__price">{formatPrice(product.price)}</span>
                    {onSale && product.compareAtPrice > product.price ? (
                        <span className="catalog-product-card__compare">{formatPrice(product.compareAtPrice)}</span>
                    ) : null}
                </div>

                {/* Footer Row: Stock status & Cart button */}
                <div className="catalog-product-card__footer-row">
                    <div className="catalog-product-card__stock-status">
                        <svg className="catalog-product-card__stock-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="catalog-product-card__stock-text">
                            {product.stock > 0 ? 'Còn hàng' : 'Tạm hết hàng'}
                        </span>
                    </div>

                    <div className="catalog-product-card__cart-btn">
                        <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9V5.5z"/>
                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;