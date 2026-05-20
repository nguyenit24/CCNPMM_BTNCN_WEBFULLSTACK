import { useEffect, useState, useMemo } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Tag, Card, Select, notification, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ShoppingOutlined, FileImageOutlined, OrderedListOutlined, PercentageOutlined, AppstoreOutlined } from '@ant-design/icons';
import { createProductApi, deleteProductApi, getProductsApi, updateProductApi, getCategoriesApi } from '../../util/api';
import AdminCard from './admin-card';
import { joinList, splitList } from './admin-utils';

const { TextArea } = Input;
const PAGE_SIZE = 8;

const normalizeImageRows = (rows = []) => rows.map((row) => String(row?.url || '').trim()).filter(Boolean);

const normalizeSpecRows = (rows = []) => rows
    .map((row) => ({
        label: String(row?.label || '').trim(),
        value: String(row?.value || '').trim(),
    }))
    .filter((row) => row.label || row.value);

const buildImageRows = (images = []) => {
    const rows = Array.isArray(images) ? images : [];
    return rows.length > 0 ? rows.map((url) => ({ url: String(url || '') })) : [{ url: '' }];
};

const buildSpecRows = (specs = []) => {
    const rows = Array.isArray(specs) ? specs : [];
    return rows.length > 0
        ? rows.map((spec) => ({
            label: String(spec?.label || ''),
            value: String(spec?.value || ''),
        }))
        : [{ label: '', value: '' }];
};

