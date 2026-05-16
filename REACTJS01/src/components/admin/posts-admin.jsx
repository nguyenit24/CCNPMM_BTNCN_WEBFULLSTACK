import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, notification } from 'antd';
import { createPostApi, deletePostApi, getPostsApi, updatePostApi } from '../../util/api';
import AdminCard from './admin-card';
import { joinList, splitList } from './admin-utils';

const { TextArea } = Input;

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

            const res = editing ? await updatePostApi(editing.slug, payload) : await createPostApi(payload);

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
                    <Button size="small" type="primary" onClick={() => openEdit(record)}>
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
                className="admin-modal"
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
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-modal-form admin-form-grid">
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

export default PostsAdmin;
