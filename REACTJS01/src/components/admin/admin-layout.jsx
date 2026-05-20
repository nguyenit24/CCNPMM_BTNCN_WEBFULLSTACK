import { useMemo } from 'react';
import { Avatar, Button, Card, Layout, Menu, Space, Tag } from 'antd';
import {
    AppstoreOutlined,
    BarChartOutlined,
    CarryOutOutlined,
    DashboardOutlined,
    FileTextOutlined,
    ReloadOutlined,
    ShoppingOutlined,
    TeamOutlined,
} from '@ant-design/icons';

const adminMenuItems = [
    { key: 'overview', icon: <DashboardOutlined />, label: 'Overview' },
    { key: 'users', icon: <TeamOutlined />, label: 'Users' },
    { key: 'categories', icon: <AppstoreOutlined />, label: 'Categories' },
    { key: 'promotions', icon: <BarChartOutlined />, label: 'Promotions' },
    { key: 'products', icon: <ShoppingOutlined />, label: 'Products' },
    { key: 'orders', icon: <CarryOutOutlined />, label: 'Orders' },
    { key: 'posts', icon: <FileTextOutlined />, label: 'Posts' },
];

const AdminLayout = ({
    auth,
    activeSection,
    onSectionChange,
    onRefresh,
    onLogout,
    refreshing,
    title,
    description,
    children,
}) => {
    const avatarLetter = useMemo(() => String(auth?.user?.name || 'A').trim().charAt(0).toUpperCase(), [auth]);

    return (
        <Layout className="admin-shell">
            <Layout.Sider className="admin-sider" width={280} breakpoint="lg" collapsedWidth={0}>
                <div className="admin-brand">
                    <div className="admin-brand__mark">T</div>
                    <div className="admin-brand__text">
                        <span className="admin-brand__title">TechStudio</span>
                        <span className="admin-brand__subtitle">Admin Console</span>
                    </div>
                </div>

                <Card className="admin-user-card" bordered={false}>
                    <Space align="start" size={14}>
                        <Avatar className="admin-user-card__avatar" size={44}>
                            {avatarLetter}
                        </Avatar>
                        <div className="admin-user-card__meta">
                            <strong>{auth?.user?.name || 'Admin'}</strong>
                            <span>{auth?.user?.email || 'admin@techstudio.local'}</span>
                            <Tag color="blue">{auth?.user?.role || 'Admin'}</Tag>
                        </div>
                    </Space>
                </Card>

                        <Button type="primary" icon={<ReloadOutlined />} block onClick={onRefresh} loading={refreshing}>
                    Refresh dashboard
                </Button>

                <Menu
                    className="admin-menu"
                    mode="inline"
                    selectedKeys={[activeSection]}
                    items={adminMenuItems}
                    onClick={({ key }) => onSectionChange(key)}
                />

                <div className="admin-sider__footer">
                    <div className="admin-sider__footer-meta">
                        <span>Signed in</span>
                        <strong>{auth?.user?.role || 'Admin'}</strong>
                    </div>
                    <Button danger block onClick={onLogout} className="admin-sider__logout">
                        Logout
                    </Button>
                </div>
            </Layout.Sider>

            <Layout className="admin-main">
                <div className="admin-topbar">
                    <div>
                        <p className="admin-topbar__eyebrow">Admin Dashboard</p>
                        <h1 className="admin-topbar__title">{title}</h1>
                        <p className="admin-topbar__subtitle">{description}</p>
                    </div>

                    <Space wrap>
                        <Button onClick={onRefresh} loading={refreshing}>
                            Reload metrics
                        </Button>
                        <Button type="primary" onClick={() => onSectionChange('overview')}>
                            Overview
                        </Button>
                    </Space>
                </div>

                {children}
            </Layout>
        </Layout>
    );
};

export { adminMenuItems };
export default AdminLayout;
