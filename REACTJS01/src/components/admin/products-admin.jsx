import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Tag, notification } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { createProductApi, deleteProductApi, getProductsApi, updateProductApi } from '../../util/api';
import AdminCard from './admin-card';
import { joinList, splitList } from './admin-utils';

const { TextArea } = Input;

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
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const loadProducts = async () => {
        setLoading(true);
        const res = await getProductsApi({ limit: 24, page: 1 });
        if (res?.message) {
            notification.error({ message: 'Load products', description: res.message });
            setItems([]);
        } else {
            setItems(Array.isArray(res?.items) ? res.items : []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        form.setFieldsValue({
            images: [{ url: '' }],
            specs: [{ label: '', value: '' }],
        });
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            name: record.name,
            slug: record.slug,
            categorySlug: record.categorySlug,
            categoryName: record.categoryName,
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
            const payload = {
                ...values,
                images: normalizeImageRows(values.images),
                tags: splitList(values.tags),
                specs: normalizeSpecRows(values.specs),
            };

            const res = editing ? await updateProductApi(editing.slug, payload) : await createProductApi(payload);

            if (res?.message) {
                throw new Error(res.message);
            }

            notification.success({
                message: editing ? 'Update product' : 'Create product',
                description: 'Success',
            });
            setModalOpen(false);
            form.resetFields();
            loadProducts();
        } catch (error) {
            notification.error({
                message: editing ? 'Update product' : 'Create product',
                description: error.message || 'Request failed',
            });
        }
    };

    const handleDelete = async (record) => {
        const res = await deleteProductApi(record.slug);
        if (res?.message) {
            notification.error({ message: 'Delete product', description: res.message });
            return;
        }
        notification.success({ message: 'Delete product', description: 'Success' });
        loadProducts();
    };

    const columns = [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Slug', dataIndex: 'slug' },
        { title: 'Category', dataIndex: 'categoryName' },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (value) => `$${value}`,
        },
        { title: 'Stock', dataIndex: 'stock' },
        {
            title: 'Flags',
            key: 'flags',
            render: (_, record) => (
                <Space size={4} wrap>
                    {record.featured ? <Tag color="blue">Featured</Tag> : null}
                    {record.bestSeller ? <Tag color="green">Best</Tag> : null}
                    {record.isNew ? <Tag color="gold">New</Tag> : null}
                    {record.onSale ? <Tag color="volcano">Sale</Tag> : null}
                </Space>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" type="primary" onClick={() => openEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm title="Delete product?" onConfirm={() => handleDelete(record)}>
                        <Button size="small" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AdminCard title="Products" onReload={loadProducts} onCreate={openCreate}>
            <Table
                className="admin-table"
                rowKey="slug"
                columns={columns}
                dataSource={items}
                loading={loading}
                pagination={{ pageSize: 8 }}
                scroll={{ x: true }}
            />

            <Modal
                className="admin-modal admin-modal--wide"
                title={editing ? 'Edit product' : 'Create product'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editing ? 'Save' : 'Create'}
                destroyOnClose
                width={860}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-modal-form admin-form-grid">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Name is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="slug" label="Slug">
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="categorySlug"
                        label="Category Slug"
                        rules={[{ required: true, message: 'Category slug is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="categoryName"
                        label="Category Name"
                        rules={[{ required: true, message: 'Category name is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Price is required' }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="compareAtPrice" label="Compare At Price">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="stock" label="Stock">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="sold" label="Sold">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="rating" label="Rating">
                        <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="releasedAt" label="Released At">
                        <Input placeholder="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="shortDescription" label="Short Description" className="admin-form__wide">
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="description" label="Description" className="admin-form__wide">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="tags" label="Tags (comma or newline)" className="admin-form__wide">
                        <Input />
                    </Form.Item>
                    <Form.List name="images">
                        {(fields, { add, remove }) => (
                            <div className="admin-form-list admin-form__wide">
                                <div className="admin-form-list__head">
                                    <span>Images URL</span>
                                    <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => add({ url: '' })}>
                                        Thêm ảnh
                                    </Button>
                                </div>
                                {fields.map((field, index) => (
                                    <div key={field.key} className="admin-form-list__row admin-form-list__row--single">
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'url']}
                                            fieldKey={[field.fieldKey, 'url']}
                                            label={index === 0 ? 'Link ảnh' : ''}
                                            className="admin-form-list__field"
                                        >
                                            <Input placeholder="https://..." />
                                        </Form.Item>
                                        <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Form.List>
                    <Form.List name="specs">
                        {(fields, { add, remove }) => (
                            <div className="admin-form-list admin-form__wide">
                                <div className="admin-form-list__head">
                                    <span>Thông số kỹ thuật</span>
                                    <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => add({ label: '', value: '' })}>
                                        Thêm dòng
                                    </Button>
                                </div>
                                {fields.map((field, index) => (
                                    <div key={field.key} className="admin-form-list__row admin-form-list__row--spec">
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'label']}
                                            fieldKey={[field.fieldKey, 'label']}
                                            label={index === 0 ? 'Tên' : ''}
                                            className="admin-form-list__field"
                                        >
                                            <Input placeholder="Battery" />
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'value']}
                                            fieldKey={[field.fieldKey, 'value']}
                                            label={index === 0 ? 'Giá trị' : ''}
                                            className="admin-form-list__field"
                                        >
                                            <Input placeholder="20h" />
                                        </Form.Item>
                                        <Button danger type="text" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Form.List>
                    <Form.Item name="featured" label="Featured" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="bestSeller" label="Best Seller" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="isNew" label="Is New" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="onSale" label="On Sale" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminCard>
    );
};

export default ProductsAdmin;
