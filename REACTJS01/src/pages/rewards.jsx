import { useContext, useEffect, useState } from 'react';
import { Button, Card, Empty, Spin, Table, Tag, notification } from 'antd';
import { ArrowLeftOutlined, GiftOutlined, ShoppingOutlined, StarOutlined, TrophyFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getMyRewardsApi, getMyVouchersApi, redeemVoucherApi } from '../util/api';

const VOUCHER_OPTIONS = [
    {
        type: 'percent_discount',
        label: '🎟️ Voucher giảm 10%',
        description: 'Giảm 10% tổng đơn hàng (tối đa 200.000đ)',
        pointsCost: 100,
        color: '#7c3aed',
        bgFrom: '#f5f3ff',
        bgTo: '#ede9fe',
        border: '#8b5cf6',
    },
    {
        type: 'free_shipping',
        label: '🚚 Voucher miễn phí ship',
        description: 'Miễn phí vận chuyển cho đơn hàng tiếp theo',
        pointsCost: 100,
        color: '#0284c7',
        bgFrom: '#f0f9ff',
        bgTo: '#e0f2fe',
        border: '#38bdf8',
    },
];

const RewardsPage = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);

    const [rewardsData, setRewardsData] = useState({ totalPoints: 0, history: [] });
    const [rewardsLoading, setRewardsLoading] = useState(true);
    const [myVouchers, setMyVouchers] = useState([]);
    const [vouchersLoading, setVouchersLoading] = useState(true);
    const [redeemingVoucher, setRedeemingVoucher] = useState(null);

    const loadRewards = async () => {
        setRewardsLoading(true);
        const res = await getMyRewardsApi();
        if (res && res.success !== false) {
            setRewardsData(res.data || res);
        }
        setRewardsLoading(false);
    };

    const loadVouchers = async () => {
        setVouchersLoading(true);
        const res = await getMyVouchersApi();
        if (res && res.success !== false) {
            setMyVouchers(res.data || []);
        }
        setVouchersLoading(false);
    };

    useEffect(() => {
        loadRewards();
        loadVouchers();
    }, []);

    const handleRedeemVoucher = async (type) => {
        setRedeemingVoucher(type);
        const res = await redeemVoucherApi(type);
        if (res && res.success !== false) {
            notification.success({
                message: 'Đổi điểm thành công! 🎉',
                description: 'Voucher đã được tạo. Kiểm tra danh sách voucher bên dưới.',
            });
            await Promise.all([loadRewards(), loadVouchers()]);
        } else {
            notification.error({
                message: 'Không thể đổi voucher',
                description: res?.message || 'Bạn chưa đủ điểm hoặc có lỗi xảy ra.',
            });
        }
        setRedeemingVoucher(null);
    };

    const totalPoints = rewardsData.totalPoints || 0;

    return (
        <div className="store-layout">
            {/* Page Header */}
            <div className="store-page-head">
                <div>
                    <div className="store-page-head__eyebrow">
                        <TrophyFilled style={{ color: '#f59e0b' }} /> Thành viên ưu đãi
                    </div>
                    <h1 className="store-page-head__title">Điểm thưởng &amp; Voucher</h1>
                </div>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/profile')} style={{ borderRadius: 999 }}>
                    Quay lại hồ sơ
                </Button>
            </div>

            {/* Points Balance Hero */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #7c3aed 100%)',
                    borderRadius: 24,
                    color: '#ffffff',
                    padding: '32px 36px',
                    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 20,
                    flexWrap: 'wrap',
                    marginBottom: 28,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', right: 60, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.85, fontWeight: 700, marginBottom: 8 }}>
                        Điểm thành viên khả dụng
                    </div>
                    {rewardsLoading ? (
                        <Spin size="large" />
                    ) : (
                        <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                            {totalPoints.toLocaleString('vi-VN')}
                            <span style={{ fontSize: '1.4rem', opacity: 0.85, fontWeight: 600 }}>điểm</span>
                        </div>
                    )}
                    <div style={{ marginTop: 12, fontSize: '0.9rem', opacity: 0.75 }}>
                        Xin chào, <strong style={{ opacity: 1 }}>{auth?.user?.name || 'thành viên'}</strong>!&nbsp;
                        {totalPoints >= 100
                            ? '🎉 Bạn đủ điều kiện đổi voucher rồi!'
                            : `Cần thêm ${100 - totalPoints} điểm để đổi voucher đầu tiên.`}
                    </div>
                </div>
                <div style={{ position: 'relative', zIndex: 1, fontSize: '5rem', opacity: 0.18 }}>
                    <TrophyFilled />
                </div>
            </div>

            {/* How to earn */}
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 16, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ background: '#d97706', color: '#fff', padding: '8px', borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <StarOutlined style={{ fontSize: 18 }} />
                </div>
                <div>
                    <strong style={{ display: 'block', marginBottom: 4, color: '#92400e', fontSize: '0.95rem' }}>
                        Cách tích điểm thưởng
                    </strong>
                    <span style={{ fontSize: '0.88rem', color: '#b45309', lineHeight: 1.6 }}>
                        Mỗi khi bạn mua hàng và viết đánh giá sản phẩm đã nhận trong phần{' '}
                        <strong>Đơn hàng của tôi</strong>, bạn sẽ được tích lũy ngay{' '}
                        <strong>+10 điểm thưởng</strong>. Tích đủ <strong>100 điểm</strong> để đổi voucher ưu đãi!
                    </span>
                </div>
            </div>

            {/* Voucher Redemption */}
            <Card
                className="content-card"
                bordered={false}
                title={
                    <span style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <GiftOutlined style={{ color: '#7c3aed' }} /> Đổi điểm lấy voucher
                        <Tag color="purple" style={{ marginLeft: 4, fontWeight: 700 }}>100 điểm / voucher</Tag>
                    </span>
                }
                style={{ marginBottom: 24 }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    {VOUCHER_OPTIONS.map((opt) => {
                        const canRedeem = totalPoints >= opt.pointsCost;
                        return (
                            <div
                                key={opt.type}
                                style={{
                                    background: canRedeem ? `linear-gradient(135deg, ${opt.bgFrom} 0%, ${opt.bgTo} 100%)` : '#f8fafc',
                                    border: `2px solid ${canRedeem ? opt.border : '#e2e8f0'}`,
                                    borderRadius: 18,
                                    padding: '22px 24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                    boxShadow: canRedeem ? `0 4px 16px ${opt.border}28` : 'none',
                                    transition: 'transform 0.2s',
                                }}
                            >
                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: canRedeem ? opt.color : '#94a3b8' }}>
                                    {opt.label}
                                </div>
                                <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>{opt.description}</div>
                                <div style={{ height: 1, background: canRedeem ? `${opt.border}40` : '#e2e8f0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <Tag color={canRedeem ? 'purple' : 'default'} style={{ fontWeight: 700, fontSize: '0.9rem', borderRadius: 8 }}>
                                            🪙 {opt.pointsCost} điểm
                                        </Tag>
                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>Hiệu lực 30 ngày</div>
                                    </div>
                                    <Button
                                        type={canRedeem ? 'primary' : 'default'}
                                        size="middle"
                                        disabled={!canRedeem || !!redeemingVoucher}
                                        loading={redeemingVoucher === opt.type}
                                        onClick={() => handleRedeemVoucher(opt.type)}
                                        style={{
                                            borderRadius: 999,
                                            fontWeight: 700,
                                            background: canRedeem ? opt.color : undefined,
                                            borderColor: canRedeem ? opt.color : undefined,
                                            minWidth: 120,
                                        }}
                                    >
                                        {canRedeem ? 'Đổi ngay' : 'Chưa đủ điểm'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* My Vouchers */}
            <Card
                className="content-card"
                bordered={false}
                title={
                    <span style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <GiftOutlined style={{ color: '#0284c7' }} /> Voucher của tôi
                    </span>
                }
                style={{ marginBottom: 24 }}
            >
                {vouchersLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spin size="large" /></div>
                ) : (
                    <Table
                        dataSource={myVouchers}
                        columns={[
                            {
                                title: 'Mã voucher',
                                dataIndex: 'code',
                                key: 'code',
                                render: (code) => (
                                    <code style={{ background: 'linear-gradient(135deg, #f1f5f9, #e0e7ff)', padding: '4px 12px', borderRadius: 8, fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.08em', border: '1px solid #c7d2fe', color: '#4338ca' }}>
                                        {code}
                                    </code>
                                ),
                            },
                            {
                                title: 'Mô tả',
                                dataIndex: 'description',
                                key: 'description',
                                render: (desc) => <span style={{ fontSize: '0.88rem', color: '#475569' }}>{desc}</span>,
                            },
                            {
                                title: 'Trạng thái',
                                dataIndex: 'isUsed',
                                key: 'status',
                                align: 'center',
                                width: 130,
                                render: (isUsed, record) => {
                                    if (isUsed) return <Tag color="default" style={{ borderRadius: 8 }}>Đã dùng</Tag>;
                                    if (record.isExpired) return <Tag color="red" style={{ borderRadius: 8 }}>Hết hạn</Tag>;
                                    return <Tag color="green" style={{ borderRadius: 8, fontWeight: 700 }}>Còn hiệu lực</Tag>;
                                },
                            },
                            {
                                title: 'Hết hạn',
                                dataIndex: 'expiresAt',
                                key: 'expiresAt',
                                align: 'right',
                                width: 140,
                                render: (date) => date ? <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(date).toLocaleDateString('vi-VN')}</span> : '---',
                            },
                        ]}
                        rowKey={(record) => record._id || record.code}
                        pagination={{ pageSize: 6, size: 'small' }}
                        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bạn chưa có voucher nào. Tích đủ 100 điểm để đổi!" /> }}
                    />
                )}
            </Card>

            {/* Points History */}
            <Card
                className="content-card"
                bordered={false}
                title={
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                        <StarOutlined style={{ marginRight: 8, color: '#f59e0b' }} />
                        Lịch sử tích lũy và sử dụng điểm
                    </span>
                }
            >
                {rewardsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spin size="large" /></div>
                ) : (
                    <Table
                        dataSource={rewardsData.history || []}
                        columns={[
                            {
                                title: 'Lý do giao dịch',
                                dataIndex: 'reason',
                                key: 'reason',
                                render: (text) => <span style={{ fontSize: '0.9rem' }}>{text}</span>,
                            },
                            {
                                title: 'Điểm',
                                dataIndex: 'points',
                                key: 'points',
                                align: 'center',
                                width: 100,
                                render: (points) => {
                                    const isPos = points > 0;
                                    return (
                                        <Tag color={isPos ? 'green' : 'volcano'} style={{ fontWeight: 800, borderRadius: 8, minWidth: 60, textAlign: 'center' }}>
                                            {isPos ? `+${points}` : points}
                                        </Tag>
                                    );
                                },
                            },
                            {
                                title: 'Thời gian',
                                dataIndex: 'createdAt',
                                key: 'createdAt',
                                align: 'right',
                                width: 170,
                                render: (date) => <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(date).toLocaleString('vi-VN')}</span>,
                            },
                        ]}
                        rowKey={(record) => record._id || record.createdAt}
                        pagination={{ pageSize: 8, size: 'small' }}
                        locale={{
                            emptyText: (
                                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                                    <TrophyFilled style={{ fontSize: 40, color: '#e2e8f0', marginBottom: 12, display: 'block' }} />
                                    <div style={{ color: '#94a3b8' }}>Chưa có lịch sử tích điểm.</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>Hãy mua hàng và đánh giá sản phẩm để bắt đầu tích lũy!</div>
                                    <Button type="primary" size="small" icon={<ShoppingOutlined />} style={{ marginTop: 16, borderRadius: 999 }} onClick={() => navigate('/products')}>
                                        Xem sản phẩm
                                    </Button>
                                </div>
                            ),
                        }}
                    />
                )}
            </Card>
        </div>
    );
};

export default RewardsPage;
