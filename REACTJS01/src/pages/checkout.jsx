import { useContext, useEffect, useMemo, useState } from 'react';
import { Button as AButton, Card as ACard, Checkbox as ACheckbox, Col as ACol, Divider as ADivider, Empty as AEmpty, Form as AForm, Input as AInput, Radio as ARadio, Result as AResult, Row as ARow, Space as ASpace, Spin as ASpin, Tag as ATag, notification as antNotification } from 'antd';
import { CheckCircleOutlined, GiftOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { checkoutOrderApi, getAccountApi, getCartApi, calculateShippingApi, validateVoucherApi } from '../util/api';


const moneyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [form] = AForm.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [account, setAccount] = useState(auth?.user || null);
    const [cart, setCart] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [addressDraft, setAddressDraft] = useState({});

    // Shipping state
    const [shippingInfo, setShippingInfo] = useState(null); // { fee, tier, label, estimatedDays }
    const [loadingShipping, setLoadingShipping] = useState(false);

    // Voucher state
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherResult, setVoucherResult] = useState(null); // { discountAmount, shippingDiscount, discountLabel }
    const [validatingVoucher, setValidatingVoucher] = useState(false);

    const addresses = useMemo(() => Array.isArray(account?.addresses) ? account.addresses : [], [account]);
    const defaultAddress = useMemo(() => account?.defaultAddress || addresses.find((item) => item.isDefault) || addresses[0] || null, [account, addresses]);
    const items = useMemo(() => Array.isArray(cart?.items) ? cart.items : [], [cart]);
    const subtotal = Number(cart?.subtotal || 0);
    const totalQuantity = Number(cart?.totalQuantity || 0);
    const selectedAddress = addresses.find((item) => (item.id || item._id) === selectedAddressId) || defaultAddress || null;

    const shippingSummary = useNewAddress
        ? 'Địa chỉ mới sẽ được tạo khi đặt hàng'
        : (selectedAddress ? selectedAddress.formattedAddress : 'Chưa chọn');

    const shippingFee = shippingInfo ? shippingInfo.fee : 0;
    const discountAmount = voucherResult ? (voucherResult.discountAmount || 0) : 0;
    const shippingDiscount = voucherResult ? (voucherResult.shippingDiscount || 0) : 0;
    const finalShippingFee = Math.max(shippingFee - shippingDiscount, 0);
    const finalTotal = Math.max(subtotal + finalShippingFee - discountAmount, 0);

    const previewAddress = useMemo(() => {
        if (!useNewAddress && selectedAddress) {
            return selectedAddress.formattedAddress;
        }
        const parts = [
            addressDraft.line1, addressDraft.detail, addressDraft.ward,
            addressDraft.district, addressDraft.province, addressDraft.country,
        ].map((item) => String(item || '').trim()).filter(Boolean);
        return parts.join(', ');
    }, [useNewAddress, selectedAddress, addressDraft]);

    const mapEmbedSrc = previewAddress ? `https://www.google.com/maps?q=${encodeURIComponent(previewAddress)}&output=embed` : '';

    const syncAccount = (nextAccount) => {
        setAccount(nextAccount);
        setAuth((current) => ({
            ...current,
            isAuthenticated: true,
            user: { ...(current?.user || {}), ...nextAccount },
        }));
    };

    const loadPage = async () => {
        setLoading(true);
        const [accountRes, cartRes] = await Promise.all([getAccountApi(), getCartApi()]);
        if (accountRes && !accountRes.message) syncAccount(accountRes);
        if (cartRes?.message) {
            antNotification.error({ message: 'Tải giỏ hàng', description: cartRes.message });
        } else {
            setCart(cartRes?.cart || { items: [], subtotal: 0, totalQuantity: 0 });
        }
        setLoading(false);
    };

    useEffect(() => { loadPage(); }, []);

    useEffect(() => {
        if (addresses.length === 0) {
            setUseNewAddress(true);
            return;
        }
        const defaultId = defaultAddress?.id || defaultAddress?._id || '';
        setSelectedAddressId((current) => current || defaultId || (addresses[0]?.id || addresses[0]?._id || ''));
    }, [addresses, defaultAddress]);

    // Auto-calculate shipping fee when selected address changes
    useEffect(() => {
        const province = useNewAddress ? addressDraft.province : selectedAddress?.province;
        if (!province) {
            setShippingInfo(null);
            return;
        }
        const timer = setTimeout(async () => {
            setLoadingShipping(true);
            const res = await calculateShippingApi(province);
            if (res?.data || res?.success) {
                setShippingInfo(res.data || res);
            }
            setLoadingShipping(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [selectedAddressId, useNewAddress, addressDraft.province, selectedAddress?.province]);

    // Reset voucher when shipping fee changes
    useEffect(() => {
        setVoucherResult(null);
    }, [shippingFee]);

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            antNotification.warning({ message: 'Nhập mã voucher trước' });
            return;
        }
        setValidatingVoucher(true);
        const res = await validateVoucherApi(voucherCode.trim(), subtotal, shippingFee);
        if (res && res.success !== false) {
            setVoucherResult(res.data || res);
            antNotification.success({ message: 'Voucher hợp lệ!', description: res.data?.discountLabel || '' });
        } else {
            setVoucherResult(null);
            antNotification.error({ message: 'Voucher không hợp lệ', description: res?.message || 'Mã không tồn tại hoặc đã được sử dụng.' });
        }
        setValidatingVoucher(false);
    };

    const handleCheckout = async (values) => {
        setSubmitting(true);
        const payload = {
            paymentMethod: 'COD',
            notes: values.notes || '',
            voucherCode: voucherCode.trim() || '',
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
            antNotification.error({ message: 'Thanh toán COD', description: res.message });
            setSubmitting(false);
            return;
        }
        antNotification.success({
            message: 'Đặt hàng thành công',
            description: 'Đơn hàng COD của bạn đã được tạo và chuyển sang theo dõi đơn hàng.',
        });
        navigate('/orders', { state: { focusOrderId: res.id } });
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="store-layout store-loading">
                <ASpin size="large" />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="store-layout">
                <AResult
                    status="info"
                    icon={<ShoppingOutlined />}
                    title="Giỏ hàng đang trống"
                    subTitle="Bạn cần thêm sản phẩm vào giỏ trước khi thanh toán COD."
                    extra={<AButton type="primary" onClick={() => navigate('/products')}>Xem sản phẩm</AButton>}
                />
            </div>
        );
    }

    const addressFormContent = (
        <>
            <ADivider />
            <ARow gutter={16}>
                <ACol xs={24} md={12}>
                    <AForm.Item name="label" label="Tên địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập tên địa chỉ' }]}>
                        <AInput placeholder="Nhà riêng, văn phòng..." />
                    </AForm.Item>
                </ACol>
                <ACol xs={24} md={12}>
                    <AForm.Item name="recipientName" label="Người nhận" rules={[{ required: true, message: 'Vui lòng nhập người nhận' }]}>
                        <AInput placeholder="Nguyễn Văn A" />
                    </AForm.Item>
                </ACol>
            </ARow>
            <ARow gutter={16}>
                <ACol xs={24} md={12}>
                    <AForm.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                        <AInput placeholder="0900000000" />
                    </AForm.Item>
                </ACol>
                <ACol xs={24} md={12}>
                    <AForm.Item name="country" label="Quốc gia" rules={[{ required: true, message: 'Vui lòng nhập quốc gia' }]}>
                        <AInput />
                    </AForm.Item>
                </ACol>
            </ARow>
            <AForm.Item name="line1" label="Số nhà, tên đường" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}>
                <AInput placeholder="12 Nguyễn Huệ" />
            </AForm.Item>
            <ARow gutter={16}>
                <ACol xs={24} md={8}>
                    <AForm.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: 'Vui lòng nhập phường/xã' }]}>
                        <AInput placeholder="Phường Bến Nghé" />
                    </AForm.Item>
                </ACol>
                <ACol xs={24} md={8}>
                    <AForm.Item name="district" label="Quận/Huyện" rules={[{ required: true, message: 'Vui lòng nhập quận/huyện' }]}>
                        <AInput placeholder="Quận 1" />
                    </AForm.Item>
                </ACol>
                <ACol xs={24} md={8}>
                    <AForm.Item name="province" label="Tỉnh/Thành phố" rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}>
                        <AInput placeholder="TP. Hồ Chí Minh" />
                    </AForm.Item>
                </ACol>
            </ARow>
            <AForm.Item name="detail" label="Mô tả địa chỉ chi tiết" rules={[{ required: true, message: 'Vui lòng mô tả địa chỉ chi tiết' }]}>
                <AInput.TextArea rows={3} placeholder="Tòa nhà, tầng, số căn hộ, hướng dẫn giao hàng..." />
            </AForm.Item>
            <AForm.Item name="googleMapsLink" label="Link Google Maps">
                <AInput placeholder="Dán vị trí từ Google Maps" />
            </AForm.Item>
            <AForm.Item name="isDefault" valuePropName="checked">
                <ACheckbox>Đặt làm địa chỉ mặc định</ACheckbox>
            </AForm.Item>
            <AForm.Item name="notes" label="Ghi chú đơn hàng">
                <AInput.TextArea rows={3} placeholder="Ví dụ: gọi trước khi giao, giao giờ hành chính..." />
            </AForm.Item>
            <AButton type="primary" htmlType="submit" loading={submitting} icon={<CheckCircleOutlined />} block>
                Đặt hàng COD
            </AButton>
        </>
    );

    const existingAddressForm = (
        <>
            <ADivider />
            <AForm.Item name="notes" label="Ghi chú đơn hàng">
                <AInput.TextArea rows={3} placeholder="Ví dụ: gọi trước khi giao, giao giờ hành chính..." />
            </AForm.Item>
            <AButton type="primary" htmlType="submit" loading={submitting} icon={<CheckCircleOutlined />} block>
                Đặt hàng COD
            </AButton>
        </>
    );

    return (
        <div className="store-layout checkout-page">
            <div className="store-page-head">
                <div>
                    <h1 className="store-page-head__title">Xác nhận thanh toán và địa chỉ giao hàng</h1>
                </div>
                <div className="store-page-head__summary">
                    <ATag color="blue">COD</ATag>
                    <ATag color="green">{totalQuantity} sản phẩm</ATag>
                </div>
            </div>

            <ARow gutter={[20, 20]}>
                <ACol xs={24} lg={15}>
                    <ACard className="content-card" bordered={false} title="Địa chỉ giao hàng">
                        {addresses.length > 0 ? (
                            <ARadio.Group
                                value={useNewAddress ? '__new__' : selectedAddressId}
                                style={{ width: '100%' }}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    if (value === '__new__') { setUseNewAddress(true); return; }
                                    setUseNewAddress(false);
                                    setSelectedAddressId(value);
                                }}
                            >
                                <ASpace direction="vertical" style={{ width: '100%' }}>
                                    {addresses.map((address) => (
                                        <ARadio key={address.id || address._id} value={address.id || address._id} style={{ width: '100%' }}>
                                            <div className="checkout-address-card">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                                                    <div>
                                                        <strong>{address.label}</strong>
                                                        <div className="content-card__text" style={{ marginTop: 6 }}>{address.recipientName} · {address.phone}</div>
                                                    </div>
                                                    {address.isDefault ? <ATag color="green">Mặc định</ATag> : null}
                                                </div>
                                                <div className="content-card__text" style={{ marginTop: 8 }}>{address.formattedAddress}</div>
                                            </div>
                                        </ARadio>
                                    ))}
                                    <ARadio value="__new__" style={{ width: '100%' }}>
                                        <div className="checkout-address-card checkout-address-card--new">
                                            <strong>Thêm địa chỉ mới</strong>
                                            <div className="content-card__text">Nhập địa chỉ chi tiết, có thể lưu luôn vào hồ sơ của bạn.</div>
                                        </div>
                                    </ARadio>
                                </ASpace>
                            </ARadio.Group>
                        ) : (
                            <AEmpty description="Bạn chưa có địa chỉ nào" />
                        )}

                        {useNewAddress || addresses.length === 0 ? (
                            <AForm
                                form={form}
                                layout="vertical"
                                onFinish={handleCheckout}
                                className="checkout-form"
                                initialValues={{ country: 'Việt Nam', isDefault: addresses.length === 0 }}
                                onValuesChange={(_, allValues) => setAddressDraft(allValues)}
                            >
                                {addressFormContent}
                                <div className="map-preview" style={{ marginTop: 20 }}>
                                    <div className="map-preview__head">
                                        <strong>Bản đồ địa chỉ</strong>
                                        <span className="content-card__text">Kiểm tra vị trí giao hàng trước khi đặt đơn</span>
                                    </div>
                                    {mapEmbedSrc ? (
                                        <iframe title="Checkout Google Maps preview" className="map-preview__frame" src={mapEmbedSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                                    ) : (
                                        <div className="map-preview__empty">Nhập địa chỉ để xem bản đồ</div>
                                    )}
                                </div>
                            </AForm>
                        ) : (
                            <AForm
                                form={form}
                                layout="vertical"
                                onFinish={handleCheckout}
                                className="checkout-form"
                                onValuesChange={(_, allValues) => setAddressDraft(allValues)}
                            >
                                {existingAddressForm}
                                <div className="map-preview" style={{ marginTop: 20 }}>
                                    <div className="map-preview__head">
                                        <strong>Bản đồ địa chỉ</strong>
                                        <span className="content-card__text">Xem trước vị trí giao hàng đã lưu</span>
                                    </div>
                                    {mapEmbedSrc ? (
                                        <iframe title="Checkout Google Maps preview" className="map-preview__frame" src={mapEmbedSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                                    ) : (
                                        <div className="map-preview__empty">Chọn địa chỉ đã lưu để xem bản đồ</div>
                                    )}
                                </div>
                            </AForm>
                        )}
                    </ACard>
                </ACol>

                <ACol xs={24} lg={9}>
                    <ACard className="content-card" bordered={false} title="Tóm tắt đơn hàng">
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

                        <ADivider />

                        <ASpace direction="vertical" style={{ width: '100%' }} size={10}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Tạm tính</span>
                                <strong>{moneyFormatter.format(subtotal)}</strong>
                            </div>

                            {/* Shipping fee row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>
                                    Phí vận chuyển
                                    {shippingInfo && <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 4 }}>({shippingInfo.estimatedDays} ngày)</span>}
                                </span>
                                <strong>
                                    {loadingShipping ? <ASpin size="small" /> : (shippingInfo ? moneyFormatter.format(shippingFee) : '---')}
                                </strong>
                            </div>

                            {shippingInfo && (
                                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '8px 12px', fontSize: '0.85rem', color: '#0369a1' }}>
                                    🚚 {shippingInfo.label} · Dự kiến {shippingInfo.estimatedDays} ngày
                                </div>
                            )}

                            {/* Voucher */}
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <GiftOutlined style={{ color: '#7c3aed' }} /> Mã giảm giá
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <AInput
                                        value={voucherCode}
                                        onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherResult(null); }}
                                        placeholder="Nhập mã voucher..."
                                        style={{ borderRadius: 8, fontFamily: 'monospace', fontWeight: 700 }}
                                    />
                                    <AButton
                                        type="default"
                                        loading={validatingVoucher}
                                        onClick={handleApplyVoucher}
                                        style={{ borderRadius: 8, whiteSpace: 'nowrap' }}
                                    >
                                        Áp dụng
                                    </AButton>
                                </div>
                                {voucherResult && (
                                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, color: '#15803d', fontWeight: 600, fontSize: '0.88rem' }}>
                                        ✅ {voucherResult.discountLabel}
                                    </div>
                                )}
                            </div>

                            {/* Discount row */}
                            {discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                                    <span>Giảm giá voucher</span>
                                    <strong>−{moneyFormatter.format(discountAmount)}</strong>
                                </div>
                            )}
                            {shippingDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                                    <span>Miễn phí ship</span>
                                    <strong>−{moneyFormatter.format(shippingDiscount)}</strong>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Phương thức</span>
                                <strong>COD</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Số lượng</span>
                                <strong>{totalQuantity}</strong>
                            </div>

                            <ADivider style={{ margin: '12px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                                <span>Tổng cộng</span>
                                <strong style={{ color: 'var(--store-primary)' }}>{moneyFormatter.format(finalTotal)}</strong>
                            </div>
                        </ASpace>

                        <ADivider />

                        <div className="map-preview map-preview--compact">
                            <div className="map-preview__head">
                                <strong>Vị trí giao hàng</strong>
                            </div>
                            {mapEmbedSrc ? (
                                <iframe title="Shipping location map" className="map-preview__frame" src={mapEmbedSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                            ) : null}
                        </div>

                        <AButton type="primary" block onClick={() => navigate('/cart')}>Quay lại giỏ hàng</AButton>
                        <AButton block style={{ marginTop: 10 }} onClick={() => navigate('/profile')}>Quản lý địa chỉ trong hồ sơ</AButton>
                    </ACard>
                </ACol>
            </ARow>
        </div>
    );
};

export default CheckoutPage;