import { Tag } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const ProductCard = ({ product, compact = false }) => {
    if (!product) {
        return null;
    }

    return (
        <Link to={`/products/${product.slug}`} className={`catalog-product-card ${compact ? 'catalog-product-card--compact' : ''}`}>
            <div className="catalog-product-card__media">
                <img className="catalog-product-card__image" src={product.images?.[0]} alt={product.name} />
                <div className="catalog-product-card__badges">
                    {product.isNew ? <Tag color="blue">New</Tag> : null}
                    {product.onSale && product.salePercent > 0 ? <Tag color="volcano">-{product.salePercent}%</Tag> : null}
                    {product.bestSeller ? <Tag color="green">Best seller</Tag> : null}
                </div>
            </div>
            <div className="catalog-product-card__body">
                <div className="catalog-product-card__category">{product.categoryName}</div>
                <h3 className="catalog-product-card__title">{product.name}</h3>
                <p className="catalog-product-card__description">{product.shortDescription}</p>
                <div className="catalog-product-card__price-row">
                    <span className="catalog-product-card__price">{moneyFormatter.format(product.price)}</span>
                    {product.compareAtPrice > product.price ? (
                        <span className="catalog-product-card__compare">{moneyFormatter.format(product.compareAtPrice)}</span>
                    ) : null}
                </div>
                <div className="catalog-product-card__meta">
                    <span>{product.stock} in stock</span>
                    <span>{product.sold} sold</span>
                </div>
                <div className="catalog-product-card__footer">
                    <span className="catalog-product-card__rating"><StarFilled /> {Number(product.rating || 0).toFixed(1)}</span>
                    <span className="catalog-product-card__cta">View details</span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;