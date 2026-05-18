import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, notification } from 'antd';
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

    const loadCategories = async (nextPage = 1, nextPageSize = pageSize) => {
        setLoading(true);
        const res = await getCategoriesApi({ page: nextPage, limit: nextPageSize });
        if (res?.message) {
            notification.error({ message: 'Load categories', description: res.message });
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
            const res = editing ? await updateCategoryApi(editing.slug, values) : await createCategoryApi(values);
            if (res?.message) {
                throw new Error(res.message);
            }
            notification.success({
                message: editing ? 'Update category' : 'Create category',
                description: 'Success',
            });
            setModalOpen(false);
            form.resetFields();
            loadCategories(page, pageSize);
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
        loadCategories(page, pageSize);
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
                    <Button size="small" type="primary" onClick={() => openEdit(record)}>
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
        <AdminCard title="Categories" onReload={() => loadCategories(page, pageSize)} onCreate={openCreate}>
            <Table
                className="admin-table"
                rowKey="slug"
                columns={columns}
                dataSource={items}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: false,
                    onChange: (nextPage, nextPageSize) => loadCategories(nextPage, nextPageSize),
                }}
            />

            <Modal
                className="admin-modal"
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
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-modal-form">
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

export default CategoriesAdmin;
