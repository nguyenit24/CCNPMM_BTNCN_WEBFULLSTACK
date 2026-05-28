import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Empty, Input, Modal, Popconfirm, Rate, Result, Space, Spin, Tag, Timeline, Typography, Upload, notification } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, ShoppingOutlined, StarFilled, UploadOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { cancelOrderApi, getOrdersApi, createReviewApi, uploadImageApi, updateReviewApi, deleteReviewApi, getMyReviewsApi } from '../util/api';

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

    // My reviews lookup: { [productId_orderId]: reviewDoc }
    const [myReviewsMap, setMyReviewsMap] = useState({});
    const reviewsLoaded = useRef(false);

    // Product review states
    const [reviewOpen, setReviewOpen] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null); // null = create, string = edit
    const [reviewProductId, setReviewProductId] = useState('');
    const [reviewOrderId, setReviewOrderId] = useState('');
    const [reviewProductName, setReviewProductName] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewImageInput, setReviewImageInput] = useState('');
    const [reviewImagesList, setReviewImagesList] = useState([]);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const loadMyReviews = async () => {
        const res = await getMyReviewsApi();
        if (res && res.success !== false) {
            const map = {};
            (res.data || []).forEach((review) => {
                const key = `${review.productId?._id || review.productId}_${review.orderId}`;
                map[key] = review;
            });
            setMyReviewsMap(map);
        }
        reviewsLoaded.current = true;
    };

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
        loadMyReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedOrderId) || null, [orders, selectedOrderId]);
    const currentStep = Math.max(ORDER_STEPS.findIndex((s) => s.status === selectedOrder?.status), 0);

    const getReviewKey = (productId, orderId) => `${productId}_${orderId}`;
    const getExistingReview = (productId, orderId) => myReviewsMap[getReviewKey(productId, orderId)] || null;

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

    const handleOpenCreateReview = (productId, productName, orderId) => {
        setEditingReviewId(null);
        setReviewProductId(productId);
        setReviewOrderId(orderId);
        setReviewProductName(productName);
        setReviewRating(5);
        setReviewComment('');
        setReviewImageInput('');
        setReviewImagesList([]);
        setReviewOpen(true);
    };

    const handleOpenEditReview = (review, productName) => {
        setEditingReviewId(review._id);
        setReviewProductId(review.productId?._id || review.productId);
        setReviewOrderId(review.orderId);
        setReviewProductName(productName);
        setReviewRating(review.rating || 5);
        setReviewComment(review.comment || '');
        setReviewImageInput('');
        setReviewImagesList(review.images || []);
        setReviewOpen(true);
    };

    const handleAddReviewImage = () => {
        if (reviewImageInput.trim()) {
            setReviewImagesList([...reviewImagesList, reviewImageInput.trim()]);
            setReviewImageInput('');
        }
    };

    const handleCustomUpload = async ({ file, onSuccess, onError }) => {
        setUploadingImage(true);
        try {
            const res = await uploadImageApi(file);
            if (res && res.success !== false) {
                setReviewImagesList((prev) => [...prev, res.url]);
                notification.success({ message: 'Tải ảnh thành công', description: 'Hình ảnh đã được tải lên Cloudinary an toàn!' });
                onSuccess(null, file);
            } else {
                notification.error({ message: 'Lỗi tải ảnh', description: res?.message || 'Có lỗi xảy ra.' });
                onError(new Error('Tải ảnh thất bại'));
            }
        } catch (err) {
            notification.error({ message: 'Lỗi tải ảnh', description: err.message });
            onError(err);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveReviewImage = (index) => {
        setReviewImagesList(reviewImagesList.filter((_, idx) => idx !== index));
    };

    const handleSubmitReview = async () => {
        if (!reviewRating) {
            notification.error({ message: 'Lỗi', description: 'Vui lòng chọn số sao đánh giá' });
            return;
        }
        setSubmittingReview(true);

        let res;
        if (editingReviewId) {
            res = await updateReviewApi(editingReviewId, {
                rating: reviewRating,
                comment: reviewComment,
                images: reviewImagesList,
            });
        } else {
            res = await createReviewApi({
                productId: reviewProductId,
                orderId: reviewOrderId || selectedOrder?.id,
                rating: reviewRating,
                comment: reviewComment,
                images: reviewImagesList,
            });
        }

        if (res && res.success !== false) {
            notification.success({
                message: editingReviewId ? 'Cập nhật đánh giá thành công' : 'Đánh giá thành công',
                description: editingReviewId
                    ? 'Đánh giá của bạn đã được cập nhật.'
                    : 'Cảm ơn bạn đã đánh giá! Bạn đã được cộng +10 điểm thưởng.',
            });
            setReviewOpen(false);
            await loadMyReviews();
        } else {
            notification.error({ message: 'Lỗi', description: res?.message || 'Có lỗi xảy ra khi gửi đánh giá' });
        }
        setSubmittingReview(false);
    };

    const handleDeleteReview = async (reviewId) => {
        const res = await deleteReviewApi(reviewId);
        if (res && res.success !== false) {
            notification.success({ message: 'Đã xóa đánh giá' });
            await loadMyReviews();
        } else {
            notification.error({ message: 'Lỗi xóa đánh giá', description: res?.message });
        }
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
                                        <span>Tạm tính: <strong>{moneyFormatter.format(selectedOrder.subtotal || 0)}</strong></span>
                                        <span>Phí ship: <strong>{moneyFormatter.format(selectedOrder.shippingFee || 0)}</strong></span>
                                        {selectedOrder.discount > 0 && (
                                            <span style={{ color: '#16a34a' }}>
                                                Giảm giá ({selectedOrder.voucherCode}): <strong>−{moneyFormatter.format(selectedOrder.discount)}</strong>
                                            </span>
                                        )}
                                        <span>Tổng cộng: <strong style={{ color: 'var(--store-primary)', fontSize: '1.05rem' }}>{moneyFormatter.format(selectedOrder.total || 0)}</strong></span>
                                    </div>
                                </Card>
                            </div>

                            {/* Products with Review */}
                            <Card className="content-card" bordered={false} size="small" title={`Sản phẩm (${selectedOrder.items?.length || 0})`}>
                                <div style={{ display: 'grid', gap: 16 }}>
                                    {selectedOrder.items?.map((item) => {
                                        const existingReview = getExistingReview(item.productId, selectedOrder.id);
                                        return (
                                            <div key={`${item.productId}-${item.slug}`} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                                                    <img src={item.image} alt={item.name}
                                                        style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 14, border: '1px solid var(--store-border)' }} />
                                                    <div style={{ flex: 1 }}>
                                                        <strong style={{ display: 'block', marginBottom: 4 }}>{item.name}</strong>
                                                        <div className="content-card__text">Số lượng: {item.quantity}</div>
                                                        <div style={{ color: 'var(--store-primary)', fontWeight: 700 }}>{moneyFormatter.format(item.lineTotal)}</div>
                                                        {existingReview && (
                                                            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <Rate disabled value={existingReview.rating} style={{ fontSize: 12 }} />
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--store-muted)' }}>Đã đánh giá</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedOrder.status === 'delivered' && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', marginTop: 8 }}>
                                                        {existingReview ? (
                                                            <>
                                                                <Button
                                                                    size="small"
                                                                    icon={<EditOutlined />}
                                                                    onClick={() => handleOpenEditReview(existingReview, item.name)}
                                                                    style={{ borderRadius: 999 }}
                                                                >
                                                                    Sửa
                                                                </Button>
                                                                <Popconfirm
                                                                    title="Xóa đánh giá này?"
                                                                    description="Điểm thưởng sẽ bị thu hồi khi xóa đánh giá."
                                                                    onConfirm={() => handleDeleteReview(existingReview._id)}
                                                                    okText="Xóa"
                                                                    cancelText="Hủy"
                                                                    okButtonProps={{ danger: true }}
                                                                >
                                                                    <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 999 }}>
                                                                        Xóa
                                                                    </Button>
                                                                </Popconfirm>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                type="primary"
                                                                size="middle"
                                                                icon={<StarFilled />}
                                                                onClick={() => handleOpenCreateReview(item.productId, item.name, selectedOrder.id)}
                                                                style={{ borderRadius: 999, fontWeight: 700 }}
                                                            >
                                                                Đánh giá
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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

            {/* Product Review Modal */}
            <Modal
                title={editingReviewId ? `Sửa đánh giá: ${reviewProductName}` : `Đánh giá sản phẩm: ${reviewProductName}`}
                open={reviewOpen}
                onCancel={() => setReviewOpen(false)}
                onOk={handleSubmitReview}
                okText={editingReviewId ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                confirmLoading={submittingReview}
                destroyOnClose
            >
                <div style={{ display: 'grid', gap: '16px', padding: '10px 0' }}>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Số sao đánh giá:</div>
                        <Rate value={reviewRating} onChange={setReviewRating} style={{ fontSize: '24px' }} />
                    </div>

                    <div>
                        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Nội dung đánh giá:</div>
                        <Input.TextArea
                            rows={4}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm (chất lượng, đóng gói, giao hàng...)"
                        />
                    </div>

                    <div>
                        <div style={{ fontWeight: 600, marginBottom: '8px' }}>Hình ảnh sản phẩm:</div>
                        <div style={{ display: 'grid', gap: '12px', marginBottom: '12px' }}>
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                customRequest={handleCustomUpload}
                                disabled={uploadingImage}
                            >
                                <Button icon={<UploadOutlined />} loading={uploadingImage} style={{ borderRadius: 8, width: '100%' }}>
                                    Tải ảnh lên từ máy tính (lưu Cloudinary an toàn)
                                </Button>
                            </Upload>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', background: '#ffffff', padding: '0 8px', position: 'relative', zIndex: 1 }}>HOẶC DÁN LINK URL ẢNH</span>
                                <div style={{ borderBottom: '1px dashed #e2e8f0', width: '100%', position: 'absolute' }}></div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Input
                                    value={reviewImageInput}
                                    onChange={(e) => setReviewImageInput(e.target.value)}
                                    placeholder="Dán link hình ảnh trực tiếp tại đây..."
                                    onPressEnter={handleAddReviewImage}
                                    style={{ borderRadius: 8 }}
                                />
                                <Button onClick={handleAddReviewImage} style={{ borderRadius: 8 }}>Thêm</Button>
                            </div>
                        </div>
                        {reviewImagesList.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                {reviewImagesList.map((url, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                        <img src={url} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveReviewImage(idx)}
                                            style={{
                                                position: 'absolute', top: '2px', right: '2px',
                                                background: '#ef4444', color: '#ffffff', border: 'none',
                                                borderRadius: '50%', width: '16px', height: '16px',
                                                fontSize: '10px', fontWeight: 'bold', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                                            }}
                                        >✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default OrdersPage;