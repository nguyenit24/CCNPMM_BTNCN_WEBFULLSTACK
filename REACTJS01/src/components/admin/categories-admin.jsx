import { useEffect, useState, useMemo } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Card, notification } from 'antd';
import { SearchOutlined, AppstoreOutlined, FileImageOutlined, EditOutlined, DeleteOutlined, OrderedListOutlined } from '@ant-design/icons';
import { createCategoryApi, deleteCategoryApi, getCategoriesApi, updateCategoryApi } from '../../util/api';
import AdminCard from './admin-card';

const { TextArea } = Input;
const PAGE_SIZE = 8;

const CategoriesAdmin = () => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Watch image URL to show dynamic live preview in form
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    const loadCategories = async (nextPage = 1, nextPageSize = pageSize) => {
        setLoading(true);
        const res = await getCategoriesApi({ page: nextPage, limit: nextPageSize });
        if (res?.message) {
            notification.error({ message: 'Tải danh mục thất bại', description: res.message });
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
        loadCategories();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setImagePreviewUrl('');
        form.resetFields();
        form.setFieldsValue({ order: 0 });
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        setImagePreviewUrl(record.image || '');
        form.setFieldsValue({
            name: record.name,
            slug: record.slug,
            description: record.description,
            image: record.image,
            order: record.order,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            const res = editing ? await updateCategoryApi(editing.slug, values) : await createCategoryApi(values);
            if (res?.message) {
                throw new Error(res.message);
            }
            notification.success({
                message: editing ? 'Cập nhật danh mục' : 'Tạo danh mục mới',
                description: 'Lưu dữ liệu thành công!',
            });
            setModalOpen(false);
            form.resetFields();
            loadCategories(page, pageSize);
        } catch (error) {
            notification.error({
                message: editing ? 'Cập nhật danh mục thất bại' : 'Tạo danh mục thất bại',
                description: error.message || 'Yêu cầu không thành công',
            });
        }
    };

    const handleDelete = async (record) => {
        const res = await deleteCategoryApi(record.slug);
        if (res?.message) {
            notification.error({ message: 'Xóa danh mục thất bại', description: res.message });
            return;
        }
        notification.success({ message: 'Xóa danh mục', description: 'Đã gỡ danh mục thành công!' });
        loadCategories(page, pageSize);
    };

    const filteredItems = useMemo(() => {
        const query = String(searchQuery || '').trim().toLowerCase();
        if (!query) return items;
        return items.filter(
            (item) =>
                String(item.name || '').toLowerCase().includes(query) ||
                String(item.slug || '').toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 100,
            render: (url) => (
                <div className="admin-table-image-container">
                    <img
                        src={url || 'https://placehold.co/100x100?text=No+Image'}
                        alt="Category"
                        className="admin-table-image"
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/100x100?text=Error';
                        }}
                    />
                </div>
            ),
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
            render: (name) => <strong style={{ color: 'var(--store-text)', fontSize: '0.95rem' }}>{name}</strong>,
        },
        {
            title: 'Slug (Đường dẫn)',
            dataIndex: 'slug',
            key: 'slug',
            render: (slug) => <code style={{ padding: '2px 6px', background: '#f1f5f9', borderRadius: 6 }}>{slug}</code>,
        },
        {
            title: 'Mô tả ngắn',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (desc) => desc || <span style={{ color: 'var(--store-muted)' }}>Không có mô tả</span>,
        },
        {
            title: 'Thứ tự ưu tiên',
            dataIndex: 'order',
            key: 'order',
            sorter: (a, b) => (a.order || 0) - (b.order || 0),
            render: (ord) => <span style={{ fontWeight: 700, color: 'var(--store-primary)' }}>{ord}</span>,
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
                        title="Xác nhận xóa danh mục này? Tất cả bài viết & sản phẩm thuộc danh mục có thể bị ảnh hưởng."
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
        <AdminCard title="Quản lý Danh mục" onReload={() => loadCategories(page, pageSize)} onCreate={openCreate}>
            <Card style={{ marginBottom: 20, borderRadius: 20 }} bodyStyle={{ padding: 16 }} bordered={false} className="glass-card">
                <Input
                    placeholder="Tìm kiếm danh mục theo tên hoặc đường dẫn slug..."
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
                    onChange: (nextPage, nextPageSize) => loadCategories(nextPage, nextPageSize),
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} danh mục`,
                }}
                style={{ borderRadius: 20, overflow: 'hidden' }}
            />

            <Modal
                className="admin-modal premium-modal"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem', fontWeight: 700 }}>
                        <AppstoreOutlined style={{ color: 'var(--store-primary)' }} />
                        {editing ? 'Cập nhật danh mục' : 'Tạo danh mục mới'}
                    </div>
                }
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editing ? 'Lưu thay đổi' : 'Tạo danh mục'}
                cancelText="Hủy bỏ"
                destroyOnClose
                bodyStyle={{ paddingTop: 16 }}
                okButtonProps={{ style: { borderRadius: 12, height: 40, paddingLeft: 24, paddingRight: 24 } }}
                cancelButtonProps={{ style: { borderRadius: 12, height: 40 } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-modal-form">
                    <Form.Item
                        name="name"
                        label={<strong>Tên danh mục</strong>}
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input placeholder="Ví dụ: Tai nghe Gaming" style={{ borderRadius: 10 }} size="large" />
                    </Form.Item>
                    
                    <Form.Item name="slug" label={<strong>Đường dẫn (Slug)</strong>} extra="Để trống hệ thống sẽ tự sinh từ tên danh mục">
                        <Input placeholder="Ví dụ: tai-nghe-gaming" style={{ borderRadius: 10 }} size="large" />
                    </Form.Item>

                    <Form.Item name="description" label={<strong>Mô tả chi tiết</strong>}>
                        <TextArea rows={3} placeholder="Mô tả tóm tắt tính chất của danh mục sản phẩm..." style={{ borderRadius: 10 }} />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label={<strong>Đường dẫn hình ảnh minh họa</strong>}
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
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--store-muted)', marginBottom: 8 }}>Xem trước hình ảnh:</span>
                            <img
                                src={imagePreviewUrl}
                                alt="Image Preview"
                                style={{ maxWidth: '120px', maxHeight: '120px', borderRadius: 12, objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    ) : null}

                    <Form.Item 
                        name="order" 
                        label={<strong>Thứ tự sắp xếp (ưu tiên)</strong>}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%', borderRadius: 10 }}
                            size="large"
                            prefix={<OrderedListOutlined />}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminCard>
    );
};

export default CategoriesAdmin;
