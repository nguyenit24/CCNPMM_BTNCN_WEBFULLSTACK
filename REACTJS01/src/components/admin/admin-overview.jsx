import React from 'react';
import { Card, Button } from 'antd';
import {
    AppstoreOutlined,
    CarryOutOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    TeamOutlined,
    GiftOutlined,
    ArrowRightOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
import AdminMetricCard from './admin-metric-card';

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
