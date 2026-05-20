import { useEffect, useState, useMemo } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Card, Tag, notification } from 'antd';
import { SearchOutlined, GiftOutlined, FileImageOutlined, EditOutlined, DeleteOutlined, PercentageOutlined } from '@ant-design/icons';
import { createPromotionApi, deletePromotionApi, getPromotionsApi, updatePromotionApi } from '../../util/api';
import AdminCard from './admin-card';

const { TextArea } = Input;
const PAGE_SIZE = 8;

const PromotionsAdmin = () => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    const loadPromotions = async (nextPage = 1, nextPageSize = pageSize) => {
        setLoading(true);
        const res = await getPromotionsApi({ page: nextPage, limit: nextPageSize });
        if (res?.message) {
            notification.error({ message: 'Tải khuyến mãi thất bại', description: res.message });
            setItems([]);
            setTotal(0);
        } else {
            const nextItems = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
            setItems(nextItems);
            setTotal(Number(res?.total ?? nextItems.length));
            setPage(nextPage);
            setPageSize(nextPageSize);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setImagePreviewUrl('');
        form.resetFields();
        form.setFieldsValue({ discountPercent: 0, order: 0 });
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        setImagePreviewUrl(record.image || '');
        form.setFieldsValue({
            title: record.title,
            slug: record.slug,
            description: record.description,
            image: record.image,
            discountPercent: record.discountPercent,
            discountCode: record.discountCode,
            order: record.order,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            const res = editing ? await updatePromotionApi(editing.slug, values) : await createPromotionApi(values);
            if (res?.message) {
                throw new Error(res.message);
            }
            notification.success({
                message: editing ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi mới',
                description: 'Lưu dữ liệu thành công!',
            });
            setModalOpen(false);
            form.resetFields();
            loadPromotions(page, pageSize);
        } catch (error) {
            notification.error({
                message: editing ? 'Cập nhật khuyến mãi thất bại' : 'Tạo khuyến mãi thất bại',
                description: error.message || 'Yêu cầu không thành công',
            });
        }
    };

    const handleDelete = async (record) => {
        const res = await deletePromotionApi(record.slug);
        if (res?.message) {
            notification.error({ message: 'Xóa khuyến mãi thất bại', description: res.message });
            return;
        }
        notification.success({ message: 'Xóa khuyến mãi', description: 'Đã gỡ chương trình thành công!' });
        loadPromotions(page, pageSize);
    };

    const filteredItems = useMemo(() => {
        const query = String(searchQuery || '').trim().toLowerCase();
        if (!query) return items;
        return items.filter(
            (item) =>
                String(item.title || '').toLowerCase().includes(query) ||
                String(item.discountCode || '').toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    const columns = [
        {
            title: 'Banner',
            dataIndex: 'image',
            key: 'image',
            width: 160,
            render: (url) => (
                <div className="admin-table-image-container admin-table-image-container--wide">
                    <img
                        src={url || 'https://placehold.co/320x180?text=No+Banner'}
                        alt="Promotion"
                        className="admin-table-image"
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/320x180?text=Error';
                        }}
                    />
                </div>
            ),
        },
        {
            title: 'Tiêu đề khuyến mãi',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => String(a.title || '').localeCompare(String(b.title || '')),
            render: (title) => <strong style={{ color: 'var(--store-text)', fontSize: '0.95rem' }}>{title}</strong>,
        },
        {
            title: 'Mã giảm giá',
            dataIndex: 'discountCode',
            key: 'discountCode',
            render: (code) => code ? (
                <Tag color="volcano" style={{ borderRadius: 8, padding: '2px 10px', fontWeight: 800 }}>
                    {code.toUpperCase()}
                </Tag>
            ) : <span style={{ color: 'var(--store-muted)' }}>---</span>,
        },
        {
            title: 'Phần trăm giảm',
            dataIndex: 'discountPercent',
            key: 'discountPercent',
            sorter: (a, b) => (a.discountPercent || 0) - (b.discountPercent || 0),
            render: (pct) => pct ? (
                <Tag color="green" style={{ borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>
                    -{pct}%
                </Tag>
            ) : <span style={{ color: 'var(--store-muted)' }}>0%</span>,
        },
        {
            title: 'Độ ưu tiên',
            dataIndex: 'order',
            key: 'order',
            sorter: (a, b) => (a.order || 0) - (b.order || 0),
            render: (ord) => <span style={{ fontWeight: 700 }}>{ord}</span>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        size="middle"
                        type="primary"
                        ghost
                        icon={<EditOutlined />}
                        onClick={() => openEdit(record)}
                        style={{ borderRadius: 10 }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa chương trình khuyến mãi này?"
                        onConfirm={() => handleDelete(record)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true, shape: 'round' }}
                        cancelButtonProps={{ shape: 'round' }}
                    >
                        <Button
                            size="middle"
                            danger
                            type="primary"
                            ghost
                            icon={<DeleteOutlined />}
                            style={{ borderRadius: 10 }}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AdminCard title="Khuyến mãi & Banners" onReload={() => loadPromotions(page, pageSize)} onCreate={openCreate}>
            <Card style={{ marginBottom: 20, borderRadius: 20 }} bodyStyle={{ padding: 16 }} bordered={false} className="glass-card">
                <Input
                    placeholder="Tìm kiếm chương trình theo tiêu đề hoặc mã giảm giá..."
                    prefix={<SearchOutlined style={{ color: 'var(--store-muted)' }} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                    size="large"
                    style={{ borderRadius: 12 }}
                />
            </Card>

            <Table
                className="admin-table custom-premium-table"
                rowKey="slug"
                columns={columns}
                dataSource={filteredItems}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: false,
                    onChange: (nextPage, nextPageSize) => loadPromotions(nextPage, nextPageSize),
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} chương trình`,
                }}
                style={{ borderRadius: 20, overflow: 'hidden' }}
            />

            <Modal
                className="admin-modal premium-modal"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem', fontWeight: 700 }}>
                        <GiftOutlined style={{ color: 'var(--store-primary)' }} />
                        {editing ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi mới'}
                    </div>
                }
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editing ? 'Lưu thay đổi' : 'Tạo chương trình'}
                cancelText="Hủy bỏ"
                destroyOnClose
                bodyStyle={{ paddingTop: 16 }}
                okButtonProps={{ style: { borderRadius: 12, height: 40, paddingLeft: 24, paddingRight: 24 } }}
                cancelButtonProps={{ style: { borderRadius: 12, height: 40 } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-modal-form">
                    <Form.Item
                        name="title"
                        label={<strong>Tiêu đề khuyến mãi / Tên Banner</strong>}
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề khuyến mãi!' }]}
                    >
                        <Input placeholder="Ví dụ: Siêu hội tai nghe - Giảm sâu 40%" style={{ borderRadius: 10 }} size="large" />
                    </Form.Item>

                    <Form.Item name="slug" label={<strong>Đường dẫn (Slug)</strong>} extra="Để trống hệ thống sẽ tự sinh từ tiêu đề">
                        <Input placeholder="Ví dụ: sieu-hoi-tai-nghe" style={{ borderRadius: 10 }} size="large" />
                    </Form.Item>

                    <Form.Item name="description" label={<strong>Nội dung chương trình</strong>}>
                        <TextArea rows={3} placeholder="Mô tả các điều kiện hoặc nội dung của chương trình..." style={{ borderRadius: 10 }} />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label={<strong>Đường dẫn hình ảnh Banner (Tỉ lệ khuyến nghị 16:9)</strong>}
                        rules={[{ required: true, message: 'Vui lòng điền link ảnh banner' }]}
                    >
                        <Input
                            prefix={<FileImageOutlined />}
                            placeholder="https://..."
                            style={{ borderRadius: 10 }}
                            size="large"
                            value={imagePreviewUrl}
                            onChange={(e) => setImagePreviewUrl(e.target.value)}
                        />
                    </Form.Item>

                    {imagePreviewUrl ? (
                        <div style={{ marginBottom: 20, textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--store-muted)', marginBottom: 8 }}>Xem trước Banner:</span>
                            <img
                                src={imagePreviewUrl}
                                alt="Banner Preview"
                                style={{ width: '100%', maxHeight: '160px', borderRadius: 12, objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    ) : null}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="discountCode" label={<strong>Mã giảm giá (Coupon)</strong>}>
                            <Input placeholder="Ví dụ: TECH40" style={{ borderRadius: 10 }} size="large" />
                        </Form.Item>

                        <Form.Item name="discountPercent" label={<strong>Phần trăm giảm (%)</strong>}>
                            <InputNumber
                                min={0}
                                max={100}
                                style={{ width: '100%', borderRadius: 10 }}
                                size="large"
                                prefix={<PercentageOutlined />}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item name="order" label={<strong>Thứ tự hiển thị</strong>}>
                        <InputNumber min={0} style={{ width: '100%', borderRadius: 10 }} size="large" />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminCard>
    );
};

export default PromotionsAdmin;
