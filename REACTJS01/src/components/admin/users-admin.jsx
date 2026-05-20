import { useEffect, useState, useMemo } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, Tag, Select, notification, Card } from 'antd';
import { SearchOutlined, UserOutlined, MailOutlined, KeyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { createUserApi, deleteUserApi, getUserApi, updateUserApi } from '../../util/api';
import AdminCard from './admin-card';

const { Option } = Select;

const UsersAdmin = () => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        const res = await getUserApi();

        if (res?.message) {
            notification.error({
                message: 'Tải danh sách người dùng thất bại',
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
        form.setFieldsValue({ role: 'Member' });
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            name: record.name,
            email: record.email,
            role: record.role || 'Member',
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
                const res = await updateUserApi(editing._id, payload);
                if (res?.message) {
                    throw new Error(res.message);
                }
                notification.success({ message: 'Cập nhật tài khoản', description: 'Cập nhật thông tin thành công!' });
            } else {
                if (!values.password) {
                    notification.error({ message: 'Tạo tài khoản', description: 'Vui lòng nhập mật khẩu' });
                    return;
                }
                const created = await createUserApi(values.name, values.email, values.password);
                if (!created || created?.message) {
                    throw new Error(created?.message || 'Không thể tạo tài khoản');
                }
                if (values.role) {
                    await updateUserApi(created._id, { role: values.role });
                }
                notification.success({ message: 'Tạo tài khoản', description: 'Thêm tài khoản mới thành công!' });
            }
            setModalOpen(false);
            form.resetFields();
            loadUsers();
        } catch (error) {
            notification.error({
                message: editing ? 'Cập nhật tài khoản thất bại' : 'Tạo tài khoản thất bại',
                description: error.message || 'Yêu cầu không thành công',
            });
        }
    };

    const handleDelete = async (record) => {
        const res = await deleteUserApi(record._id);
        if (res?.message) {
            notification.error({ message: 'Xóa tài khoản thất bại', description: res.message });
            return;
        }
        notification.success({ message: 'Xóa tài khoản', description: 'Tài khoản đã được gỡ bỏ khỏi hệ thống!' });
        loadUsers();
    };

    const filteredItems = useMemo(() => {
        const query = String(searchQuery || '').trim().toLowerCase();
        if (!query) return items;
        return items.filter(
            (item) =>
                String(item.name || '').toLowerCase().includes(query) ||
                String(item.email || '').toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
            render: (name) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="admin-avatar-placeholder">{String(name || 'A').charAt(0).toUpperCase()}</div>
                    <strong style={{ color: 'var(--store-text)', fontSize: '0.95rem' }}>{name}</strong>
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => <span style={{ color: 'var(--store-muted)', fontStyle: 'italic' }}>{email}</span>,
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            filters: [
                { text: 'Admin', value: 'Admin' },
                { text: 'Member', value: 'Member' },
            ],
            onFilter: (value, record) => record.role === value,
            render: (role) => {
                const isSysAdmin = String(role || '').toLowerCase() === 'admin';
                return (
                    <Tag color={isSysAdmin ? 'red' : 'blue'} style={{ borderRadius: 8, padding: '2px 10px', fontWeight: 700 }}>
                        {isSysAdmin ? 'ADMINISTRATOR' : 'MEMBER'}
                    </Tag>
                );
            },
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
                        title="Xác nhận xóa tài khoản này?"
                        onConfirm={() => handleDelete(record)}
                        okText="Có, xóa"
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
        <AdminCard title="Quản lý Tài khoản" onReload={loadUsers} onCreate={openCreate}>
            <Card style={{ marginBottom: 20, borderRadius: 20 }} bodyStyle={{ padding: 16 }} bordered={false} className="glass-card">
                <Input
                    placeholder="Tìm kiếm tài khoản theo tên hoặc email..."
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
                rowKey="_id"
                columns={columns}
                dataSource={filteredItems}
                loading={loading}
                pagination={{
                    pageSize: 8,
                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} tài khoản`,
                }}
                style={{ borderRadius: 20, overflow: 'hidden' }}
            />

            <Modal
                className="admin-modal premium-modal"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem', fontWeight: 700 }}>
                        <UserOutlined style={{ color: 'var(--store-primary)' }} />
                        {editing ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}
                    </div>
                }
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                cancelText="Hủy bỏ"
                destroyOnClose
                bodyStyle={{ paddingTop: 16 }}
                okButtonProps={{ style: { borderRadius: 12, height: 40, paddingLeft: 24, paddingRight: 24 } }}
                cancelButtonProps={{ style: { borderRadius: 12, height: 40 } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="admin-modal-form">
                    <Form.Item
                        name="name"
                        label={<strong>Họ và tên</strong>}
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên người dùng!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập tên hiển thị" style={{ borderRadius: 10 }} size="large" />
                    </Form.Item>
                    
                    <Form.Item
                        name="email"
                        label={<strong>Địa chỉ Email</strong>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập địa chỉ email!' },
                            { type: 'email', message: 'Định dạng email không hợp lệ!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="nguoidung@example.com" style={{ borderRadius: 10 }} size="large" disabled={!!editing} />
                    </Form.Item>

                    <Form.Item 
                        name="role" 
                        label={<strong>Vai trò trên hệ thống</strong>}
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                    >
                        <Select placeholder="Chọn vai trò" style={{ borderRadius: 10 }} size="large">
                            <Option value="Member">Thành viên (Member)</Option>
                            <Option value="Admin">Quản trị viên (Admin)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={<strong>Mật khẩu bảo mật</strong>}
                        rules={editing ? [] : [{ required: true, message: 'Mật khẩu không được bỏ trống!' }]}
                    >
                        <Input.Password 
                            prefix={<KeyOutlined />} 
                            placeholder={editing ? 'Để trống nếu giữ nguyên mật khẩu cũ' : 'Nhập mật khẩu (từ 6 ký tự)'} 
                            style={{ borderRadius: 10 }} 
                            size="large" 
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </AdminCard>
    );
};

export default UsersAdmin;
