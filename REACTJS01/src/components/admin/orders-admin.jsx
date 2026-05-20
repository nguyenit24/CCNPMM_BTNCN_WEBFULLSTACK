import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Tag, notification } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import AdminCard from './admin-card';
import { getOrdersApi, updateOrderStatusApi } from '../../util/api';

const ORDER_STATUS_OPTIONS = [
    { value: 'new', label: 'Đơn hàng mới' },
    { value: 'confirmed', label: 'Đã xác nhận đơn hàng' },
    { value: 'preparing', label: 'Shop đang chuẩn bị hàng' },
    { value: 'shipped', label: 'Đang giao hàng' },
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

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

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
            notification.error({ message: 'Load orders', description: res.message });
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
            notification.error({ message: 'Cập nhật đơn hàng', description: res.message });
            return;
        }

        notification.success({ message: 'Cập nhật đơn hàng', description: 'Trạng thái đơn hàng đã được lưu.' });
        setModalOpen(false);
        setEditingOrder(null);
        form.resetFields();
        loadOrders();
    };

    const columns = useMemo(() => ([
        { title: 'Mã đơn', dataIndex: 'orderCode' },
        {
            title: 'Khách hàng',
            render: (_, record) => record.customer?.name || '---',
        },
        {
            title: 'Tổng tiền',
            render: (_, record) => currencyFormatter.format(record.total || 0),
        },
        {
            title: 'Thanh toán',
            render: (_, record) => record.paymentMethodLabel || record.paymentMethod || 'COD',
        },
        {
            title: 'Trạng thái',
            render: (_, record) => <Tag color={ORDER_STATUS_COLORS[record.status] || 'default'}>{record.statusLabel || record.status}</Tag>,
        },
        {
            title: 'Hủy đơn',
            render: (_, record) => record.cancellation?.requestStatus === 'pending'
                ? <Tag color="volcano">Yêu cầu chờ xử lý</Tag>
                : <Tag color="default">{record.cancellation?.requestStatus || 'none'}</Tag>,
        },
        {
            title: 'Ngày tạo',
            render: (_, record) => record.createdAt ? new Date(record.createdAt).toLocaleString('vi-VN') : '---',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => openEdit(record)}>
                        Cập nhật
                    </Button>
                </Space>
            ),
        },
    ]), []);

    return (
        <AdminCard title="Orders" onReload={loadOrders}>
            <Table
                className="admin-table"
                rowKey="id"
                columns={columns}
                dataSource={items}
                loading={loading}
                pagination={{ pageSize: 8 }}
            />

            <Modal
                title={editingOrder ? `Cập nhật ${editingOrder.orderCode}` : 'Cập nhật đơn hàng'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingOrder(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Lưu trạng thái"
                destroyOnClose
                width={720}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
                                <Select options={ORDER_STATUS_OPTIONS} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Khách hàng">
                                <Input value={editingOrder?.customer?.name || ''} disabled />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="note" label="Ghi chú chuyển trạng thái">
                        <Input.TextArea rows={4} placeholder="Ghi chú cho shop hoặc thông tin xử lý đơn hàng" />
                    </Form.Item>

                    {editingOrder ? (
                        <Card size="small" bordered={false} className="content-card" title="Thông tin đơn hàng">
                            <div style={{ display: 'grid', gap: 8 }}>
                                <div>Mã đơn: <strong>{editingOrder.orderCode}</strong></div>
                                <div>Địa chỉ: <strong>{editingOrder.shippingAddress?.formattedAddress}</strong></div>
                                <div>Tổng tiền: <strong>{currencyFormatter.format(editingOrder.total || 0)}</strong></div>
                            </div>
                        </Card>
                    ) : null}
                </Form>
            </Modal>
        </AdminCard>
    );
};

export default OrdersAdmin;