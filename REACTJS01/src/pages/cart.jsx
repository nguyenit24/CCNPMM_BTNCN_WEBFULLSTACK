import { useEffect, useMemo, useState } from 'react';
import { Button, Popconfirm, Result, Spin, Tag, notification } from 'antd';
import { ArrowRightOutlined, DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { clearCartApi, getCartApi, removeCartItemApi, updateCartItemApi } from '../util/api';

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});

const CartPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [mutating, setMutating] = useState(false);
    const [cart, setCart] = useState(null);

    const loadCart = async () => {
        setLoading(true);
        const res = await getCartApi();
        if (res?.message) {
            notification.error({ message: 'Tải giỏ hàng', description: res.message });
        }
        setCart(res?.cart || { items: [], subtotal: 0, totalQuantity: 0, itemCount: 0 });
        setLoading(false);
    };

    useEffect(() => { loadCart(); }, []);

    const items = useMemo(() => Array.isArray(cart?.items) ? cart.items : [], [cart]);
    const subtotal = Number(cart?.subtotal || 0);
    const totalQuantity = Number(cart?.totalQuantity || 0);

    const handleIncrement = async (item) => {
        if (item.quantity >= item.stock) {
            notification.warning({
                message: 'Đã đạt số lượng tối đa',
                description: 'Số lượng trong giỏ không thể lớn hơn tồn kho hiện tại.',
            });
            return;
        }
        setMutating(true);
        const res = await updateCartItemApi(item.slug, { quantity: item.quantity + 1 });
        if (res?.message) notification.error({ message: 'Cập nhật giỏ hàng', description: res.message });
        await loadCart();
        setMutating(false);
    };

    const handleDecrement = async (item) => {
        setMutating(true);
        if (item.quantity <= 1) {
            const res = await removeCartItemApi(item.slug);
            if (res?.message) notification.error({ message: 'Xóa sản phẩm', description: res.message });
        } else {
            const res = await updateCartItemApi(item.slug, { quantity: item.quantity - 1 });
            if (res?.message) notification.error({ message: 'Cập nhật giỏ hàng', description: res.message });
        }
        await loadCart();
        setMutating(false);
    };

    const handleRemove = async (item) => {
        setMutating(true);
        const res = await removeCartItemApi(item.slug);
        if (res?.message) notification.error({ message: 'Xóa sản phẩm', description: res.message });
        await loadCart();
        setMutating(false);
    };

    const handleClearCart = async () => {
        setMutating(true);
        const res = await clearCartApi();
        if (res?.message) notification.error({ message: 'Xóa giỏ hàng', description: res.message });
        await loadCart();
        setMutating(false);
    };

    if (loading) {
        return (
            <div className="store-layout store-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="store-layout cart-empty">
                <Result
                    icon={<ShoppingOutlined style={{ color: 'var(--store-primary)' }} />}
                    title="Giỏ hàng của bạn đang trống"
                    subTitle="Hãy chọn sản phẩm từ danh mục để thêm vào giỏ hàng."
                    extra={(
                        <Button type="primary" size="large" onClick={() => navigate('/products')}
                            style={{ borderRadius: 999, fontWeight: 700 }}>
                            <ShoppingCartOutlined /> Xem sản phẩm
                        </Button>
                    )}
                />
            </div>
        );
    }

    return (
        <div className="store-layout cart-page">
            {/* Header */}
            <div className="cart-page__header">
                <div>
                    <div className="store-page-head__eyebrow">
                        <ShoppingCartOutlined /> Giỏ hàng
                    </div>
                    <h1 className="store-page-head__title">Sản phẩm đã chọn</h1>
                </div>
                <div className="store-page-head__summary">
                    <Tag color="blue">{items.length} sản phẩm</Tag>
                    <Tag color="green">{totalQuantity} số lượng</Tag>
                </div>
            </div>

            <div className="cart-page__grid">
                {/* Cart Items */}
                <section className="cart-list">
                    {items.map((item) => (
                        <article key={item.productId} className="cart-item">
                            <Link to={`/products/${item.slug}`} className="cart-item__media">
                                <img className="cart-item__image" src={item.images?.[0]} alt={item.name} />
                            </Link>

                            <div className="cart-item__body">
                                <div className="cart-item__top">
                                    <div>
                                        <Link to={`/products/${item.slug}`}>
                                            <h2 className="cart-item__title">{item.name}</h2>
                                        </Link>
                                        <div className="cart-item__meta">
                                            <span>{item.categoryName}</span>
                                            <span>•</span>
                                            <span>Còn {item.stock} sp</span>
                                        </div>
                                    </div>
                                    <div className="cart-item__prices">
                                        <strong>{moneyFormatter.format(item.price)}</strong>
                                        {item.compareAtPrice > item.price ? (
                                            <span className="catalog-product-card__compare">{moneyFormatter.format(item.compareAtPrice)}</span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="cart-item__actions">
                                    <div className="quantity-stepper">
                                        <Button icon={<MinusOutlined />} onClick={() => handleDecrement(item)} disabled={mutating} size="small" />
                                        <span className="quantity-stepper__value">{item.quantity}</span>
                                        <Button icon={<PlusOutlined />} onClick={() => handleIncrement(item)} disabled={mutating || item.quantity >= item.stock} size="small" />
                                    </div>
                                    <Popconfirm
                                        title="Xóa sản phẩm khỏi giỏ?"
                                        description="Sản phẩm sẽ bị xóa khỏi giỏ hàng của bạn."
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        onConfirm={() => handleRemove(item)}
                                    >
                                        <Button danger icon={<DeleteOutlined />} disabled={mutating} size="small">
                                            Xóa
                                        </Button>
                                    </Popconfirm>
                                </div>

                                <div className="cart-item__footer">
                                    <Tag color="volcano">Thành tiền: {moneyFormatter.format(item.lineTotal)}</Tag>
                                    {item.salePercent > 0 ? <Tag color="red">-{item.salePercent}%</Tag> : null}
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                {/* Order Summary */}
                <aside className="content-card cart-summary">
                    <h2 className="content-card__title" style={{ marginBottom: 20 }}>Tóm tắt đơn hàng</h2>

                    <div className="cart-summary__row" style={{ marginBottom: 10 }}>
                        <span style={{ color: 'var(--store-muted)' }}>Tạm tính</span>
                        <span>{moneyFormatter.format(subtotal)}</span>
                    </div>
                    <div className="cart-summary__row" style={{ marginBottom: 10 }}>
                        <span style={{ color: 'var(--store-muted)' }}>Số lượng SP</span>
                        <span>{totalQuantity}</span>
                    </div>
                    <div className="cart-summary__row" style={{ marginBottom: 10 }}>
                        <span style={{ color: 'var(--store-muted)' }}>Phí vận chuyển</span>
                        <Tag color="green" style={{ margin: 0 }}>Miễn phí</Tag>
                    </div>

                    <div className="cart-summary__row cart-summary__total" style={{ marginTop: 8 }}>
                        <span>Tổng cộng</span>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--store-primary)' }}>{moneyFormatter.format(subtotal)}</strong>
                    </div>

                    <div className="cart-page__actions" style={{ flexDirection: 'column' }}>
                        <Button
                            type="primary"
                            block
                            size="large"
                            onClick={() => navigate('/checkout')}
                            icon={<ArrowRightOutlined />}
                            style={{ borderRadius: 999, fontWeight: 700, background: 'linear-gradient(135deg, var(--store-primary), #7c3aed)', border: 0 }}
                        >
                            Thanh toán ngay
                        </Button>
                        <Button block onClick={() => navigate('/products')} style={{ borderRadius: 999, fontWeight: 600 }}>
                            Tiếp tục mua sắm
                        </Button>
                        <Popconfirm
                            title="Xóa toàn bộ giỏ hàng?"
                            description="Toàn bộ sản phẩm trong giỏ sẽ bị xóa."
                            okText="Xóa hết"
                            cancelText="Hủy"
                            onConfirm={handleClearCart}
                        >
                            <Button danger block disabled={mutating} style={{ borderRadius: 999 }}>
                                Xóa giỏ hàng
                            </Button>
                        </Popconfirm>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CartPage;