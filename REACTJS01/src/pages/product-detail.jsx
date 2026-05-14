import { useEffect, useState } from 'react';
import { Button, Carousel, Divider, Empty, Result, Spin, Tag, notification } from 'antd';
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

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setQuantity(1);

            const res = await getProductDetailApi(slug);

            if (res?.message && res.message !== 'Đã xảy ra lỗi máy chủ' && res.message !== 'Không tìm thấy sản phẩm') {
                notification.error({
                    message: 'Lấy chi tiết sản phẩm',
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
        return <Result status="404" title="Không tìm thấy sản phẩm" />;
    }

    const { product, category, similarProducts } = data;
    const maxQuantity = Math.max(product.stock || 1, 1);
    const isOutOfStock = product.stock <= 0;

    return (
        <div className="store-layout">
            <div className="store-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <span>/</span>
                <Link to="/products">Sản phẩm</Link>
                <span>/</span>
                <span>{product.name}</span>
            </div>

            <div className="product-detail">
                <div className="product-detail__gallery">
                    <Carousel autoplay dots>
                        {(product.images || []).map((image, index) => (
                            <div key={`${product.slug}-${index}`} className="product-detail__slide">
                                <img className="product-detail__image" src={image} alt={`${product.name} ${index + 1}`} />
                            </div>
                        ))}
                    </Carousel>
                </div>

                <div className="product-detail__info">
                    <div className="product-detail__tags">
                        <Tag color="blue">{category?.name || product.categoryName}</Tag>
                        {product.isNew ? <Tag color="gold">Mới</Tag> : null}
                        {product.onSale ? <Tag color="red">Khuyến mãi</Tag> : null}
                    </div>

                    <h1 className="product-detail__title">{product.name}</h1>
                    <p className="product-detail__description">{product.description}</p>

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
                            <span>Tồn kho</span>
                        </div>
                        <div className="product-detail__meta-item">
                            <strong>{product.sold}</strong>
                            <span>Đã bán</span>
                        </div>
                        <div className="product-detail__meta-item">
                            <strong><StarFilled /> {Number(product.rating || 0).toFixed(1)}</strong>
                            <span>Đánh giá</span>
                        </div>
                    </div>

                    <div className="product-detail__quantity">
                        <span>Số lượng</span>
                        <div className="quantity-stepper">
                            <Button icon={<MinusOutlined />} onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} />
                            <span className="quantity-stepper__value">{quantity}</span>
                            <Button icon={<PlusOutlined />} onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} disabled={isOutOfStock || quantity >= maxQuantity} />
                        </div>
                    </div>

                    <div className="product-detail__stock-note">
                        {isOutOfStock ? 'Hết hàng' : `Còn ${product.stock} sản phẩm trong kho`}
                    </div>

                    <Divider />

                    <div className="product-detail__specs">
                        {Array.isArray(product.specs) ? product.specs.map((spec) => (
                            <div key={spec.label} className="product-detail__spec">
                                <span>{spec.label}</span>
                                <strong>{spec.value}</strong>
                            </div>
                        )) : null}
                    </div>
                </div>
            </div>

            <div className="product-detail__content">
                <div className="content-card">
                    <h2 className="content-card__title">Mô tả chi tiết</h2>
                    <p className="content-card__text">{product.description}</p>
                    <p className="content-card__text">
                        Sản phẩm thuộc danh mục <strong>{category?.name || product.categoryName}</strong> và phù hợp cho member muốn một bộ thiết bị gọn, cao cấp, tập trung vào trải nghiệm thực tế.
                    </p>
                </div>

                <div className="content-card">
                    <h2 className="content-card__title">Sản phẩm tương tự</h2>
                    {similarProducts?.length > 0 ? (
                        <div className="store-grid--4">
                            {similarProducts.map((item) => (
                                <ProductCard key={item.slug} product={item} compact />
                            ))}
                        </div>
                    ) : (
                        <Empty description="Chưa có sản phẩm tương tự" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;