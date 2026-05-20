import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Input, Modal, Result, Space, Spin, Tag, Timeline, Typography, notification } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { cancelOrderApi, getOrdersApi } from '../util/api';

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});

const ORDER_STEPS = [
    { status: 'new', label: 'Mới đặt' },
    { status: 'confirmed', label: 'Xác nhận' },
    { status: 'preparing', label: 'Chuẩn bị' },
    { status: 'shipped', label: 'Đang giao' },
    { status: 'delivered', label: 'Hoàn tất' },
    { status: 'cancelled', label: 'Đã hủy' },
];

const ORDER_COLORS = {
    new: 'gold',
    confirmed: 'blue',
    preparing: 'orange',
    shipped: 'processing',
    delivered: 'green',
    cancelled: 'red',
};

const OrdersPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [submittingCancel, setSubmittingCancel] = useState(false);

    const loadOrders = async () => {
        setLoading(true);
        const res = await getOrdersApi();
        if (res?.message) {
            notification.error({ message: 'Tải đơn hàng', description: res.message });
            setOrders([]);
        } else {
            const list = Array.isArray(res) ? res : [];
            setOrders(list);
            const focusId = location.state?.focusOrderId;
            const nextSelectedId = focusId && list.some((o) => o.id === focusId)
                ? focusId
                : (selectedOrderId && list.some((o) => o.id === selectedOrderId) ? selectedOrderId : list[0]?.id || '');
            if (nextSelectedId) setSelectedOrderId(nextSelectedId);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedOrderId) || null, [orders, selectedOrderId]);
    const currentStep = Math.max(ORDER_STEPS.findIndex((s) => s.status === selectedOrder?.status), 0);

    const getStepTimestamp = (status) => {
        if (!selectedOrder) return null;
        const map = {
            new: selectedOrder.createdAt,
            confirmed: selectedOrder.confirmedAt,
            preparing: selectedOrder.preparingAt,
            shipped: selectedOrder.shippedAt,
            delivered: selectedOrder.deliveredAt,
            cancelled: selectedOrder.cancelledAt,
        };
        return map[status] || null;
    };

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;
        setSubmittingCancel(true);
        const res = await cancelOrderApi(selectedOrder.id, { reason: cancelReason });
        if (res?.message) {
            notification.error({ message: 'Hủy đơn hàng', description: res.message });
        } else {
            notification.success({ message: 'Đã cập nhật', description: 'Trạng thái hủy hoặc yêu cầu hủy đã được ghi nhận.' });
            setCancelOpen(false);
            setCancelReason('');
            await loadOrders();
        }
        setSubmittingCancel(false);
    };

    if (loading) {
        return (
            <div className="store-layout store-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="store-layout">
                <Result
                    status="info"
                    icon={<ShoppingOutlined style={{ color: 'var(--store-primary)' }} />}
                    title="Bạn chưa có đơn hàng nào"
                    subTitle="Sau khi thanh toán, đơn hàng sẽ xuất hiện tại đây để bạn theo dõi."
                    extra={(
                        <Button type="primary" onClick={() => navigate('/products')}
                            style={{ borderRadius: 999, fontWeight: 700 }}>
                            Xem sản phẩm
                        </Button>
                    )}
                />
            </div>
        );
    }

    return (
        <div className="store-layout orders-page">
            {/* Header */}
            <div className="store-page-head">
                <div>
                    <div className="store-page-head__eyebrow">
                        <ClockCircleOutlined /> Lịch sử mua hàng
                    </div>
                    <h1 className="store-page-head__title">Đơn hàng của tôi</h1>
                </div>
                <Space wrap>
                    <Button icon={<ReloadOutlined />} onClick={loadOrders} style={{ borderRadius: 999 }}>Làm mới</Button>
                    <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/cart')}
                        style={{ borderRadius: 999, fontWeight: 700 }}>
                        Quay lại giỏ hàng
                    </Button>
                </Space>
            </div>

            <div className="orders-page__layout">
                {/* Sidebar: Order List */}
                <aside className="content-card orders-page__sidebar">
                    <div style={{ fontWeight: 800, marginBottom: 14, fontSize: '0.9rem', color: 'var(--store-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {orders.length} đơn hàng
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {orders.map((order) => (
                            <button
                                key={order.id}
                                type="button"
                                onClick={() => setSelectedOrderId(order.id)}
                                style={{
                                    border: order.id === selectedOrderId ? '2px solid var(--store-primary)' : '1px solid var(--store-border)',
                                    borderRadius: 18,
                                    padding: '14px 16px',
                                    background: order.id === selectedOrderId ? 'rgba(37, 99, 235, 0.06)' : 'rgba(255,255,255,0.8)',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: 3, fontSize: '0.95rem' }}>{order.orderCode}</strong>
                                        <div className="content-card__text" style={{ fontSize: '0.88rem' }}>{order.customer?.name || '---'}</div>
                                    </div>
                                    <Tag color={ORDER_COLORS[order.status] || 'default'}>{order.statusLabel || order.status}</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
                                    <span className="content-card__text" style={{ fontSize: '0.84rem' }}>
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    <strong style={{ color: 'var(--store-primary)' }}>{moneyFormatter.format(order.total || 0)}</strong>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Detail Panel */}
                <section className="content-card orders-page__detail">
                    {selectedOrder ? (
                        <div style={{ display: 'grid', gap: 22 }}>
                            {/* Order Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                <div>
                                    <Typography.Title level={3} style={{ marginBottom: 4 }}>{selectedOrder.orderCode}</Typography.Title>
                                    <Typography.Text type="secondary">
                                        Đặt lúc {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                                    </Typography.Text>
                                </div>
                                <Space wrap>
                                    <Tag color={ORDER_COLORS[selectedOrder.status] || 'default'}>{selectedOrder.statusLabel || selectedOrder.status}</Tag>
                                    <Tag color="blue">{selectedOrder.paymentMethodLabel}</Tag>
                                    {selectedOrder.cancellation?.requestStatus === 'pending' ? (
                                        <Tag color="volcano">Yêu cầu hủy đang chờ xử lý</Tag>
                                    ) : null}
                                </Space>
                            </div>

                            {/* Order Tracker */}
                            <div className="order-tracker">
                                {ORDER_STEPS.map((step, index) => {
                                    const isDone = currentStep > index;
                                    const isCurrent = currentStep === index;
                                    const timestamp = getStepTimestamp(step.status);
                                    return (
                                        <div
                                            key={step.status}
                                            className={`order-tracker__item ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
                                        >
                                            <div className="order-tracker__icon">
                                                {isDone ? <CheckCircleOutlined /> : index + 1}
                                            </div>
                                            <div className="order-tracker__body">
                                                <strong>{step.label}</strong>
                                                <span>{timestamp ? new Date(timestamp).toLocaleDateString('vi-VN') : 'Chờ cập nhật'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Address & Payment */}
                            <div className="store-grid--2">
                                <Card className="content-card" bordered={false} size="small" title="Địa chỉ giao hàng">
                                    <div style={{ display: 'grid', gap: 6 }}>
                                        <strong>{selectedOrder.shippingAddress?.label || 'Địa chỉ'}</strong>
                                        <span className="content-card__text">
                                            {selectedOrder.shippingAddress?.recipientName} · {selectedOrder.shippingAddress?.phone}
                                        </span>
                                        <span className="content-card__text">{selectedOrder.shippingAddress?.formattedAddress}</span>
                                    </div>
                                </Card>

                                <Card className="content-card" bordered={false} size="small" title="Thông tin thanh toán">
                                    <div style={{ display: 'grid', gap: 6 }}>
                                        <span>Phương thức: <strong>{selectedOrder.paymentMethodLabel}</strong></span>
                                        <span>Trạng thái: <strong>{selectedOrder.paymentStatus}</strong></span>
                                        <span>Tổng tiền: <strong style={{ color: 'var(--store-primary)' }}>{moneyFormatter.format(selectedOrder.total || 0)}</strong></span>
                                    </div>
                                </Card>
                            </div>

                            {/* Products */}
                            <Card className="content-card" bordered={false} size="small" title={`Sản phẩm (${selectedOrder.items?.length || 0})`}>
                                <div style={{ display: 'grid', gap: 16 }}>
                                    {selectedOrder.items?.map((item) => (
                                        <div key={`${item.productId}-${item.slug}`} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                            <img src={item.image} alt={item.name}
                                                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 14, border: '1px solid var(--store-border)' }} />
                                            <div style={{ flex: 1 }}>
                                                <strong style={{ display: 'block', marginBottom: 4 }}>{item.name}</strong>
                                                <div className="content-card__text">Số lượng: {item.quantity}</div>
                                                <div style={{ color: 'var(--store-primary)', fontWeight: 700 }}>{moneyFormatter.format(item.lineTotal)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Status History */}
                            <Card className="content-card" bordered={false} size="small" title="Lịch sử trạng thái">
                                <Timeline
                                    items={(selectedOrder.statusHistory || []).map((entry) => ({
                                        color: ORDER_COLORS[entry.status] || 'blue',
                                        children: (
                                            <div>
                                                <strong>{ORDER_STEPS.find((s) => s.status === entry.status)?.label || entry.status}</strong>
                                                <div className="content-card__text">{entry.note || 'Không có ghi chú'}</div>
                                                <div className="content-card__text">
                                                    {entry.createdAt ? new Date(entry.createdAt).toLocaleString('vi-VN') : ''}
                                                </div>
                                            </div>
                                        ),
                                    }))}
                                />
                            </Card>

                            {/* Actions */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                <div>
                                    <span className="content-card__text">Tổng cộng: </span>
                                    <strong style={{ color: 'var(--store-primary)', fontSize: '1.1rem' }}>{moneyFormatter.format(selectedOrder.total || 0)}</strong>
                                </div>
                                <Space wrap>
                                    <Button onClick={() => navigate('/checkout')} style={{ borderRadius: 999 }}>Đặt lại</Button>
                                    {(selectedOrder.canCancelDirect || selectedOrder.canRequestCancel) && (
                                        <Button danger onClick={() => setCancelOpen(true)} style={{ borderRadius: 999 }}>
                                            {selectedOrder.canCancelDirect ? 'Hủy đơn hàng' : 'Gửi yêu cầu hủy'}
                                        </Button>
                                    )}
                                </Space>
                            </div>
                        </div>
                    ) : (
                        <Empty description="Chọn một đơn hàng để xem chi tiết" />
                    )}
                </section>
            </div>

            {/* Cancel Modal */}
            <Modal
                title={selectedOrder?.canCancelDirect ? 'Hủy đơn hàng' : 'Gửi yêu cầu hủy đơn cho shop'}
                open={cancelOpen}
                onCancel={() => setCancelOpen(false)}
                onOk={handleCancelOrder}
                okText={selectedOrder?.canCancelDirect ? 'Xác nhận hủy' : 'Gửi yêu cầu'}
                confirmLoading={submittingCancel}
                destroyOnClose
            >
                <Input.TextArea
                    rows={4}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy hoặc lý do muốn shop hỗ trợ hủy đơn"
                />
            </Modal>
        </div>
    );
};

export default OrdersPage;