import { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Col, Divider, Empty, Form, Input, Modal, Popconfirm, Row, Space, Tag, notification } from 'antd';
import { CheckOutlined, DeleteOutlined, EditOutlined, HomeOutlined, PlusOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { addAccountAddressApi, deleteAccountAddressApi, getAccountApi, updateAccountAddressApi } from '../util/api';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [account, setAccount] = useState(auth?.user || null);
    const [loading, setLoading] = useState(true);
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [saving, setSaving] = useState(false);
    const [addressDraft, setAddressDraft] = useState({});
    const [form] = Form.useForm();

    const addresses = useMemo(() => Array.isArray(account?.addresses) ? account.addresses : [], [account]);
    const defaultAddress = useMemo(() => account?.defaultAddress || addresses.find((item) => item.isDefault) || addresses[0] || null, [account, addresses]);
    const initials = (account?.name || 'M').trim().charAt(0).toUpperCase();
    const mapQuery = useMemo(() => {
        const parts = [
            addressDraft.line1,
            addressDraft.detail,
            addressDraft.ward,
            addressDraft.district,
            addressDraft.province,
            addressDraft.country,
        ]
            .map((item) => String(item || '').trim())
            .filter(Boolean);

        return parts.join(', ');
    }, [addressDraft]);

    const mapEmbedSrc = mapQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed` : '';

    const syncAccount = (nextAccount) => {
        setAccount(nextAccount);
        setAuth((current) => ({
            ...current,
            isAuthenticated: true,
            user: {
                ...(current?.user || {}),
                ...nextAccount,
            },
        }));
    };

    const loadAccount = async () => {
        setLoading(true);
        const res = await getAccountApi();

        if (res?.message) {
            notification.error({
                message: 'Tải hồ sơ',
                description: res.message,
            });
        } else {
            syncAccount(res);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadAccount();
    }, []);

    const openCreateAddress = () => {
        setEditingAddress(null);
        form.resetFields();
        form.setFieldsValue({
            country: 'Việt Nam',
            label: 'Địa chỉ nhà',
            isDefault: addresses.length === 0,
        });
        setAddressDraft({ country: 'Việt Nam', label: 'Địa chỉ nhà', isDefault: addresses.length === 0 });
        setAddressModalOpen(true);
    };

    const openEditAddress = (address) => {
        setEditingAddress(address);
        form.setFieldsValue({
            label: address.label,
            recipientName: address.recipientName,
            phone: address.phone,
            line1: address.line1,
            ward: address.ward,
            district: address.district,
            province: address.province,
            country: address.country || 'Việt Nam',
            detail: address.detail,
            googleMapsLink: address.googleMapsLink,
            isDefault: address.isDefault,
        });
        setAddressDraft({
            label: address.label,
            recipientName: address.recipientName,
            phone: address.phone,
            line1: address.line1,
            ward: address.ward,
            district: address.district,
            province: address.province,
            country: address.country || 'Việt Nam',
            detail: address.detail,
            googleMapsLink: address.googleMapsLink,
            isDefault: address.isDefault,
        });
        setAddressModalOpen(true);
    };

    const handleSubmitAddress = async (values) => {
        setSaving(true);

        const payload = {
            ...values,
            country: values.country || 'Việt Nam',
        };

        const res = editingAddress
            ? await updateAccountAddressApi(editingAddress.id || editingAddress._id, payload)
            : await addAccountAddressApi(payload);

        if (res?.message) {
            notification.error({
                message: editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ',
                description: res.message,
            });
        } else {
            notification.success({
                message: editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ',
                description: 'Địa chỉ đã được lưu vào hồ sơ của bạn.',
            });
            setAddressModalOpen(false);
            setEditingAddress(null);
            form.resetFields();
            await loadAccount();
        }

        setSaving(false);
    };

    const handleDeleteAddress = async (address) => {
        const res = await deleteAccountAddressApi(address.id || address._id);

        if (res?.message) {
            notification.error({ message: 'Xóa địa chỉ', description: res.message });
            return;
        }

        notification.success({ message: 'Xóa địa chỉ', description: 'Địa chỉ đã được xóa.' });
        await loadAccount();
    };

    const handleSetDefault = async (address) => {
        const res = await updateAccountAddressApi(address.id || address._id, {
            label: address.label,
            recipientName: address.recipientName,
            phone: address.phone,
            line1: address.line1,
            ward: address.ward,
            district: address.district,
            province: address.province,
            country: address.country || 'Việt Nam',
            detail: address.detail,
            googleMapsLink: address.googleMapsLink,
            isDefault: true,
        });

        if (res?.message) {
            notification.error({ message: 'Đặt mặc định', description: res.message });
            return;
        }

        notification.success({ message: 'Đặt mặc định', description: 'Địa chỉ mặc định đã được cập nhật.' });
        await loadAccount();
    };

    return (
        <div className="store-layout">
            <div className="store-page-head">
                <div>
              
                    <h1 className="store-page-head__title">Thông tin tài khoản</h1>
                
                </div>
                <div className="store-page-head__summary">
                    <Tag color="blue">{addresses.length} địa chỉ</Tag>
                    <Tag color="green">{defaultAddress ? 'Đã có địa chỉ mặc định' : 'Chưa có địa chỉ mặc định'}</Tag>
                </div>
            </div>

            <Row gutter={[20, 20]}>
                <Col xs={24} lg={8}>
                    <Card className="content-card" bordered={false} loading={loading}>
                        <div style={{ display: 'grid', justifyItems: 'center', gap: 16, textAlign: 'center' }}>
                            <div style={{ width: 76, height: 76, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #2563eb, #0f766e)', color: '#fff', fontSize: 28, fontWeight: 800 }}>
                                {initials}
                            </div>
                            <div>
                                <h2 className="content-card__title" style={{ marginBottom: 8 }}>Tài khoản của bạn</h2>
                                <p className="content-card__text" style={{ marginBottom: 0 }}>{account?.email || '---'}</p>
                            </div>
                        </div>

                        <Divider />

                        <div style={{ display: 'grid', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <span><UserOutlined /> Họ tên</span>
                                <strong>{account?.name || '---'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <span>Email</span>
                                <strong>{account?.email || '---'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <span>Vai trò</span>
                                <Tag color="blue">{account?.role || 'Member'}</Tag>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <span>Địa chỉ mặc định</span>
                                <strong style={{ textAlign: 'right' }}>{defaultAddress ? defaultAddress.formattedAddress : 'Chưa có'}</strong>
                            </div>
                        </div>

                        <Divider />

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button type="primary" icon={<ShoppingOutlined />} block onClick={() => navigate('/orders')}>
                                Xem lịch sử đơn hàng
                            </Button>
                            <Button icon={<HomeOutlined />} block onClick={() => navigate('/checkout')}>
                                Đi tới thanh toán
                            </Button>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card
                        className="content-card"
                        bordered={false}
                        title="Danh sách địa chỉ"
                        extra={(
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateAddress}>
                                Thêm địa chỉ
                            </Button>
                        )}
                        loading={loading}
                    >
                        {addresses.length > 0 ? (
                            <div className="store-grid--2">
                                {addresses.map((address) => (
                                    <Card
                                        key={address.id || address._id}
                                        className="content-card"
                                        bordered={false}
                                        size="small"
                                        style={{ height: '100%' }}
                                    >
                                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                                <div>
                                                    <strong>{address.label || 'Địa chỉ'}</strong>
                                                    <p className="content-card__text" style={{ margin: '6px 0 0' }}>{address.recipientName} · {address.phone}</p>
                                                </div>
                                                {address.isDefault ? <Tag color="green">Mặc định</Tag> : null}
                                            </div>

                                            <div>
                                                <p className="content-card__text" style={{ marginBottom: 6 }}>{address.formattedAddress}</p>
                                                {address.googleMapsLink ? (
                                                    <a href={address.googleMapsLink} target="_blank" rel="noreferrer">Xem trên Google Maps</a>
                                                ) : null}
                                            </div>

                                            <Space wrap>
                                                <Button icon={<EditOutlined />} onClick={() => openEditAddress(address)}>Sửa</Button>
                                                <Button icon={<CheckOutlined />} onClick={() => handleSetDefault(address)} disabled={address.isDefault}>Đặt mặc định</Button>
                                                <Popconfirm title="Xóa địa chỉ này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDeleteAddress(address)}>
                                                    <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                                                </Popconfirm>
                                            </Space>
                                        </Space>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Empty
                                description="Bạn chưa có địa chỉ giao hàng nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                style={{ padding: '24px 0' }}
                            >
                                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateAddress}>
                                    Thêm địa chỉ đầu tiên
                                </Button>
                            </Empty>
                        )}
                    </Card>
                </Col>
            </Row>

            <Modal
                title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                open={addressModalOpen}
                onCancel={() => {
                    setAddressModalOpen(false);
                    setEditingAddress(null);
                    setAddressDraft({});
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editingAddress ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
                confirmLoading={saving}
                destroyOnClose
                width={720}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitAddress}
                    initialValues={{ country: 'Việt Nam' }}
                    onValuesChange={(_, allValues) => setAddressDraft(allValues)}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="label" label="Tên địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập tên địa chỉ' }]}>
                                <Input placeholder="Nhà riêng, văn phòng..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="recipientName" label="Người nhận" rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}>
                                <Input placeholder="Nguyễn Văn A" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                                <Input placeholder="0900000000" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="country" label="Quốc gia" rules={[{ required: true, message: 'Vui lòng nhập quốc gia' }]}>
                                <Input placeholder="Việt Nam" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="line1" label="Số nhà, tên đường" rules={[{ required: true, message: 'Vui lòng nhập số nhà, tên đường' }]}>
                        <Input placeholder="12 Nguyễn Huệ" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: 'Vui lòng nhập phường/xã' }]}>
                                <Input placeholder="Phường Bến Nghé" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Vui lòng nhập quận/huyện' }]}>
                                <Input placeholder="Quận 1" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="province" label="Tỉnh/Thành phố" rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}>
                                <Input placeholder="TP. Hồ Chí Minh" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="detail" label="Địa chỉ chi tiết" rules={[{ required: true, message: 'Vui lòng nhập mô tả địa chỉ chi tiết' }]}>
                        <Input.TextArea rows={3} placeholder="Tòa nhà, tầng, số căn hộ, mô tả thêm..." />
                    </Form.Item>

                    <Form.Item name="googleMapsLink" label="Link Google Maps">
                        <Input placeholder="Dán link vị trí từ Google Maps" />
                    </Form.Item>

                    <Form.Item name="isDefault" valuePropName="checked">
                        <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                    </Form.Item>

                    <div className="map-preview">
                        <div className="map-preview__head">
                            <strong>Xem trước Google Maps</strong>
                            <span className="content-card__text">Tìm vị trí gần đúng nhất trước khi lưu</span>
                        </div>
                        {mapEmbedSrc ? (
                            <iframe
                                title="Google Maps preview"
                                className="map-preview__frame"
                                src={mapEmbedSrc}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        ) : (
                            <div className="map-preview__empty">Nhập địa chỉ chi tiết để xem bản đồ</div>
                        )}
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilePage;
