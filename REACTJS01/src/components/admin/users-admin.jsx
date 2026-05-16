import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, notification } from 'antd';
import { createUserApi, deleteUserApi, getUserApi, updateUserApi } from '../../util/api';
import AdminCard from './admin-card';

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
                    <Button size="small" type="primary" onClick={() => openEdit(record)}>
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
                className="admin-modal"
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
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-modal-form">
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

export default UsersAdmin;
