import { useEffect, useState } from 'react';
import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Space,
    Switch,
    Table,
    Tabs,
    Tag,
    notification,
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
    createCategoryApi,
    createPostApi,
    createProductApi,
    createPromotionApi,
    createUserApi,
    deleteCategoryApi,
    deletePostApi,
    deleteProductApi,
    deletePromotionApi,
    deleteUserApi,
    getCategoriesApi,
    getPostsApi,
    getProductsApi,
    getPromotionsApi,
    getUserApi,
    updateCategoryApi,
    updatePostApi,
    updateProductApi,
    updatePromotionApi,
    updateUserApi,
} from '../util/api';

const { TextArea } = Input;

const splitList = (value) => {
    if (!value) {
        return [];
    }

    return String(value)
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const joinList = (value) => {
    if (!Array.isArray(value)) {
        return '';
    }

    return value.join(', ');
};

const parseJsonArray = (value, label) => {
    if (!value) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
            throw new Error('not-array');
        }
        return parsed;
    } catch (error) {
        throw new Error(`${label} JSON is invalid`);
    }
};

const AdminCard = ({ title, onReload, onCreate, children }) => (
    <div className="store-card admin-card">
        <div className="admin-toolbar">
            <h2 className="admin-toolbar__title">{title}</h2>
            <Space>
                {onReload ? (
                    <Button icon={<ReloadOutlined />} onClick={onReload}>
                        Reload
                    </Button>
                ) : null}
                {onCreate ? (
                    <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
                        New
                    </Button>
                ) : null}
            </Space>
        </div>
        {children}
    </div>
);

const UsersAdmin = () => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const loadUsers = async () => {
        setLoading(true);
        const res = await getUserApi();

        if (res?.message) {
            notification.error({
                message: 'Load users',
                description: res.message,
            });
            setItems([]);
        } else {
            setItems(Array.isArray(res) ? res : []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            name: record.name,
            email: record.email,
            role: record.role,
            password: '',
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            if (editing) {
                const payload = { ...values };
                if (!payload.password) {
                    delete payload.password;
                }
                if (!payload.role) {
                    delete payload.role;
                }
                const res = await updateUserApi(editing._id, payload);
                if (res?.message) {
                    throw new Error(res.message);
                }
                notification.success({ message: 'Update user', description: 'Success' });
            } else {
                if (!values.password) {
                    notification.error({ message: 'Create user', description: 'Password is required' });
                    return;
                }
                const created = await createUserApi(values.name, values.email, values.password);
                if (!created || created?.message) {
                    throw new Error(created?.message || 'Create user failed');
                }
                if (values.role) {
                    await updateUserApi(created._id, { role: values.role });
                }
                notification.success({ message: 'Create user', description: 'Success' });
            }
            setModalOpen(false);
            form.resetFields();
            loadUsers();
        } catch (error) {
            notification.error({
                message: editing ? 'Update user' : 'Create user',
                description: error.message || 'Request failed',
            });
        }
    };

    const handleDelete = async (record) => {
        const res = await deleteUserApi(record._id);
        if (res?.message) {
            notification.error({ message: 'Delete user', description: res.message });
            return;
        }
        notification.success({ message: 'Delete user', description: 'Success' });
        loadUsers();
    };

    const columns = [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Role', dataIndex: 'role' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => openEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm title="Delete user?" onConfirm={() => handleDelete(record)}>
                        <Button size="small" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AdminCard title="Users" onReload={loadUsers} onCreate={openCreate}>
            <Table
                className="admin-table"
                rowKey="_id"
                columns={columns}
                dataSource={items}
                loading={loading}
                pagination={{ pageSize: 8 }}
            />

            <Modal
                title={editing ? 'Edit user' : 'Create user'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editing ? 'Save' : 'Create'}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Name is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: 'Email is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="role" label="Role">
                        <Input placeholder="Member" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={editing ? [] : [{ required: true, message: 'Password is required' }]}
                    >
                        <Input.Password placeholder={editing ? 'Leave blank to keep' : ''} />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminCard>
    );
};

