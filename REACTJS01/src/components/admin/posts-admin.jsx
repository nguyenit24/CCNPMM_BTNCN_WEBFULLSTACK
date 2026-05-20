import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, Card, Select, notification, Divider, Tabs } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, BookOutlined, FileTextOutlined, CalendarOutlined, EyeOutlined, TagsOutlined, FileImageOutlined } from '@ant-design/icons';
import { createPostApi, deletePostApi, getPostsApi, updatePostApi, getCategoriesApi } from '../../util/api';
import AdminCard from './admin-card';
import { joinList, splitList } from './admin-utils';

const { TextArea } = Input;
const PAGE_SIZE = 8;

const PostsAdmin = () => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('edit');

    // Live preview watches
    const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [previewContent, setPreviewContent] = useState('');
    const [previewExcerpt, setPreviewExcerpt] = useState('');

    const loadCategories = async () => {
        try {
            const res = await getCategoriesApi();
            if (res && !res.message) {
                const list = Array.isArray(res.items) ? res.items : Array.isArray(res) ? res : [];
                setCategories(list);
            }
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const loadPosts = async (nextPage = 1, nextPageSize = pageSize, search = searchQuery) => {
        setLoading(true);
        const res = await getPostsApi({ limit: nextPageSize, page: nextPage, q: search });
        if (res?.message) {
            notification.error({ message: 'Tải bài viết thất bại', description: res.message });
            setItems([]);
            setTotal(0);
        } else {
            setItems(Array.isArray(res?.items) ? res.items : []);
            setTotal(Number(res?.total ?? 0));
            setPage(nextPage);
            setPageSize(nextPageSize);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCategories();
        loadPosts();
    }, []);

    const handleSearch = () => {
        loadPosts(1, pageSize, searchQuery);
    };

    const openCreate = () => {
        setEditing(null);
        setCoverPreviewUrl('');
        setPreviewTitle('');
        setPreviewContent('');
        setPreviewExcerpt('');
        setActiveTab('edit');
        form.resetFields();
        form.setFieldsValue({
            readTime: '3 phút đọc',
            featured: false,
            publishedAt: new Date().toISOString().slice(0, 10),
            categorySlug: 'tin-tuc'
        });
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        setCoverPreviewUrl(record.cover || '');
        setPreviewTitle(record.title || '');
        setPreviewExcerpt(record.excerpt || '');
        setPreviewContent(record.content || '');
        setActiveTab('edit');
        form.setFieldsValue({
            title: record.title,
            slug: record.slug,
            excerpt: record.excerpt,
            content: record.content,
            categorySlug: record.categorySlug,
            cover: record.cover,
            readTime: record.readTime,
            featured: Boolean(record.featured),
            tags: joinList(record.tags),
            publishedAt: record.publishedAt ? String(record.publishedAt).slice(0, 10) : '',
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            // Map categoryName based on chosen categorySlug
            const selectedCat = categories.find(cat => cat.slug === values.categorySlug);
            const categoryName = selectedCat ? selectedCat.name : 'Tin tức';

            const payload = {
                ...values,
                categoryName,
                tags: splitList(values.tags),
            };

            const res = editing ? await updatePostApi(editing.slug, payload) : await createPostApi(payload);

            if (res?.message) {
                throw new Error(res.message);
            }

            notification.success({
                message: editing ? 'Cập nhật bài viết' : 'Đăng bài viết mới',
                description: 'Dữ liệu đã được xuất bản thành công!',
            });
            setModalOpen(false);
            form.resetFields();
            loadPosts(page, pageSize);
        } catch (error) {
            notification.error({
                message: editing ? 'Đăng bài viết thất bại' : 'Thao tác thất bại',
                description: error.message || 'Yêu cầu không thành công',
            });
        }
    };

    const handleDelete = async (record) => {
        const res = await deletePostApi(record.slug);
        if (res?.message) {
            notification.error({ message: 'Xóa bài viết thất bại', description: res.message });
            return;
        }
        notification.success({ message: 'Xóa bài viết', description: 'Đã gỡ bài viết thành công!' });
        loadPosts(page, pageSize);
    };

    const columns = [
        {
            title: 'Ảnh bìa',
            dataIndex: 'cover',
            key: 'cover',
            width: 100,
            render: (url) => (
                <div className="admin-table-image-container" style={{ aspectRatio: '16/10', height: 48, width: 80 }}>
                    <img
                        src={url || 'https://placehold.co/160x100?text=No+Cover'}
                        alt="Cover"
                        className="admin-table-image"
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/160x100?text=Error';
                        }}
                    />
                </div>
            ),
        },
        {
            title: 'Tiêu đề bài viết',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => String(a.title || '').localeCompare(String(b.title || '')),
            render: (title, record) => (
                <div>
                    <strong style={{ color: 'var(--store-text)', fontSize: '0.95rem', display: 'block' }}>{title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--store-muted)' }}>/{record.slug}</span>
                </div>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (catName) => <Tag color="blue" style={{ borderRadius: 6 }}>{catName || 'Tin tức'}</Tag>,
        },
        {
            title: 'Thông tin bài viết',
            key: 'info',
            render: (_, record) => (
                <div style={{ fontSize: '0.8rem', color: 'var(--store-muted)' }}>
                    <div>Thời gian đọc: <strong>{record.readTime || '3 phút'}</strong></div>
                    <div>Xuất bản: <strong>{record.publishedAt ? new Date(record.publishedAt).toLocaleDateString('vi-VN') : '---'}</strong></div>
                </div>
            ),
        },
        {
            title: 'Nổi bật',
            dataIndex: 'featured',
            key: 'featured',
            render: (val) => val ? <Tag color="gold" style={{ borderRadius: 6 }}>Nổi bật</Tag> : <Tag color="default" style={{ borderRadius: 6 }}>Thường</Tag>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 170,
            render: (_, record) => (
                <Space size="small">
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
                        title="Bạn có muốn xóa bài viết này không?"
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
        <AdminCard title="Quản lý Bài viết" onReload={() => loadPosts(page, pageSize)} onCreate={openCreate}>
            <Card style={{ marginBottom: 20, borderRadius: 20 }} bodyStyle={{ padding: 16 }} bordered={false} className="glass-card">
                <Input
                    placeholder="Tìm kiếm bài viết theo tiêu đề, tóm tắt, nhãn hoặc nội dung..."
                    prefix={<SearchOutlined style={{ color: 'var(--store-muted)' }} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onPressEnter={handleSearch}
                    allowClear
                    size="large"
                    style={{ borderRadius: 12 }}
                    suffix={
                        <Button type="primary" onClick={handleSearch} style={{ borderRadius: 8, height: 32 }}>
                            Tìm kiếm
                        </Button>
                    }
                />
            </Card>

            <Table
                className="admin-table custom-premium-table"
                rowKey="slug"
                columns={columns}
                dataSource={items}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: false,
                    onChange: (nextPage, nextPageSize) => loadPosts(nextPage, nextPageSize),
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} bài viết`,
                }}
                style={{ borderRadius: 20, overflow: 'hidden' }}
                scroll={{ x: true }}
            />

            <Modal
                className="admin-modal premium-modal"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem', fontWeight: 700 }}>
                        <BookOutlined style={{ color: 'var(--store-primary)' }} />
                        {editing ? 'Cập nhật bài viết' : 'Đăng bài viết mới'}
                    </div>
                }
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editing ? 'Lưu thay đổi' : 'Đăng bài'}
                cancelText="Hủy bỏ"
                destroyOnClose
                width={860}
                bodyStyle={{ paddingTop: 16 }}
                okButtonProps={{ style: { borderRadius: 12, height: 40, paddingLeft: 24, paddingRight: 24 } }}
                cancelButtonProps={{ style: { borderRadius: 12, height: 40 } }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    style={{ marginBottom: 16 }}
                    items={[
                        {
                            key: 'edit',
                            label: <strong>Biên tập nội dung</strong>,
                            children: (
                                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-modal-form">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <Form.Item
                                            name="title"
                                            label={<strong>Tiêu đề bài viết</strong>}
                                            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết!' }]}
                                        >
                                            <Input
                                                placeholder="Ví dụ: Xu hướng Công nghệ năm 2026"
                                                style={{ borderRadius: 10 }}
                                                size="large"
                                                onChange={(e) => setPreviewTitle(e.target.value)}
                                            />
                                        </Form.Item>

                                        <Form.Item name="slug" label={<strong>Đường dẫn tĩnh (Slug)</strong>} extra="Để trống sẽ tự động tạo từ tiêu đề">
                                            <Input placeholder="Ví dụ: xu-huong-cong-nghe-2026" style={{ borderRadius: 10 }} size="large" />
                                        </Form.Item>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <Form.Item
                                            name="categorySlug"
                                            label={<strong>Danh mục chuyên đề</strong>}
                                            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                                        >
                                            <Select
                                                placeholder="Chọn danh mục"
                                                style={{ borderRadius: 10, height: 40 }}
                                                size="large"
                                                options={categories.map(cat => ({ label: cat.name, value: cat.slug }))}
                                            />
                                        </Form.Item>

                                        <Form.Item name="publishedAt" label={<strong>Ngày xuất bản</strong>}>
                                            <Input placeholder="YYYY-MM-DD" style={{ borderRadius: 10 }} size="large" />
                                        </Form.Item>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <Form.Item name="readTime" label={<strong>Thời gian đọc ước tính</strong>}>
                                            <Input placeholder="Ví dụ: 5 phút đọc" style={{ borderRadius: 10 }} size="large" />
                                        </Form.Item>

                                        <Form.Item name="tags" label={<strong>Thẻ nhãn (phân cách bằng dấu phẩy)</strong>}>
                                            <Input placeholder="congnghe, trend, tintuc" style={{ borderRadius: 10 }} size="large" />
                                        </Form.Item>
                                    </div>

                                    <Form.Item name="cover" label={<strong>Đường dẫn ảnh bìa bài viết</strong>}>
                                        <Input
                                            prefix={<FileImageOutlined />}
                                            placeholder="https://..."
                                            style={{ borderRadius: 10 }}
                                            size="large"
                                            onChange={(e) => setCoverPreviewUrl(e.target.value)}
                                        />
                                    </Form.Item>

                                    {coverPreviewUrl && (
                                        <div style={{ marginBottom: 16, textAlign: 'center' }}>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--store-muted)', marginBottom: 6 }}>Xem trước ảnh bìa:</span>
                                            <img
                                                src={coverPreviewUrl}
                                                alt="Cover preview"
                                                style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: 8, objectFit: 'cover' }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}

                                    <Form.Item name="excerpt" label={<strong>Tóm tắt ngắn (Excerpt)</strong>}>
                                        <TextArea
                                            rows={2}
                                            placeholder="Tóm tắt nội dung hấp dẫn để lôi cuốn người đọc..."
                                            style={{ borderRadius: 10 }}
                                            onChange={(e) => setPreviewExcerpt(e.target.value)}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="content"
                                        label={<strong>Nội dung bài viết (Hỗ trợ HTML/Văn bản thô)</strong>}
                                        rules={[{ required: true, message: 'Nội dung bài viết không được trống!' }]}
                                    >
                                        <TextArea
                                            rows={8}
                                            placeholder="Nội dung bài viết chi tiết..."
                                            style={{ borderRadius: 10, fontFamily: 'monospace', fontSize: '0.9rem' }}
                                            onChange={(e) => setPreviewContent(e.target.value)}
                                        />
                                    </Form.Item>

                                    <Form.Item name="featured" label={<strong>Đánh dấu là bài viết nổi bật</strong>} valuePropName="checked">
                                        <Switch />
                                    </Form.Item>
                                </Form>
                            )
                        },
                        {
                            key: 'preview',
                            label: <strong><EyeOutlined /> Xem trước trực quan</strong>,
                            children: (
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', minHeight: '400px', background: '#fff' }}>
                                    {coverPreviewUrl && (
                                        <div style={{ width: '100%', height: '240px', overflow: 'hidden' }}>
                                            <img src={coverPreviewUrl} alt="Article Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{ padding: 24 }}>
                                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--store-text)' }}>
                                            {previewTitle || <span style={{ color: 'var(--store-muted)', fontStyle: 'italic' }}>Không có tiêu đề</span>}
                                        </h1>
                                        
                                        <Space split={<Divider type="vertical" />} style={{ fontSize: '0.8rem', color: 'var(--store-muted)', marginBottom: 20 }}>
                                            <span><CalendarOutlined /> Mới đăng</span>
                                            <span>Tác giả: <strong>Ban Biên Tập</strong></span>
                                        </Space>

                                        {previewExcerpt && (
                                            <div style={{ background: '#f8fafc', padding: 16, borderLeft: '4px solid var(--store-primary)', borderRadius: '0 12px 12px 0', fontStyle: 'italic', color: '#475569', marginBottom: 24, fontSize: '0.95rem' }}>
                                                {previewExcerpt}
                                            </div>
                                        )}

                                        <div 
                                            style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#1e293b' }}
                                            dangerouslySetInnerHTML={{ __html: previewContent || '<p style="color:#94a3b8; font-style:italic;">Nội dung bài viết sẽ hiển thị ở đây...</p>' }}
                                        />
                                    </div>
                                </div>
                            )
                        }
                    ]}
                />
            </Modal>
        </AdminCard>
    );
};

export default PostsAdmin;
