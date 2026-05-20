import { Card, Statistic, Button, Space, Divider, Row, Col, Tooltip } from 'antd';
import {
    AppstoreOutlined,
    BarChartOutlined,
    CarryOutOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    TeamOutlined,
    GiftOutlined,
    RocketOutlined,
    ArrowRightOutlined,
    DashboardOutlined,
} from '@ant-design/icons';

const AdminMetricCard = ({ label, value, helper, icon, gradient, loading }) => (
    <Card 
        className="admin-metric-card premium-glass-card" 
        bordered={false}
        style={{
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            position: 'relative'
        }}
    >
        {/* Subtle background glow */}
        <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: 100,
            height: 100,
            background: gradient,
            filter: 'blur(30px)',
            opacity: 0.15,
            borderRadius: '50%'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--store-muted)' }}>{label}</span>
            <div 
                className="admin-metric-card__icon" 
                style={{ 
                    background: gradient, 
                    color: '#fff',
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.06)'
                }}
            >
                {icon}
            </div>
        </div>

        <Statistic 
            value={value} 
            loading={loading} 
            valueStyle={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--store-text)', letterSpacing: '-0.5px' }}
        />
        
        <Divider style={{ margin: '12px 0 8px 0', opacity: 0.5 }} />
        
        <p className="admin-metric-card__helper" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--store-muted)' }}>
            {helper}
        </p>
    </Card>
);

const AdminOverview = ({ stats, loading, onOpenSection }) => (
    <div className="admin-overview" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Metric Widgets Section */}
        <div className="admin-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <AdminMetricCard
                label="Thành viên"
                value={stats.users}
                helper="Tài khoản người dùng đăng ký hệ thống"
                icon={<TeamOutlined />}
                gradient="linear-gradient(135deg, #3b82f6, #06b6d4)"
                loading={loading}
            />
            <AdminMetricCard
                label="Danh mục"
                value={stats.categories}
                helper="Quản lý phân loại & ngành hàng kinh doanh"
                icon={<AppstoreOutlined />}
                gradient="linear-gradient(135deg, #10b981, #059669)"
                loading={loading}
            />
            <AdminMetricCard
                label="Khuyến mãi"
                value={stats.promotions}
                helper="Chương trình ưu đãi & banner trang chủ"
                icon={<GiftOutlined />}
                gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
                loading={loading}
            />
            <AdminMetricCard
                label="Sản phẩm"
                value={stats.products}
                helper="Tổng số sản phẩm có sẵn trong danh mục"
                icon={<ShoppingOutlined />}
                gradient="linear-gradient(135deg, #8b5cf6, #ec4899)"
                loading={loading}
            />
            <AdminMetricCard
                label="Đơn hàng"
                value={stats.orders}
                helper="Đơn hàng giao nhận đang chờ xử lý"
                icon={<CarryOutOutlined />}
                gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
                loading={loading}
            />
            <AdminMetricCard
                label="Bài viết"
                value={stats.posts}
                helper="Bài đăng tin tức & cẩm nang mua sắm"
                icon={<FileTextOutlined />}
                gradient="linear-gradient(135deg, #22c55e, #10b981)"
                loading={loading}
            />
        </div>

        {/* Quick action panel with card */}
        <Card 
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem', fontWeight: 700 }}>
                    <DashboardOutlined style={{ color: 'var(--store-primary)' }} />
                    <span>Lối tắt quản trị nhanh</span>
                </div>
            }
            style={{ borderRadius: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
            bodyStyle={{ padding: 24 }}
        >
            <div 
                className="admin-shortcuts" 
                style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: 16 
                }}
            >
                <Button 
                    onClick={() => onOpenSection('users')}
                    icon={<TeamOutlined />}
                    size="large"
                    style={{ height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <span>Quản lý Thành viên</span>
                    <ArrowRightOutlined style={{ color: 'var(--store-primary)' }} />
                </Button>
                <Button 
                    onClick={() => onOpenSection('categories')}
                    icon={<AppstoreOutlined />}
                    size="large"
                    style={{ height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <span>Quản lý Danh mục</span>
                    <ArrowRightOutlined style={{ color: 'var(--store-primary)' }} />
                </Button>
                <Button 
                    onClick={() => onOpenSection('promotions')}
                    icon={<GiftOutlined />}
                    size="large"
                    style={{ height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <span>Chương trình Khuyến mãi</span>
                    <ArrowRightOutlined style={{ color: 'var(--store-primary)' }} />
                </Button>
                <Button 
                    onClick={() => onOpenSection('products')}
                    icon={<ShoppingOutlined />}
                    size="large"
                    style={{ height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <span>Quản lý Sản phẩm</span>
                    <ArrowRightOutlined style={{ color: 'var(--store-primary)' }} />
                </Button>
                <Button 
                    onClick={() => onOpenSection('orders')}
                    icon={<CarryOutOutlined />}
                    size="large"
                    style={{ height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <span>Quản lý Đơn hàng</span>
                    <ArrowRightOutlined style={{ color: 'var(--store-primary)' }} />
                </Button>
                <Button 
                    onClick={() => onOpenSection('posts')}
                    icon={<FileTextOutlined />}
                    size="large"
                    style={{ height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <span>Quản lý Bài viết</span>
                    <ArrowRightOutlined style={{ color: 'var(--store-primary)' }} />
                </Button>
            </div>
        </Card>
    </div>
);

export default AdminOverview;
