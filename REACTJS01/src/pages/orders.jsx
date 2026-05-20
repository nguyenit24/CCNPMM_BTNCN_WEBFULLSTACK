import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Input, Modal, Result, Space, Spin, Tag, Timeline, Typography, notification } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ReloadOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { cancelOrderApi, getOrdersApi } from '../util/api';

const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const ORDER_STEPS = [
    { status: 'new', label: 'Mới' },
    { status: 'confirmed', label: 'Xác nhận' },
    { status: 'preparing', label: 'Chuẩn bị' },
    { status: 'shipped', label: 'Giao hàng' },
    { status: 'delivered', label: 'Hoàn tất' },
    { status: 'cancelled', label: 'Hủy' },
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
            const nextSelectedId = focusId && list.some((order) => order.id === focusId)
                ? focusId
                : (selectedOrderId && list.some((order) => order.id === selectedOrderId) ? selectedOrderId : list[0]?.id || '');

            if (nextSelectedId) {
                setSelectedOrderId(nextSelectedId);
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) || null, [orders, selectedOrderId]);
    const currentStep = Math.max(ORDER_STEPS.findIndex((step) => step.status === selectedOrder?.status), 0);

    const getStepTimestamp = (status) => {
        if (!selectedOrder) {
            return null;
        }

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
        if (!selectedOrder) {
            return;
        }

        setSubmittingCancel(true);
        const res = await cancelOrderApi(selectedOrder.id, { reason: cancelReason });

        if (res?.message) {
            notification.error({ message: 'Hủy đơn hàng', description: res.message });
        } else {
            notification.success({ message: 'Đã cập nhật đơn hàng', description: 'Trạng thái hủy hoặc yêu cầu hủy đã được ghi nhận.' });
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
                    icon={<ShoppingOutlined />}
                    title="Bạn chưa có đơn hàng nào"
                    subTitle="Sau khi thanh toán COD, đơn hàng sẽ xuất hiện tại đây để bạn theo dõi trạng thái."
                    extra={(
                        <Button type="primary" onClick={() => navigate('/products')}>
                            Xem sản phẩm
                        </Button>
                    )}
                />
            </div>
        );
    }

    return (
        <div className="store-layout orders-page">
            <div className="store-page-head">
                <div>
                    <h1 className="store-page-head__title">Đơn hàng</h1>
                </div>
                <Space wrap>
                    <Button icon={<ReloadOutlined />} onClick={loadOrders}>Tải lại</Button>
                    <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/cart')}>
                        Quay lại giỏ hàng
                    </Button>
                </Space>
            </div>

            <div className="orders-page__layout">
                <aside className="content-card orders-page__sidebar">
                    <div style={{ display: 'grid', gap: 12 }}>
                        {orders.map((order) => (
                            <button
                                key={order.id}
                                type="button"
                                onClick={() => setSelectedOrderId(order.id)}
                                style={{
                                    border: order.id === selectedOrderId ? '1px solid #2563eb' : '1px solid rgba(15, 23, 42, 0.08)',
                                    borderRadius: 20,
                                    padding: 16,
                                    background: order.id === selectedOrderId ? 'rgba(37, 99, 235, 0.06)' : '#fff',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: 4 }}>{order.orderCode}</strong>
                                        <div className="content-card__text">{order.customer?.name || '---'}</div>
                                    </div>
                                    <Tag color={ORDER_COLORS[order.status] || 'default'}>{order.statusLabel || order.status}</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 10 }}>
                                    <span className="content-card__text">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                                    <strong>{moneyFormatter.format(order.total || 0)}</strong>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="content-card orders-page__detail">
                    {selectedOrder ? (
                        <div style={{ display: 'grid', gap: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                <div>
                                    <Typography.Title level={3} style={{ marginBottom: 6 }}>{selectedOrder.orderCode}</Typography.Title>
                                    <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                        Đặt lúc {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                                    </Typography.Paragraph>
                                </div>
                                <Space wrap>
                                    <Tag color={ORDER_COLORS[selectedOrder.status] || 'default'}>{selectedOrder.statusLabel || selectedOrder.status}</Tag>
                                    <Tag color="blue">{selectedOrder.paymentMethodLabel}</Tag>
                                    {selectedOrder.cancellation?.requestStatus === 'pending' ? <Tag color="volcano">Yêu cầu hủy đang chờ shop xử lý</Tag> : null}
                                </Space>
                            </div>

                            <div className="order-tracker">
                                {ORDER_STEPS.map((step, index) => {
                                    const isDone = currentStep > index;
                                    const isCurrent = currentStep === index;
                                    const timestamp = getStepTimestamp(step.status);

                                    return (
                                        <div
                                            key={step.status}
                                            className={`order-tracker__item ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
                                            title={step.label}
                                        >
                                            <div className="order-tracker__icon">
                                                {isDone ? <CheckCircleOutlined /> : index + 1}
                                            </div>
                                            <div className="order-tracker__body">
                                                <strong>{step.label}</strong>
                                                <span>{timestamp ? new Date(timestamp).toLocaleString('vi-VN') : 'Chưa cập nhật'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="store-grid--2">
                                <Card className="content-card" bordered={false} size="small" title="Địa chỉ giao hàng">
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        <strong>{selectedOrder.shippingAddress?.label || 'Địa chỉ'}</strong>
                                        <span>{selectedOrder.shippingAddress?.recipientName} · {selectedOrder.shippingAddress?.phone}</span>
                                        <span>{selectedOrder.shippingAddress?.formattedAddress}</span>
                                    </div>
                                </Card>

                                <Card className="content-card" bordered={false} size="small" title="Thanh toán">
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        <span>Phương thức: <strong>{selectedOrder.paymentMethodLabel}</strong></span>
                                        <span>Trạng thái thanh toán: <strong>{selectedOrder.paymentStatus}</strong></span>
                                        <span>Tổng tiền: <strong>{moneyFormatter.format(selectedOrder.total || 0)}</strong></span>
                                    </div>
                                </Card>
                            </div>

                            <Card className="content-card" bordered={false} size="small" title={`Sản phẩm (${selectedOrder.items?.length || 0})`}>
                                <div style={{ display: 'grid', gap: 14 }}>
                                    {selectedOrder.items?.map((item) => (
                                        <div key={`${item.productId}-${item.slug}`} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                            <img src={item.image} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 16 }} />
                                            <div style={{ flex: 1 }}>
                                                <strong style={{ display: 'block', marginBottom: 4 }}>{item.name}</strong>
                                                <div className="content-card__text">SL: {item.quantity}</div>
                                                <div className="content-card__text">{moneyFormatter.format(item.lineTotal)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="content-card" bordered={false} size="small" title="Lịch sử trạng thái">
                                <Timeline
                                    items={(selectedOrder.statusHistory || []).map((entry) => ({
                                        color: ORDER_COLORS[entry.status] || 'blue',
                                        children: (
                                            <div>
                                                <strong>{ORDER_STEPS.find((step) => step.status === entry.status)?.label || entry.status}</strong>
                                                <div>{entry.note || 'Không có ghi chú'}</div>
                                                <div className="content-card__text">
                                                    {entry.createdAt ? new Date(entry.createdAt).toLocaleString('vi-VN') : ''}
                                                </div>
                                            </div>
                                        ),
                                    }))}
                                />
                            </Card>

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                <div>
                                    <strong>Tạm tính:</strong> {moneyFormatter.format(selectedOrder.subtotal || 0)}
                                </div>
                                <Space wrap>
                                    <Button onClick={() => navigate('/checkout')}>Đặt lại</Button>
                                    {selectedOrder.canCancelDirect || selectedOrder.canRequestCancel ? (
                                        <Button danger onClick={() => setCancelOpen(true)}>
                                            {selectedOrder.canCancelDirect ? 'Hủy đơn hàng' : 'Gửi yêu cầu hủy đơn'}
                                        </Button>
                                    ) : null}
                                </Space>
                            </div>
                        </div>
                    ) : (
                        <Empty description="Chọn một đơn hàng để xem chi tiết" />
                    )}
                </section>
            </div>

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
                    onChange={(event) => setCancelReason(event.target.value)}
                    placeholder="Nhập lý do hủy hoặc lý do muốn shop hỗ trợ hủy đơn"
                />
            </Modal>
        </div>
    );
};

export default OrdersPage;