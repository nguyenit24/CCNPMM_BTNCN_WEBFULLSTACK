import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Tag, Steps, notification, Alert, Divider, Tooltip } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, HomeOutlined, CreditCardOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import AdminCard from './admin-card';
import { getOrdersApi, updateOrderStatusApi } from '../../util/api';

const ORDER_STATUS_OPTIONS = [
    { value: 'new', label: 'Đơn hàng mới (Chờ duyệt)' },
    { value: 'confirmed', label: 'Đã xác nhận đơn hàng' },
    { value: 'preparing', label: 'Shop đang chuẩn bị hàng' },
    { value: 'shipped', label: 'Đang vận chuyển' },
    { value: 'delivered', label: 'Đã giao thành công' },
    { value: 'cancelled', label: 'Hủy đơn hàng' },
];

const ORDER_STATUS_COLORS = {
    new: 'gold',
    confirmed: 'blue',
    preparing: 'orange',
    shipped: 'processing',
    delivered: 'green',
    cancelled: 'red',
};

const ORDER_STATUS_LABELS = {
    new: 'Mới',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
};

const STATUS_STEPS = ['new', 'confirmed', 'preparing', 'shipped', 'delivered'];

const OrdersAdmin = () => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    const loadOrders = async () => {
        setLoading(true);
        const res = await getOrdersApi();

        if (res?.message) {
            notification.error({ message: 'Tải đơn hàng thất bại', description: res.message });
            setItems([]);
        } else {
            setItems(Array.isArray(res) ? res : []);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const openEdit = (record) => {
        setEditingOrder(record);
        form.setFieldsValue({
            status: record.status,
            note: '',
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        if (!editingOrder) {
            return;
        }

        const res = await updateOrderStatusApi(editingOrder.id, values);
        if (res?.message) {
            notification.error({ message: 'Cập nhật đơn hàng thất bại', description: res.message });
            return;
        }

        notification.success({ 
            message: 'Cập nhật đơn hàng', 
            description: `Đơn hàng ${editingOrder.orderCode} đã chuyển sang trạng thái "${ORDER_STATUS_LABELS[values.status]}".` 
        });
        setModalOpen(false);
        setEditingOrder(null);
        form.resetFields();
        loadOrders();
    };

    const handleQuickCancelAction = async (approve) => {
        if (!editingOrder) return;
        
        const payload = approve 
            ? { status: 'cancelled', note: 'Chấp nhận yêu cầu hủy đơn từ khách hàng.' }
            : { status: 'confirmed', note: 'Từ chối yêu cầu hủy đơn, tiếp tục xử lý.' }; // or reset status

        const res = await updateOrderStatusApi(editingOrder.id, payload);
        if (res?.message) {
            notification.error({ message: 'Thao tác thất bại', description: res.message });
            return;
        }

        notification.success({
            message: 'Xử lý yêu cầu hủy đơn',
            description: approve ? 'Đã chấp nhận và hủy đơn hàng.' : 'Đã bác bỏ yêu cầu hủy đơn hàng.',
        });
        setModalOpen(false);
        setEditingOrder(null);
        form.resetFields();
        loadOrders();
    };

    // Auto-detect and format currency (VND vs USD)
    const formatPrice = (value) => {
        if (value >= 10000) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    const columns = useMemo(() => ([
        { 
            title: 'Mã đơn hàng', 
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (code) => <strong style={{ color: 'var(--store-primary)' }}>{code}</strong>
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <div>
                    <strong>{record.customer?.name || '---'}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--store-muted)' }}>{record.customer?.phone}</div>
                </div>
            ),
        },
        {
            title: 'Tổng giá trị',
            key: 'total',
            sorter: (a, b) => (a.total || 0) - (b.total || 0),
            render: (_, record) => <strong style={{ color: 'var(--store-primary)' }}>{formatPrice(record.total || 0)}</strong>,
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method, record) => (
                <div>
                    <Tag color="purple" style={{ borderRadius: 6 }}>{method || 'COD'}</Tag>
                    <div style={{ fontSize: '0.8rem', color: record.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                        {record.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => <Tag color={ORDER_STATUS_COLORS[status] || 'default'} style={{ borderRadius: 10, padding: '2px 8px', fontWeight: 600 }}>{record.statusLabel || ORDER_STATUS_LABELS[status] || status}</Tag>,
        },
        {
            title: 'Yêu cầu hủy',
            key: 'cancellation',
            render: (_, record) => {
                if (record.cancellation?.requestStatus === 'pending') {
                    return <Tag color="volcano" style={{ borderRadius: 4, animation: 'pulse 1.5s infinite' }}>Có yêu cầu hủy</Tag>;
                }
                if (record.cancellation?.requestStatus === 'approved') {
                    return <Tag color="red" style={{ borderRadius: 4 }}>Đã hủy</Tag>;
                }
                return <span style={{ color: 'var(--store-muted)', fontSize: '0.85rem' }}>Không có</span>;
            },
        },
        {
            title: 'Ngày đặt hàng',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '---',
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 140,
            render: (_, record) => (
                <Button size="middle" type="primary" ghost icon={<EyeOutlined />} onClick={() => openEdit(record)} style={{ borderRadius: 10 }}>
                    Chi tiết
                </Button>
            ),
        },
    ]), []);

    // Steps Index mapping
    const currentStep = STATUS_STEPS.indexOf(editingOrder?.status);
    const isCancelled = editingOrder?.status === 'cancelled';

    return (
        <AdminCard title="Quản lý Đơn hàng" onReload={loadOrders}>
            <Table
                className="admin-table custom-premium-table"
                rowKey="id"
                columns={columns}
                dataSource={items}
                loading={loading}
                pagination={{
                    pageSize: 8,
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} đơn hàng`
                }}
                style={{ borderRadius: 20, overflow: 'hidden' }}
                scroll={{ x: true }}
            />

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem', fontWeight: 700 }}>
                        <FileTextOutlined style={{ color: 'var(--store-primary)' }} />
                        {editingOrder ? `Chi tiết đơn hàng: ${editingOrder.orderCode}` : 'Chi tiết đơn hàng'}
                    </div>
                }
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingOrder(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Lưu thay đổi"
                cancelText="Hủy bỏ"
                destroyOnClose
                width={800}
                bodyStyle={{ paddingTop: 16 }}
                okButtonProps={{ style: { borderRadius: 12, height: 40, paddingLeft: 24, paddingRight: 24 } }}
                cancelButtonProps={{ style: { borderRadius: 12, height: 40 } }}
            >
                {editingOrder ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* 1. Cancellation alert if there is a pending request */}
                        {editingOrder.cancellation?.requestStatus === 'pending' && (
                            <Alert
                                message={<strong>Yêu cầu hủy đơn hàng từ khách hàng</strong>}
                                description={
                                    <div style={{ marginTop: 8 }}>
                                        <div>Lý do hủy đơn: <strong style={{ color: '#ef4444' }}>"{editingOrder.cancellation.requestedReason || 'Không rõ lý do'}"</strong></div>
                                        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                                            <Button type="primary" danger icon={<CheckCircleOutlined />} onClick={() => handleQuickCancelAction(true)} style={{ borderRadius: 8 }}>
                                                Chấp nhận hủy đơn
                                            </Button>
                                            <Button type="default" icon={<CloseCircleOutlined />} onClick={() => handleQuickCancelAction(false)} style={{ borderRadius: 8 }}>
                                                Từ chối & Tiếp tục
                                            </Button>
                                        </div>
                                    </div>
                                }
                                type="warning"
                                showIcon
                                style={{ borderRadius: 12 }}
                            />
                        )}

                        {/* 2. Visual Progress Steps */}
                        <Card size="small" style={{ borderRadius: 12, border: 'none', background: '#f8fafc' }}>
                            <Steps
                                size="small"
                                current={isCancelled ? 0 : currentStep >= 0 ? currentStep : 0}
                                status={isCancelled ? 'error' : 'process'}
                                items={[
                                    { title: 'Chờ duyệt', description: editingOrder.createdAt ? new Date(editingOrder.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '' },
                                    { title: 'Xác nhận', description: editingOrder.confirmedAt ? new Date(editingOrder.confirmedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '' },
                                    { title: 'Chuẩn bị', description: editingOrder.preparingAt ? new Date(editingOrder.preparingAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '' },
                                    { title: 'Đang giao', description: editingOrder.shippedAt ? new Date(editingOrder.shippedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '' },
                                    { title: 'Đã giao', description: editingOrder.deliveredAt ? new Date(editingOrder.deliveredAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '' },
                                ]}
                            />
                            {isCancelled && (
                                <div style={{ color: '#ef4444', textAlign: 'center', marginTop: 12, fontWeight: 600 }}>
                                    Đơn hàng đã hủy vào lúc {editingOrder.cancelledAt ? new Date(editingOrder.cancelledAt).toLocaleString('vi-VN') : 'Không rõ'}
                                </div>
                            )}
                        </Card>

                        {/* 3. Invoice Header Detail Cards */}
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Card size="small" title={<Space><UserOutlined style={{ color: 'var(--store-primary)' }} /><strong>Thông tin người mua</strong></Space>} style={{ height: '100%', borderRadius: 12 }}>
                                    <div style={{ display: 'grid', gap: 6, fontSize: '0.85rem' }}>
                                        <div>Tên: <strong>{editingOrder.customer?.name}</strong></div>
                                        <div>Email: <strong>{editingOrder.customer?.email}</strong></div>
                                        <div>Số điện thoại: <strong>{editingOrder.customer?.phone}</strong></div>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <Card size="small" title={<Space><HomeOutlined style={{ color: 'var(--store-primary)' }} /><strong>Địa chỉ giao nhận</strong></Space>} style={{ height: '100%', borderRadius: 12 }}>
                                    <div style={{ display: 'grid', gap: 6, fontSize: '0.85rem' }}>
                                        <div>Người nhận: <strong>{editingOrder.shippingAddress?.recipientName}</strong></div>
                                        <div>Điện thoại: <strong>{editingOrder.shippingAddress?.phone}</strong></div>
                                        <div>Địa chỉ: <Tooltip title={editingOrder.shippingAddress?.formattedAddress}><strong>{editingOrder.shippingAddress?.formattedAddress}</strong></Tooltip></div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* 4. Order Items Table */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                            <div style={{ background: '#f8fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Sản phẩm đã mua</div>
                            <Table
                                size="small"
                                dataSource={editingOrder.items || []}
                                pagination={false}
                                rowKey="slug"
                                columns={[
                                    {
                                        title: 'Ảnh',
                                        dataIndex: 'image',
                                        key: 'image',
                                        width: 60,
                                        render: (url) => (
                                            <img
                                                src={url || 'https://placehold.co/100x100?text=Product'}
                                                style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Error'; }}
                                            />
                                        )
                                    },
                                    {
                                        title: 'Sản phẩm',
                                        dataIndex: 'name',
                                        key: 'name',
                                        render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>
                                    },
                                    {
                                        title: 'Giá',
                                        dataIndex: 'price',
                                        key: 'price',
                                        align: 'right',
                                        render: (price) => formatPrice(price)
                                    },
                                    {
                                        title: 'SL',
                                        dataIndex: 'quantity',
                                        key: 'quantity',
                                        align: 'center',
                                        render: (q) => <strong>x{q}</strong>
                                    },
                                    {
                                        title: 'Tổng',
                                        dataIndex: 'lineTotal',
                                        key: 'lineTotal',
                                        align: 'right',
                                        render: (total) => <strong style={{ color: 'var(--store-primary)' }}>{formatPrice(total)}</strong>
                                    }
                                ]}
                            />
                            
                            {/* Order summary calculations */}
                            <div style={{ padding: 16, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--store-muted)' }}>Tạm tính:</span>
                                    <strong>{formatPrice(editingOrder.subtotal || 0)}</strong>
                                </div>
                                <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--store-muted)' }}>Phí vận chuyển:</span>
                                    <strong>{formatPrice(editingOrder.shippingFee || 0)}</strong>
                                </div>
                                <Divider style={{ margin: '8px 0', width: '220px' }} />
                                <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between', fontSize: '1rem' }}>
                                    <span style={{ fontWeight: 600 }}>Thành tiền:</span>
                                    <strong style={{ color: 'var(--store-primary)', fontSize: '1.1rem' }}>{formatPrice(editingOrder.total || 0)}</strong>
                                </div>
                            </div>
                        </div>

                        {/* 5. Update Status Control Form */}
                        <div style={{ border: '1px solid #e2e8f0', padding: 20, borderRadius: 12 }}>
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>Cập nhật trạng thái đơn hàng</div>
                            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="status" label={<strong>Trạng thái xử lý</strong>} rules={[{ required: true, message: 'Chọn trạng thái!' }]}>
                                            <Select options={ORDER_STATUS_OPTIONS} style={{ borderRadius: 8, height: 38 }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label={<strong>Phương thức thanh toán</strong>}>
                                            <Input value={`${editingOrder.paymentMethod || 'COD'} (${editingOrder.paymentStatus === 'paid' ? 'Đã thu tiền' : 'Chưa thu tiền'})`} disabled style={{ borderRadius: 8, height: 38 }} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item name="note" label={<strong>Ghi chú lý do chuyển đổi trạng thái</strong>} extra="Nhật ký này sẽ được lưu trữ lại trong lịch sử đơn hàng để đối soát.">
                                    <Input.TextArea rows={3} placeholder="Ví dụ: Đã đóng gói xong và bàn giao cho đơn vị vận chuyển ViettelPost..." style={{ borderRadius: 8 }} />
                                </Form.Item>
                            </Form>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </AdminCard>
    );
};

export default OrdersAdmin;