const CategoriesAdmin = () => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const loadCategories = async () => {
        setLoading(true);
        const res = await getCategoriesApi();
        if (res?.message) {
            notification.error({ message: 'Load categories', description: res.message });
            setItems([]);
        } else {
            setItems(Array.isArray(res) ? res : []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
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
            const res = editing
                ? await updateCategoryApi(editing.slug, values)
                : await createCategoryApi(values);
            if (res?.message) {
                throw new Error(res.message);
            }
            notification.success({
                message: editing ? 'Update category' : 'Create category',
                description: 'Success',
            });
            setModalOpen(false);
            form.resetFields();
            loadCategories();
        } catch (error) {
            notification.error({
                message: editing ? 'Update category' : 'Create category',
                description: error.message || 'Request failed',
            });
        }
    };

    const handleDelete = async (record) => {
        const res = await deleteCategoryApi(record.slug);
        if (res?.message) {
            notification.error({ message: 'Delete category', description: res.message });
            return;
        }
        notification.success({ message: 'Delete category', description: 'Success' });
        loadCategories();
    };

    const columns = [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Slug', dataIndex: 'slug' },
        { title: 'Order', dataIndex: 'order' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => openEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm title="Delete category?" onConfirm={() => handleDelete(record)}>
                        <Button size="small" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AdminCard title="Categories" onReload={loadCategories} onCreate={openCreate}>
            <Table
                className="admin-table"
                rowKey="slug"
                columns={columns}
                dataSource={items}
                loading={loading}
                pagination={{ pageSize: 8 }}
            />

            <Modal
                title={editing ? 'Edit category' : 'Create category'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editing ? 'Save' : 'Create'}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                    <Form.Item name="description" label="Description">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="image" label="Image URL">
                        <Input />
                    </Form.Item>
                    <Form.Item name="order" label="Order">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminCard>
    );
};

const PromotionsAdmin = () => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const loadPromotions = async () => {
        setLoading(true);
        const res = await getPromotionsApi();
        if (res?.message) {
            notification.error({ message: 'Load promotions', description: res.message });
            setItems([]);
        } else {
            setItems(Array.isArray(res) ? res : []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            title: record.title,
            slug: record.slug,
            badge: record.badge,
            description: record.description,
            highlight: record.highlight,
            buttonLabel: record.buttonLabel,
            banner: record.banner,
            order: record.order,
            active: Boolean(record.active),
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            const res = editing
                ? await updatePromotionApi(editing.slug, values)
                : await createPromotionApi(values);
            if (res?.message) {
                throw new Error(res.message);
            }
            notification.success({
                message: editing ? 'Update promotion' : 'Create promotion',
                description: 'Success',
            });
            setModalOpen(false);
            form.resetFields();
            loadPromotions();
        } catch (error) {
            notification.error({
                message: editing ? 'Update promotion' : 'Create promotion',
                description: error.message || 'Request failed',
            });
        }
    };

    const handleDelete = async (record) => {
        const res = await deletePromotionApi(record.slug);
        if (res?.message) {
            notification.error({ message: 'Delete promotion', description: res.message });
            return;
        }
        notification.success({ message: 'Delete promotion', description: 'Success' });
        loadPromotions();
    };

    const columns = [
        { title: 'Title', dataIndex: 'title' },
        { title: 'Slug', dataIndex: 'slug' },
        {
            title: 'Active',
            dataIndex: 'active',
            render: (value) => (value ? <Tag color="green">Active</Tag> : <Tag>Off</Tag>),
        },
        { title: 'Order', dataIndex: 'order' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => openEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm title="Delete promotion?" onConfirm={() => handleDelete(record)}>
                        <Button size="small" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AdminCard title="Promotions" onReload={loadPromotions} onCreate={openCreate}>
            <Table
                className="admin-table"
                rowKey="slug"
                columns={columns}
                dataSource={items}
                loading={loading}
                pagination={{ pageSize: 8 }}
            />

            <Modal
                title={editing ? 'Edit promotion' : 'Create promotion'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editing ? 'Save' : 'Create'}
                destroyOnClose
                width={720}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-form-grid">
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Title is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="slug" label="Slug">
                        <Input />
                    </Form.Item>
                    <Form.Item name="badge" label="Badge">
                        <Input />
                    </Form.Item>
                    <Form.Item name="buttonLabel" label="Button Label">
                        <Input />
                    </Form.Item>
                    <Form.Item name="banner" label="Banner URL" className="admin-form__wide">
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description" className="admin-form__wide">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="highlight" label="Highlight" className="admin-form__wide">
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="order" label="Order">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="active" label="Active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminCard>
    );
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
            images: joinList(record.images),
            tags: joinList(record.tags),
            specs: record.specs && record.specs.length ? JSON.stringify(record.specs, null, 2) : '',
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
                images: splitList(values.images),
                tags: splitList(values.tags),
            };

            const specs = parseJsonArray(values.specs, 'Specs');
            if (specs !== undefined) {
                payload.specs = specs;
            }

            const res = editing
                ? await updateProductApi(editing.slug, payload)
                : await createProductApi(payload);

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
                    <Button size="small" onClick={() => openEdit(record)}>
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
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-form-grid">
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
                    <Form.Item name="images" label="Images (comma or newline)" className="admin-form__wide">
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="tags" label="Tags (comma or newline)" className="admin-form__wide">
                        <Input />
                    </Form.Item>
                    <Form.Item name="specs" label="Specs (JSON array)" className="admin-form__wide">
                        <TextArea rows={4} placeholder='[{"label":"Battery","value":"20h"}]' />
                    </Form.Item>
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

const PostsAdmin = () => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const loadPosts = async () => {
        setLoading(true);
        const res = await getPostsApi({ limit: 24, page: 1 });
        if (res?.message) {
            notification.error({ message: 'Load posts', description: res.message });
            setItems([]);
        } else {
            setItems(Array.isArray(res?.items) ? res.items : []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            title: record.title,
            slug: record.slug,
            excerpt: record.excerpt,
            content: record.content,
            categorySlug: record.categorySlug,
            categoryName: record.categoryName,
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
            const payload = {
                ...values,
                tags: splitList(values.tags),
            };

            const res = editing
                ? await updatePostApi(editing.slug, payload)
                : await createPostApi(payload);

            if (res?.message) {
                throw new Error(res.message);
            }

            notification.success({
                message: editing ? 'Update post' : 'Create post',
                description: 'Success',
            });
            setModalOpen(false);
            form.resetFields();
            loadPosts();
        } catch (error) {
            notification.error({
                message: editing ? 'Update post' : 'Create post',
                description: error.message || 'Request failed',
            });
        }
    };

    const handleDelete = async (record) => {
        const res = await deletePostApi(record.slug);
        if (res?.message) {
            notification.error({ message: 'Delete post', description: res.message });
            return;
        }
        notification.success({ message: 'Delete post', description: 'Success' });
        loadPosts();
    };

    const columns = [
        { title: 'Title', dataIndex: 'title' },
        { title: 'Slug', dataIndex: 'slug' },
        { title: 'Category', dataIndex: 'categoryName' },
        {
            title: 'Featured',
            dataIndex: 'featured',
            render: (value) => (value ? <Tag color="blue">Yes</Tag> : <Tag>No</Tag>),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => openEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm title="Delete post?" onConfirm={() => handleDelete(record)}>
                        <Button size="small" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AdminCard title="Posts" onReload={loadPosts} onCreate={openCreate}>
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
                title={editing ? 'Edit post' : 'Create post'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editing ? 'Save' : 'Create'}
                destroyOnClose
                width={820}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-form-grid">
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Title is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="slug" label="Slug">
                        <Input />
                    </Form.Item>
                    <Form.Item name="categorySlug" label="Category Slug">
                        <Input />
                    </Form.Item>
                    <Form.Item name="categoryName" label="Category Name">
                        <Input />
                    </Form.Item>
                    <Form.Item name="cover" label="Cover URL" className="admin-form__wide">
                        <Input />
                    </Form.Item>
                    <Form.Item name="excerpt" label="Excerpt" className="admin-form__wide">
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="content" label="Content" className="admin-form__wide">
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="tags" label="Tags (comma or newline)" className="admin-form__wide">
                        <Input />
                    </Form.Item>
                    <Form.Item name="readTime" label="Read Time">
                        <Input />
                    </Form.Item>
                    <Form.Item name="publishedAt" label="Published At">
                        <Input placeholder="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="featured" label="Featured" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminCard>
    );
};

const AdminPage = () => {
    const tabItems = [
        { key: 'users', label: 'Users', children: <UsersAdmin /> },
        { key: 'categories', label: 'Categories', children: <CategoriesAdmin /> },
        { key: 'promotions', label: 'Promotions', children: <PromotionsAdmin /> },
        { key: 'products', label: 'Products', children: <ProductsAdmin /> },
        { key: 'posts', label: 'Posts', children: <PostsAdmin /> },
    ];

    return (
        <div className="store-layout admin-page">
            <div className="store-page-head">
                <div>
                    <span className="store-page-head__eyebrow">Admin</span>
                    <h1 className="store-page-head__title">Admin Dashboard</h1>
                    <p className="store-page-head__subtitle">
                        Manage users and catalog data with full CRUD tools.
                    </p>
                </div>
            </div>

            <Tabs items={tabItems} destroyInactiveTabPane />
        </div>
    );
};

export default AdminPage;
