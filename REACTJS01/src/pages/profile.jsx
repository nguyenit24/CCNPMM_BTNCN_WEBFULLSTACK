import { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Col, Divider, Empty, Form, Input, Modal, Popconfirm, Row, Space, Tag, notification } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, DeleteOutlined, EditOutlined, HomeOutlined, PlusOutlined, ShoppingOutlined, UserOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { addAccountAddressApi, deleteAccountAddressApi, getAccountApi, updateAccountAddressApi, updateAccountProfileApi } from '../util/api';

const ProfilePage = ({ isInsideAdmin = false }) => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [account, setAccount] = useState(auth?.user || null);
    const [loading, setLoading] = useState(true);
    
    // Address Modal (Storefront multiple addresses)
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressDraft, setAddressDraft] = useState({});
    
    // Unified Profile Modal (Admin/Staff single profile + default address edit)
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [profileDraft, setProfileDraft] = useState({});
    
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const [profileForm] = Form.useForm();

    const addresses = useMemo(() => Array.isArray(account?.addresses) ? account.addresses : [], [account]);
    const defaultAddress = useMemo(
        () => account?.defaultAddress || addresses.find((a) => a.isDefault) || addresses[0] || null,
        [account, addresses]
    );
    const initials = (account?.name || 'M').trim().charAt(0).toUpperCase();

    // Map query for dynamic Google Map preview (Storefront multiple addresses modal)
    const mapQuery = useMemo(() => {
        const parts = [addressDraft.line1, addressDraft.detail, addressDraft.ward, addressDraft.district, addressDraft.province, addressDraft.country]
            .map((v) => String(v || '').trim())
            .filter(Boolean);
        return parts.join(', ');
    }, [addressDraft]);

    const mapEmbedSrc = mapQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed` : '';

    // Map query for dynamic Google Map preview (Admin/Staff unified profile modal)
    const profileMapQuery = useMemo(() => {
        const parts = [profileDraft.line1, profileDraft.detail, profileDraft.ward, profileDraft.district, profileDraft.province, profileDraft.country]
            .map((v) => String(v || '').trim())
            .filter(Boolean);
        return parts.join(', ');
    }, [profileDraft]);

    const profileMapEmbedSrc = profileMapQuery ? `https://www.google.com/maps?q=${encodeURIComponent(profileMapQuery)}&output=embed` : '';

    const syncAccount = (nextAccount) => {
        setAccount(nextAccount);
        setAuth((current) => ({
            ...current,
            isAuthenticated: true,
            user: { ...(current?.user || {}), ...nextAccount },
        }));
    };

    const loadAccount = async () => {
        setLoading(true);
        const res = await getAccountApi();
        if (res?.message) {
            notification.error({ message: 'Tải hồ sơ', description: res.message });
        } else {
            syncAccount(res);
        }
        setLoading(false);
    };

    useEffect(() => { loadAccount(); }, []);

    // --- Action Handlers for Storefront multiple addresses ---
    const openCreateAddress = () => {
        setEditingAddress(null);
        form.resetFields();
        form.setFieldsValue({ country: 'Việt Nam', label: 'Địa chỉ nhà', isDefault: addresses.length === 0 });
        setAddressDraft({ country: 'Việt Nam', label: 'Địa chỉ nhà', isDefault: addresses.length === 0 });
        setAddressModalOpen(true);
    };

    const openEditAddress = (address) => {
        setEditingAddress(address);
        const vals = {
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
        };
        form.setFieldsValue(vals);
        setAddressDraft(vals);
        setAddressModalOpen(true);
    };

    const handleSubmitAddress = async (values) => {
        setSaving(true);
        const payload = { ...values, country: values.country || 'Việt Nam' };
        const res = editingAddress
            ? await updateAccountAddressApi(editingAddress.id || editingAddress._id, payload)
            : await addAccountAddressApi(payload);
        if (res?.message) {
            notification.error({ message: editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ', description: res.message });
        } else {
            notification.success({ message: editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ', description: 'Địa chỉ đã được lưu.' });
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
        } else {
            notification.success({ message: 'Xóa địa chỉ', description: 'Địa chỉ đã được xóa.' });
            await loadAccount();
        }
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
        } else {
            notification.success({ message: 'Đặt mặc định', description: 'Địa chỉ mặc định đã được cập nhật.' });
            await loadAccount();
        }
    };

    // --- Action Handlers for Admin/Staff unified profile editing ---
    const openEditProfile = () => {
        const vals = {
            name: account?.name || '',
            email: account?.email || '',
            line1: defaultAddress?.line1 || '',
            ward: defaultAddress?.ward || '',
            district: defaultAddress?.district || '',
            province: defaultAddress?.province || '',
            country: defaultAddress?.country || 'Việt Nam',
            detail: defaultAddress?.detail || '',
            googleMapsLink: defaultAddress?.googleMapsLink || '',
        };
        profileForm.setFieldsValue(vals);
        setProfileDraft(vals);
        setProfileModalOpen(true);
    };

    const handleSubmitProfile = async (values) => {
        setSaving(true);
        const payload = {
            name: values.name,
            email: values.email,
            address: {
                line1: values.line1,
                ward: values.ward,
                district: values.district,
                province: values.province,
                country: values.country || 'Việt Nam',
                detail: values.detail,
                googleMapsLink: values.googleMapsLink,
            }
        };

        const res = await updateAccountProfileApi(payload);
        if (res?.message) {
            notification.error({ message: 'Cập nhật hồ sơ', description: res.message });
        } else {
            notification.success({ message: 'Cập nhật hồ sơ', description: 'Thông tin cá nhân đã được lưu thành công.' });
            setProfileModalOpen(false);
            profileForm.resetFields();
            await loadAccount();
        }
        setSaving(false);
    };

    // Rendering simplified view for Staff and Admin inside the dashboard
    if (isInsideAdmin) {
        return (
            <div className="admin-section-shell">
                <Row gutter={[24, 24]} justify="center">
                    <Col xs={24} lg={18}>
                        <Card 
                            className="content-card" 
                            bordered={false} 
                            loading={loading}
                            style={{ borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                                    <UserOutlined style={{ color: 'var(--store-primary)' }} />
                                    <span>Hồ sơ nhân sự TechStudio</span>
                                </div>
                            }
                            extra={
                                <Button 
                                    type="primary" 
                                    icon={<EditOutlined />} 
                                    onClick={openEditProfile}
                                    style={{ borderRadius: 12, fontWeight: 700 }}
                                >
                                    Chỉnh sửa hồ sơ
                                </Button>
                            }
                        >
                            <Row gutter={[32, 24]} align="middle">
                                {/* Profile Left Column (Avatar + Stats) */}
                                <Col xs={24} md={8} style={{ borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingRight: 24 }}>
                                    <div className="profile-avatar" style={{ width: 100, height: 100, borderRadius: '50%', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--store-primary)', color: '#fff', fontWeight: 800, marginBottom: 16, boxShadow: '0 8px 24px rgba(37,99,235,0.2)' }}>
                                        {initials}
                                    </div>
                                    <h2 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 700 }}>{account?.name || '---'}</h2>
                                    <Tag color={account?.role?.toLowerCase() === 'admin' ? 'red' : 'orange'} style={{ fontSize: '0.85rem', padding: '4px 12px', borderRadius: 8, fontWeight: 600 }}>
                                        {account?.role || 'Staff'}
                                    </Tag>
                                </Col>

                                {/* Profile Right Column (Details) */}
                                <Col xs={24} md={16} style={{ paddingLeft: 24 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        <div>
                                            <span style={{ color: 'var(--store-muted)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <UserOutlined /> Họ và tên
                                            </span>
                                            <strong style={{ fontSize: '1.05rem', color: '#1e293b' }}>{account?.name || '---'}</strong>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--store-muted)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <MailOutlined /> Địa chỉ Email
                                            </span>
                                            <strong style={{ fontSize: '1.05rem', color: '#1e293b' }}>{account?.email || '---'}</strong>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--store-muted)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <EnvironmentOutlined /> Địa chỉ cư trú (Mặc định)
                                            </span>
                                            {defaultAddress ? (
                                                <div style={{ padding: '14px 18px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    <span style={{ fontSize: '0.98rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                                                        {defaultAddress.formattedAddress}
                                                    </span>
                                                    {defaultAddress.googleMapsLink && (
                                                        <a 
                                                            href={defaultAddress.googleMapsLink} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            style={{ fontSize: '0.85rem', color: 'var(--store-primary)', fontWeight: 700, textDecoration: 'none' }}
                                                        >
                                                            Xem trên Google Maps →
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <Empty 
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                                    description="Chưa cấu hình địa chỉ. Nhấp chỉnh sửa để cập nhật địa chỉ."
                                                    style={{ margin: '10px 0 0' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* Unified Edit Profile Modal for Admin/Staff */}
                <Modal
                    title={<span style={{ fontWeight: 800, fontSize: '1.15rem' }}>Chỉnh sửa hồ sơ cá nhân</span>}
                    open={profileModalOpen}
                    onCancel={() => {
                        setProfileModalOpen(false);
                        setProfileDraft({});
                        profileForm.resetFields();
                    }}
                    onOk={() => profileForm.submit()}
                    okText="Lưu thay đổi"
                    cancelText="Hủy"
                    confirmLoading={saving}
                    destroyOnClose
                    width={720}
                    style={{ top: 40 }}
                >
                    <Form
                        form={profileForm}
                        layout="vertical"
                        onFinish={handleSubmitProfile}
                        onValuesChange={(_, allValues) => setProfileDraft(allValues)}
                    >
                        <Divider style={{ margin: '10px 0 20px' }}>Thông tin cơ bản</Divider>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                                    <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                                    <Input prefix={<MailOutlined />} placeholder="your@email.com" style={{ borderRadius: 8 }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '20px 0 20px' }}>Địa chỉ liên hệ mặc định</Divider>
                        
                        <Form.Item name="line1" label="Số nhà, tên đường" rules={[{ required: true, message: 'Vui lòng nhập số nhà, tên đường' }]}>
                            <Input placeholder="12 Nguyễn Huệ" style={{ borderRadius: 8 }} />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: 'Vui lòng nhập phường/xã' }]}>
                                    <Input placeholder="Phường Bến Nghé" style={{ borderRadius: 8 }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Vui lòng nhập quận/huyện' }]}>
                                    <Input placeholder="Quận 1" style={{ borderRadius: 8 }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="province" label="Tỉnh/Thành phố" rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}>
                                    <Input placeholder="TP. Hồ Chí Minh" style={{ borderRadius: 8 }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="country" label="Quốc gia">
                                    <Input placeholder="Việt Nam" style={{ borderRadius: 8 }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="detail" label="Chi tiết (Tòa nhà, số phòng,...)">
                                    <Input placeholder="Tòa nhà Bitexco, Tầng 15..." style={{ borderRadius: 8 }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="googleMapsLink" label="Link vị trí Google Maps">
                            <Input placeholder="Dán link vị trí từ Google Maps" style={{ borderRadius: 8 }} />
                        </Form.Item>

                        {/* Map Preview */}
                        <div className="map-preview" style={{ marginTop: 20 }}>
                            <div className="map-preview__head" style={{ marginBottom: 10 }}>
                                <strong>Xem trước Google Maps</strong>
                                <span className="content-card__text" style={{ fontSize: '0.8rem', display: 'block', color: 'var(--store-muted)' }}>Xem vị trí định vị địa chỉ</span>
                            </div>
                            {profileMapEmbedSrc ? (
                                <iframe
                                    title="Google Maps profile preview"
                                    className="map-preview__frame"
                                    src={profileMapEmbedSrc}
                                    style={{ width: '100%', height: 200, borderRadius: 12, border: '1px solid #e2e8f0' }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            ) : (
                                <div className="map-preview__empty" style={{ background: '#f8fafc', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--store-muted)', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                                    Nhập địa chỉ để xem bản đồ
                                </div>
                            )}
                        </div>
                    </Form>
                </Modal>
            </div>
        );
    }

    // Return standard storefront profile layout for normal users
    return (
        <div className="store-layout">
            {/* Page Header */}
            <div className="store-page-head">
                <div>
                    <div className="store-page-head__eyebrow">
                        <UserOutlined /> Tài khoản của tôi
                    </div>
                    <h1 className="store-page-head__title">Thông tin cá nhân</h1>
                </div>
                <div className="store-page-head__summary">
                    <Tag color="blue">{addresses.length} địa chỉ</Tag>
                    <Tag color={defaultAddress ? 'green' : 'orange'}>
                        {defaultAddress ? 'Đã có địa chỉ mặc định' : 'Chưa có địa chỉ mặc định'}
                    </Tag>
                </div>
            </div>

            <Row gutter={[20, 20]}>
                {/* Account Info Card */}
                <Col xs={24} lg={8}>
                    <Card className="content-card" bordered={false} loading={loading}>
                        {/* Avatar */}
                        <div style={{ display: 'grid', justifyItems: 'center', gap: 16, textAlign: 'center', marginBottom: 24 }}>
                            <div className="profile-avatar">
                                {initials}
                            </div>
                            <div>
                                <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem' }}>{account?.name || '---'}</h2>
                                <p style={{ margin: 0, color: 'var(--store-muted)', fontSize: '0.9rem' }}>{account?.email || '---'}</p>
                            </div>
                        </div>

                        <Divider style={{ margin: '0 0 20px' }} />

                        {/* Account Details */}
                        <div style={{ display: 'grid', gap: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                                <span style={{ color: 'var(--store-muted)', fontSize: '0.9rem' }}>
                                    <UserOutlined /> Họ và tên
                                </span>
                                <strong>{account?.name || '---'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                                <span style={{ color: 'var(--store-muted)', fontSize: '0.9rem' }}>Email</span>
                                <strong style={{ fontSize: '0.92rem' }}>{account?.email || '---'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                                <span style={{ color: 'var(--store-muted)', fontSize: '0.9rem' }}>Vai trò</span>
                                <Tag color="blue">{account?.role || 'Member'}</Tag>
                            </div>
                            {defaultAddress && (
                                <div style={{ display: 'grid', gap: 4, padding: '12px 14px', borderRadius: 14, background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.1)' }}>
                                    <span style={{ color: 'var(--store-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
                                        <HomeOutlined /> Địa chỉ mặc định
                                    </span>
                                    <span style={{ fontSize: '0.9rem' }}>{defaultAddress.formattedAddress}</span>
                                </div>
                            )}
                        </div>

                        <Divider style={{ margin: '20px 0' }} />

                        <Space direction="vertical" style={{ width: '100%' }}>
                            {String(auth?.user?.role || '').toLowerCase() !== 'admin' ? (
                                <>
                                    <Button type="primary" icon={<ShoppingOutlined />} block onClick={() => navigate('/orders')}
                                        style={{ borderRadius: 999, fontWeight: 700, background: 'linear-gradient(135deg, var(--store-primary), #7c3aed)', border: 0 }}>
                                        Xem đơn hàng
                                    </Button>
                                    <Button icon={<HomeOutlined />} block onClick={() => navigate('/checkout')}
                                        style={{ borderRadius: 999 }}>
                                        Đi tới thanh toán
                                    </Button>
                                </>
                            ) : (
                                <Button type="primary" icon={<ArrowLeftOutlined />} block onClick={() => navigate('/admin')}
                                    style={{ borderRadius: 999, fontWeight: 700, background: 'linear-gradient(135deg, var(--store-primary), #7c3aed)', border: 0 }}>
                                    Quay lại trang Admin
                                </Button>
                            )}
                        </Space>
                    </Card>
                </Col>

                {/* Address List Column */}
                <Col xs={24} lg={16}>
                    <Card
                        className="content-card"
                        bordered={false}
                        title={
                            <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                                <HomeOutlined style={{ marginRight: 8, color: 'var(--store-primary)' }} />
                                Danh sách địa chỉ giao hàng
                            </span>
                        }
                        extra={(
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateAddress}
                                style={{ borderRadius: 999, fontWeight: 700 }}>
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
                                        style={{
                                            height: '100%',
                                            border: address.isDefault ? '2px solid rgba(37,99,235,0.25)' : '1px solid var(--store-border)',
                                            background: address.isDefault ? 'rgba(37,99,235,0.03)' : undefined,
                                        }}
                                    >
                                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                                <div>
                                                    <strong style={{ fontSize: '0.97rem' }}>{address.label || 'Địa chỉ'}</strong>
                                                    <p className="content-card__text" style={{ margin: '5px 0 0', fontSize: '0.88rem' }}>
                                                        {address.recipientName} · {address.phone}
                                                    </p>
                                                </div>
                                                {address.isDefault ? <Tag color="green">Mặc định</Tag> : null}
                                            </div>

                                            <div>
                                                <p className="content-card__text" style={{ marginBottom: 6, fontSize: '0.88rem' }}>
                                                    {address.formattedAddress}
                                                </p>
                                                {address.googleMapsLink ? (
                                                    <a href={address.googleMapsLink} target="_blank" rel="noreferrer"
                                                        style={{ fontSize: '0.85rem', color: 'var(--store-primary)', fontWeight: 600 }}>
                                                        Xem bản đồ →
                                                    </a>
                                                ) : null}
                                            </div>

                                            <Space wrap size={6}>
                                                <Button size="small" icon={<EditOutlined />} onClick={() => openEditAddress(address)}
                                                    style={{ borderRadius: 999 }}>Sửa</Button>
                                                <Button size="small" icon={<CheckOutlined />} onClick={() => handleSetDefault(address)}
                                                    disabled={address.isDefault} style={{ borderRadius: 999 }}>Đặt mặc định</Button>
                                                <Popconfirm title="Xóa địa chỉ này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDeleteAddress(address)}>
                                                    <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 999 }}>Xóa</Button>
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
                                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateAddress}
                                    style={{ borderRadius: 999, fontWeight: 700 }}>
                                    Thêm địa chỉ đầu tiên
                                </Button>
                            </Empty>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Address Modal */}
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
                                <Input placeholder="Nhà riêng, văn phòng..." style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="recipientName" label="Người nhận" rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}>
                                <Input placeholder="Nguyễn Văn A" style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                                <Input placeholder="0900000000" style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="country" label="Quốc gia" rules={[{ required: true, message: 'Vui lòng nhập quốc gia' }]}>
                                <Input placeholder="Việt Nam" style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="line1" label="Số nhà, tên đường" rules={[{ required: true, message: 'Vui lòng nhập số nhà, tên đường' }]}>
                        <Input placeholder="12 Nguyễn Huệ" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: 'Vui lòng nhập phường/xã' }]}>
                                <Input placeholder="Phường Bến Nghé" style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Vui lòng nhập quận/huyện' }]}>
                                <Input placeholder="Quận 1" style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="province" label="Tỉnh/Thành phố" rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}>
                                <Input placeholder="TP. Hồ Chí Minh" style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="detail" label="Mô tả chi tiết" rules={[{ required: true, message: 'Vui lòng nhập mô tả địa chỉ chi tiết' }]}>
                        <Input.TextArea rows={3} placeholder="Tòa nhà, tầng, số căn hộ, mô tả thêm..." style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="googleMapsLink" label="Link Google Maps">
                        <Input placeholder="Dán link vị trí từ Google Maps" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="isDefault" valuePropName="checked">
                        <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                    </Form.Item>

                    {/* Map Preview */}
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
                                style={{ width: '100%', height: 200, borderRadius: 12, border: '1px solid #e2e8f0' }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        ) : (
                            <div className="map-preview__empty">Nhập địa chỉ để xem bản đồ</div>
                        )}
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilePage;
