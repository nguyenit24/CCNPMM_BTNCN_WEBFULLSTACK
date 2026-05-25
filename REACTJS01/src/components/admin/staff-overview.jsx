import React from 'react';
import { Card, Button } from 'antd';
import {
    CarryOutOutlined,
    UserOutlined,
    ArrowRightOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
import AdminMetricCard from './admin-metric-card';

const StaffOverview = ({ stats, loading, onOpenSection }) => (
    <div className="admin-overview" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Metric Widgets Section */}
        <div className="admin-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <AdminMetricCard
                label="Đơn hàng"
                value={stats.orders}
                helper="Đơn hàng giao nhận đang chờ xử lý"
                icon={<CarryOutOutlined />}
                gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
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
                    onClick={() => onOpenSection('orders')}
                    icon={<CarryOutOutlined />}
                    size="large"
                    style={{ height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <span>Quản lý Đơn hàng</span>
                    <ArrowRightOutlined style={{ color: 'var(--store-primary)' }} />
                </Button>
                <Button 
                    onClick={() => onOpenSection('profile')}
                    icon={<UserOutlined />}
                    size="large"
                    style={{ height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <span>Thông tin cá nhân</span>
                    <ArrowRightOutlined style={{ color: 'var(--store-primary)' }} />
                </Button>
            </div>
        </Card>
    </div>
);

export default StaffOverview;