const ProductsAdmin = () => {
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

    // Fetch categories on mount
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

    const loadProducts = async (nextPage = 1, nextPageSize = pageSize, search = searchQuery) => {
        setLoading(true);
        const res = await getProductsApi({ limit: nextPageSize, page: nextPage, q: search });
        if (res?.message) {
            notification.error({ message: 'Tải sản phẩm thất bại', description: res.message });
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
        loadProducts();
    }, []);

    // Reload products when search query changes (with simple trigger on Enter or button, or debounced)
    const handleSearch = () => {
        loadProducts(1, pageSize, searchQuery);
    };

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        form.setFieldsValue({
            images: [{ url: '' }],
            specs: [{ label: '', value: '' }],
            price: 0,
            compareAtPrice: 0,
            stock: 10,
            sold: 0,
            rating: 5,
            featured: false,
            bestSeller: false,
            isNew: true,
            onSale: false,
        });
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            name: record.name,
            slug: record.slug,
            categorySlug: record.categorySlug,
            shortDescription: record.shortDescription,
            description: record.description,
            price: record.price,
            compareAtPrice: record.compareAtPrice,
            stock: record.stock,
            sold: record.sold,
            rating: record.rating,
            images: buildImageRows(record.images),
            tags: joinList(record.tags),
            specs: buildSpecRows(record.specs),
            featured: Boolean(record.featured),
            bestSeller: Boolean(record.bestSeller),
            isNew: Boolean(record.isNew),
            onSale: Boolean(record.onSale),
            releasedAt: record.releasedAt ? String(record.releasedAt).slice(0, 10) : '',
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            // Find selected category name
            const selectedCat = categories.find(cat => cat.slug === values.categorySlug);
            const categoryName = selectedCat ? selectedCat.name : values.categorySlug;

            const payload = {
                ...values,
                categoryName,
                images: normalizeImageRows(values.images),
                tags: splitList(values.tags),
                specs: normalizeSpecRows(values.specs),
            };

            const res = editing ? await updateProductApi(editing.slug, payload) : await createProductApi(payload);

            if (res?.message) {
                throw new Error(res.message);
            }

            notification.success({
                message: editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới',
                description: 'Đã lưu dữ liệu sản phẩm thành công!',
            });
            setModalOpen(false);
            form.resetFields();
            loadProducts(page, pageSize);
        } catch (error) {
            notification.error({
                message: editing ? 'Cập nhật sản phẩm thất bại' : 'Thêm sản phẩm thất bại',
                description: error.message || 'Yêu cầu không thành công',
            });
        }
    };

    const handleDelete = async (record) => {
        const res = await deleteProductApi(record.slug);
        if (res?.message) {
            notification.error({ message: 'Xóa sản phẩm thất bại', description: res.message });
            return;
        }
        notification.success({ message: 'Xóa sản phẩm', description: 'Đã gỡ bỏ sản phẩm thành công!' });
        loadProducts(page, pageSize);
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            key: 'images',
            width: 90,
            render: (images) => {
                const mainImage = Array.isArray(images) && images.length > 0 ? images[0] : '';
                return (
                    <div className="admin-table-image-container">
                        <img
                            src={mainImage || 'https://placehold.co/100x100?text=No+Image'}
                            alt="Product"
                            className="admin-table-image"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/100x100?text=Error';
                            }}
                        />
                    </div>
                );
            },
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
            render: (name) => <strong style={{ color: 'var(--store-text)', fontSize: '0.95rem' }}>{name}</strong>,
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (catName) => <Tag color="blue" style={{ borderRadius: 6, fontWeight: 500 }}>{catName}</Tag>,
        },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
            render: (price, record) => {
                const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
                const hasDiscount = record.compareAtPrice > price;
                return (
                    <div>
                        <span style={{ fontWeight: 700, color: 'var(--store-primary)' }}>{formattedPrice}</span>
                        {hasDiscount && (
                            <div style={{ textDecoration: 'line-through', color: 'var(--store-muted)', fontSize: '0.8rem' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.compareAtPrice)}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Kho / Đã bán',
            key: 'stock_sold',
            render: (_, record) => (
                <div style={{ fontSize: '0.85rem' }}>
                    <div>Kho: <strong style={{ color: record.stock > 0 ? '#10b981' : '#ef4444' }}>{record.stock}</strong></div>
                    <div style={{ color: 'var(--store-muted)' }}>Đã bán: <strong>{record.sold || 0}</strong></div>
                </div>
            ),
        },
        {
            title: 'Trạng thái (Flags)',
            key: 'flags',
            render: (_, record) => (
                <Space size={4} wrap>
                    {record.featured ? <Tag color="geekblue" style={{ borderRadius: 4 }}>Nổi bật</Tag> : null}
                    {record.bestSeller ? <Tag color="green" style={{ borderRadius: 4 }}>Bán chạy</Tag> : null}
                    {record.isNew ? <Tag color="gold" style={{ borderRadius: 4 }}>Mới</Tag> : null}
                    {record.onSale ? <Tag color="volcano" style={{ borderRadius: 4 }}>Khuyến mãi</Tag> : null}
                </Space>
            ),
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
                        title="Bạn có chắc chắn muốn xóa sản phẩm này không?"
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
        <AdminCard title="Quản lý Sản phẩm" onReload={() => loadProducts(page, pageSize)} onCreate={openCreate}>
            <Card style={{ marginBottom: 20, borderRadius: 20 }} bodyStyle={{ padding: 16 }} bordered={false} className="glass-card">
                <Space style={{ width: '100%' }} direction="vertical">
                    <Input
                        placeholder="Tìm kiếm sản phẩm theo tên, slug, nhãn hoặc mô tả..."
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
                </Space>
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
                    onChange: (nextPage, nextPageSize) => loadProducts(nextPage, nextPageSize),
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} sản phẩm`,
                }}
                style={{ borderRadius: 20, overflow: 'hidden' }}
                scroll={{ x: true }}
            />

            <Modal
                className="admin-modal premium-modal"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem', fontWeight: 700 }}>
                        <ShoppingOutlined style={{ color: 'var(--store-primary)' }} />
                        {editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                    </div>
                }
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                cancelText="Hủy bỏ"
                destroyOnClose
                width={860}
                bodyStyle={{ paddingTop: 16 }}
                okButtonProps={{ style: { borderRadius: 12, height: 40, paddingLeft: 24, paddingRight: 24 } }}
                cancelButtonProps={{ style: { borderRadius: 12, height: 40 } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-modal-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="name"
                            label={<strong>Tên sản phẩm</strong>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                        >
                            <Input placeholder="Ví dụ: Laptop Asus ROG" style={{ borderRadius: 10 }} size="large" />
                        </Form.Item>

                        <Form.Item name="slug" label={<strong>Đường dẫn (Slug)</strong>} extra="Để trống sẽ tự sinh từ tên">
                            <Input placeholder="Ví dụ: laptop-asus-rog" style={{ borderRadius: 10 }} size="large" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="categorySlug"
                            label={<strong>Danh mục sản phẩm</strong>}
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                style={{ borderRadius: 10, height: 40 }}
                                size="large"
                                options={categories.map(cat => ({ label: cat.name, value: cat.slug }))}
                            />
                        </Form.Item>

                        <Form.Item name="releasedAt" label={<strong>Ngày phát hành</strong>}>
                            <Input placeholder="YYYY-MM-DD" style={{ borderRadius: 10 }} size="large" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <Form.Item 
                            name="price" 
                            label={<strong>Giá bán lẻ (VND)</strong>} 
                            rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                        >
                            <InputNumber min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} style={{ width: '100%', borderRadius: 10 }} size="large" />
                        </Form.Item>

                        <Form.Item name="compareAtPrice" label={<strong>Giá gốc gốc (so sánh)</strong>}>
                            <InputNumber min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} style={{ width: '100%', borderRadius: 10 }} size="large" />
                        </Form.Item>

                        <Form.Item name="stock" label={<strong>Số lượng kho</strong>}>
                            <InputNumber min={0} style={{ width: '100%', borderRadius: 10 }} size="large" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="sold" label={<strong>Số lượng đã bán</strong>}>
                            <InputNumber min={0} style={{ width: '100%', borderRadius: 10 }} size="large" />
                        </Form.Item>

                        <Form.Item name="rating" label={<strong>Đánh giá (1-5 sao)</strong>}>
                            <InputNumber min={0} max={5} step={0.1} style={{ width: '100%', borderRadius: 10 }} size="large" />
                        </Form.Item>
                    </div>

                    <Form.Item name="shortDescription" label={<strong>Mô tả ngắn gọn</strong>}>
                        <TextArea rows={2} placeholder="Tóm tắt ngắn về tính năng nổi bật..." style={{ borderRadius: 10 }} />
                    </Form.Item>

                    <Form.Item name="description" label={<strong>Mô tả chi tiết</strong>}>
                        <TextArea rows={4} placeholder="Mô tả kỹ thuật đầy đủ..." style={{ borderRadius: 10 }} />
                    </Form.Item>

                    <Form.Item name="tags" label={<strong>Nhãn tìm kiếm (phân cách bằng dấu phẩy)</strong>}>
                        <Input placeholder="gaming, laptop, asus, new" style={{ borderRadius: 10 }} size="large" />
                    </Form.Item>

                    {/* Multi Image List with visual previews */}
                    <Form.List name="images">
                        {(fields, { add, remove }) => (
                            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <strong>Hình ảnh sản phẩm (URLs)</strong>
                                    <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => add({ url: '' })} style={{ borderRadius: 8 }}>
                                        Thêm ảnh
                                    </Button>
                                </div>
                                {fields.map((field, index) => (
                                    <Form.Item
                                        required={false}
                                        key={field.key}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'url']}
                                                validateTrigger={['onChange', 'onBlur']}
                                                noStyle
                                            >
                                                <Input 
                                                    prefix={<FileImageOutlined style={{ color: 'var(--store-muted)' }} />} 
                                                    placeholder="https://..." 
                                                    style={{ borderRadius: 8, flex: 1 }} 
                                                />
                                            </Form.Item>
                                            
                                            {/* Dynamic mini thumbnail inside form */}
                                            <Form.Item shouldUpdate noStyle>
                                                {() => {
                                                    const urlValue = form.getFieldValue(['images', field.name, 'url']);
                                                    if (urlValue) {
                                                        return (
                                                            <img 
                                                                src={urlValue} 
                                                                alt="Mini preview" 
                                                                style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid #e2e8f0' }} 
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            </Form.Item>

                                            <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                                        </div>
                                    </Form.Item>
                                ))}
                            </div>
                        )}
                    </Form.List>

                    {/* Specs specification table */}
                    <Form.List name="specs">
                        {(fields, { add, remove }) => (
                            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <strong>Thông số kỹ thuật chi tiết</strong>
                                    <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => add({ label: '', value: '' })} style={{ borderRadius: 8 }}>
                                        Thêm dòng
                                    </Button>
                                </div>
                                {fields.map((field, index) => (
                                    <div key={field.key} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'label']}
                                            noStyle
                                        >
                                            <Input placeholder="Ví dụ: Bộ nhớ RAM" style={{ borderRadius: 8, width: '40%' }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'value']}
                                            noStyle
                                        >
                                            <Input placeholder="Ví dụ: 16GB LPDDR5" style={{ borderRadius: 8, width: '50%' }} />
                                        </Form.Item>
                                        <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Form.List>

                    <Card style={{ background: '#f8fafc', border: 'none', borderRadius: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                            <Form.Item name="featured" label={<strong>Nổi bật</strong>} valuePropName="checked" style={{ marginBottom: 0 }}>
                                <Switch />
                            </Form.Item>
                            <Form.Item name="bestSeller" label={<strong>Bán chạy</strong>} valuePropName="checked" style={{ marginBottom: 0 }}>
                                <Switch />
                            </Form.Item>
                            <Form.Item name="isNew" label={<strong>Hàng mới</strong>} valuePropName="checked" style={{ marginBottom: 0 }}>
                                <Switch />
                            </Form.Item>
                            <Form.Item name="onSale" label={<strong>Giảm giá</strong>} valuePropName="checked" style={{ marginBottom: 0 }}>
                                <Switch />
                            </Form.Item>
                        </div>
                    </Card>
                </Form>
            </Modal>
        </AdminCard>
    );
};

export default ProductsAdmin;
