import { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Col, Divider, Empty, Form, Input, Radio, Result, Row, Space, Spin, Tag, notification } from 'antd';
import { CheckCircleOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { checkoutOrderApi, getAccountApi, getCartApi } from '../util/api';

const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [account, setAccount] = useState(auth?.user || null);
    const [cart, setCart] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [addressDraft, setAddressDraft] = useState({});

    const addresses = useMemo(() => Array.isArray(account?.addresses) ? account.addresses : [], [account]);
    const defaultAddress = useMemo(() => account?.defaultAddress || addresses.find((item) => item.isDefault) || addresses[0] || null, [account, addresses]);
    const items = useMemo(() => Array.isArray(cart?.items) ? cart.items : [], [cart]);
    const subtotal = Number(cart?.subtotal || 0);
    const totalQuantity = Number(cart?.totalQuantity || 0);
    const selectedAddress = addresses.find((item) => (item.id || item._id) === selectedAddressId) || defaultAddress || null;
    const shippingSummary = useNewAddress
        ? 'Địa chỉ mới sẽ được tạo khi đặt hàng'
        : (selectedAddress ? selectedAddress.formattedAddress : 'Chưa chọn');
    const previewAddress = useMemo(() => {
        if (!useNewAddress && selectedAddress) {
            return selectedAddress.formattedAddress;
        }

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
    }, [useNewAddress, selectedAddress, addressDraft]);

    const mapEmbedSrc = previewAddress ? `https://www.google.com/maps?q=${encodeURIComponent(previewAddress)}&output=embed` : '';

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

    const loadPage = async () => {
        setLoading(true);
        const [accountRes, cartRes] = await Promise.all([getAccountApi(), getCartApi()]);

        if (accountRes && !accountRes.message) {
            syncAccount(accountRes);
        }

        if (cartRes?.message) {
            notification.error({ message: 'Tải giỏ hàng', description: cartRes.message });
        } else {
            setCart(cartRes?.cart || { items: [], subtotal: 0, totalQuantity: 0 });
        }

        setLoading(false);
    };

    useEffect(() => {
        loadPage();
    }, []);

    useEffect(() => {
        if (addresses.length === 0) {
            setUseNewAddress(true);
            return;
        }

        const defaultId = defaultAddress?.id || defaultAddress?._id || '';
        setSelectedAddressId((current) => current || defaultId || (addresses[0]?.id || addresses[0]?._id || ''));
    }, [addresses, defaultAddress]);

    const handleCheckout = async (values) => {
        setSubmitting(true);

        const payload = {
            paymentMethod: 'COD',
            notes: values.notes || '',
        };

        if (useNewAddress || !selectedAddressId) {
            payload.address = {
                label: values.label,
                recipientName: values.recipientName,
                phone: values.phone,
                line1: values.line1,
                ward: values.ward,
                district: values.district,
                province: values.province,
                country: values.country || 'Việt Nam',
                detail: values.detail,
                googleMapsLink: values.googleMapsLink,
                isDefault: values.isDefault,
            };
        } else {
            payload.addressId = selectedAddressId;
        }

        const res = await checkoutOrderApi(payload);

        if (res?.message) {
            notification.error({ message: 'Thanh toán COD', description: res.message });
            setSubmitting(false);
            return;
        }

        notification.success({
            message: 'Đặt hàng thành công',
            description: 'Đơn hàng COD của bạn đã được tạo và chuyển sang theo dõi đơn hàng.',
        });

        navigate('/orders', { state: { focusOrderId: res.id } });
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="store-layout store-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="store-layout">
                <Result
                    status="info"
                    icon={<ShoppingOutlined />}
                    title="Giỏ hàng đang trống"
                    subTitle="Bạn cần thêm sản phẩm vào giỏ trước khi thanh toán COD."
                    extra={(
                        <Button type="primary" onClick={() => navigate('/products')}>
                            Xem sản phẩm
                        </Button>
                    )}
                />
            </div>
        );
    }

    return (
        <div className="store-layout checkout-page">
            <div className="store-page-head">
                <div>
                    <h1 className="store-page-head__title">Xác nhận thanh toán và địa chỉ giao hàng</h1>
                
                </div>
                <div className="store-page-head__summary">
                    <Tag color="blue">COD</Tag>
                    <Tag color="green">{totalQuantity} sản phẩm</Tag>
                </div>
            </div>

            <Row gutter={[20, 20]}>
                <Col xs={24} lg={15}>
                    <Card className="content-card" bordered={false} title="Địa chỉ giao hàng">
                        {addresses.length > 0 ? (
                            <Radio.Group
                                value={useNewAddress ? '__new__' : selectedAddressId}
                                style={{ width: '100%' }}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    if (value === '__new__') {
                                        setUseNewAddress(true);
                                        return;
                                    }
                                    setUseNewAddress(false);
                                    setSelectedAddressId(value);
                                }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {addresses.map((address) => (
                                        <Radio key={address.id || address._id} value={address.id || address._id} style={{ width: '100%' }}>
                                            <div className="checkout-address-card">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                                                    <div>
                                                        <strong>{address.label}</strong>
                                                        <div className="content-card__text" style={{ marginTop: 6 }}>{address.recipientName} · {address.phone}</div>
                                                    </div>
                                                    {address.isDefault ? <Tag color="green">Mặc định</Tag> : null}
                                                </div>
                                                <div className="content-card__text" style={{ marginTop: 8 }}>{address.formattedAddress}</div>
                                            </div>
                                        </Radio>
                                    ))}
                                    <Radio value="__new__" style={{ width: '100%' }}>
                                        <div className="checkout-address-card checkout-address-card--new">
                                            <strong>Thêm địa chỉ mới</strong>
                                            <div className="content-card__text">Nhập địa chỉ chi tiết, có thể lưu luôn vào hồ sơ của bạn.</div>
                                        </div>
                                    </Radio>
                                </Space>
                            </Radio.Group>
                        ) : (
                            <Empty description="Bạn chưa có địa chỉ nào" />
                        )}

                        {useNewAddress || addresses.length === 0 ? (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleCheckout}
                                className="checkout-form"
                                initialValues={{ country: 'Việt Nam', isDefault: addresses.length === 0 }}
                                onValuesChange={(_, allValues) => setAddressDraft(allValues)}
                            >
                                <Divider />
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="label" label="Tên địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập tên địa chỉ' }]}>
                                            <Input placeholder="Nhà riêng, văn phòng..." />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item name="recipientName" label="Người nhận" rules={[{ required: true, message: 'Vui lòng nhập người nhận' }]}>
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
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item name="line1" label="Số nhà, tên đường" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}>
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

                                <Form.Item name="detail" label="Mô tả địa chỉ chi tiết" rules={[{ required: true, message: 'Vui lòng mô tả địa chỉ chi tiết' }]}>
                                    <Input.TextArea rows={3} placeholder="Tòa nhà, tầng, số căn hộ, hướng dẫn giao hàng..." />
                                </Form.Item>

                                <Form.Item name="googleMapsLink" label="Link Google Maps">
                                    <Input placeholder="Dán vị trí từ Google Maps" />
                                </Form.Item>

                                <Form.Item name="isDefault" valuePropName="checked">
                                    <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                                </Form.Item>

                                <Form.Item name="notes" label="Ghi chú đơn hàng">
                                    <Input.TextArea rows={3} placeholder="Ví dụ: gọi trước khi giao, giao giờ hành chính..." />
                                </Form.Item>

                                <Button type="primary" htmlType="submit" loading={submitting} icon={<CheckCircleOutlined />} block>
                                    Đặt hàng COD
                                </Button>

                                <div className="map-preview">
                                    <div className="map-preview__head">
                                        <strong>Bản đồ địa chỉ</strong>
                                        <span className="content-card__text">Kiểm tra vị trí giao hàng trước khi đặt đơn</span>
                                    </div>
                                    {mapEmbedSrc ? (
                                        <iframe
                                            title="Checkout Google Maps preview"
                                            className="map-preview__frame"
                                            src={mapEmbedSrc}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <div className="map-preview__empty">Nhập địa chỉ để xem bản đồ</div>
                                    )}
                                </div>
                            </Form>
                        ) : (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleCheckout}
                                className="checkout-form"
                                onValuesChange={(_, allValues) => setAddressDraft(allValues)}
                            >
                                <Divider />
                                <Form.Item name="notes" label="Ghi chú đơn hàng">
                                    <Input.TextArea rows={3} placeholder="Ví dụ: gọi trước khi giao, giao giờ hành chính..." />
                                </Form.Item>
                                <Button type="primary" htmlType="submit" loading={submitting} icon={<CheckCircleOutlined />} block>
                                    Đặt hàng COD
                                </Button>

                                <div className="map-preview">
                                    <div className="map-preview__head">
                                        <strong>Bản đồ địa chỉ</strong>
                                        <span className="content-card__text">Xem trước vị trí giao hàng đã lưu</span>
                                    </div>
                                    {mapEmbedSrc ? (
                                        <iframe
                                            title="Checkout Google Maps preview"
                                            className="map-preview__frame"
                                            src={mapEmbedSrc}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <div className="map-preview__empty">Chọn địa chỉ đã lưu để xem bản đồ</div>
                                    )}
                                </div>
                            </Form>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={9}>
                    <Card className="content-card" bordered={false} title="Tóm tắt đơn hàng">
                        <div style={{ display: 'grid', gap: 14 }}>
                            {items.map((item) => (
                                <div key={item.productId} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <img src={item.images?.[0]} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 16 }} />
                                    <div style={{ flex: 1 }}>
                                        <strong style={{ display: 'block', marginBottom: 4 }}>{item.name}</strong>
                                        <div className="content-card__text">SL: {item.quantity}</div>
                                        <div className="content-card__text">{moneyFormatter.format(item.lineTotal)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Divider />

                        <Space direction="vertical" style={{ width: '100%' }} size={10}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Tạm tính</span>
                                <strong>{moneyFormatter.format(subtotal)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Số lượng</span>
                                <strong>{totalQuantity}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Phương thức</span>
                                <strong>COD</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Địa chỉ</span>
                                <strong style={{ maxWidth: 220, textAlign: 'right' }}>{shippingSummary}</strong>
                            </div>
                            <Divider style={{ margin: '12px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                                <span>Tổng cộng</span>
                                <strong>{moneyFormatter.format(subtotal)}</strong>
                            </div>
                        </Space>

                        <Divider />

                        <div className="map-preview map-preview--compact">
                            <div className="map-preview__head">
                                <strong>Vị trí giao hàng</strong>
                            </div>
                            {mapEmbedSrc ? (
                                <iframe
                                    title="Shipping location map"
                                    className="map-preview__frame"
                                    src={mapEmbedSrc}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            ) : null}
                        </div>

                        <Button type="primary" block onClick={() => navigate('/cart')}>
                            Quay lại giỏ hàng
                        </Button>
                        <Button block style={{ marginTop: 10 }} onClick={() => navigate('/profile')}>
                            Quản lý địa chỉ trong hồ sơ
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CheckoutPage;