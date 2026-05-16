import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Tag, notification } from 'antd';
import { createPromotionApi, deletePromotionApi, getPromotionsApi, updatePromotionApi } from '../../util/api';
import AdminCard from './admin-card';

const { TextArea } = Input;

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
            const res = editing ? await updatePromotionApi(editing.slug, values) : await createPromotionApi(values);
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
                    <Button size="small" type="primary" onClick={() => openEdit(record)}>
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
                className="admin-modal"
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

export default PromotionsAdmin;
