import { useEffect, useState } from 'react';
import { Button, Empty, Result, Spin, Tag, notification } from 'antd';
import { MinusOutlined, PlusOutlined, StarFilled } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/catalog/product-card';
import { getProductDetailApi } from '../util/api';

const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const ProductDetailPage = () => {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setQuantity(1);
            setActiveImageIndex(0);

            const res = await getProductDetailApi(slug);

            if (res?.message && res.message !== 'Đã xảy ra lỗi máy chủ' && res.message !== 'Không tìm thấy sản phẩm') {
                notification.error({
                    message: 'Load product details',
                    description: res.message,
                });
            }

            setData(res);
            setLoading(false);
        };

        fetchDetail();
    }, [slug]);

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
                        <span className="product-detail__price">{moneyFormatter.format(product.price)}</span>
                        {product.compareAtPrice > product.price ? (
                            <span className="product-detail__compare">{moneyFormatter.format(product.compareAtPrice)}</span>
                        ) : null}
                        {product.salePercent > 0 ? <Tag color="volcano">-{product.salePercent}%</Tag> : null}
                    </div>

                    <div className="product-detail__meta">
                        <div className="product-detail__meta-item">
                            <strong>{product.stock}</strong>
                            <span>In stock</span>
                        </div>
                        <div className="product-detail__meta-item">
                            <strong>{product.sold}</strong>
                            <span>Sold</span>
                        </div>
                        <div className="product-detail__meta-item">
                            <strong><StarFilled /> {Number(product.rating || 0).toFixed(1)}</strong>
                            <span>Rating</span>
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

                <div className="content-card">
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