import { useMemo } from 'react';
import { Avatar, Button, Card, Layout, Menu, Space, Tag } from 'antd';
import {
    CarryOutOutlined,
    DashboardOutlined,
    ReloadOutlined,
    UserOutlined,
} from '@ant-design/icons';

const staffMenuItems = [
    { key: 'overview', icon: <DashboardOutlined />, label: 'Overview' },
    { key: 'profile', icon: <UserOutlined />, label: 'My Profile' },
    { key: 'orders', icon: <CarryOutOutlined />, label: 'Orders' },
];

const StaffLayout = ({
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
                        <span className="admin-brand__subtitle">Staff Console</span>
                    </div>
                </div>

                <Card className="admin-user-card" bordered={false}>
                    <Space align="start" size={14}>
                        <Avatar className="admin-user-card__avatar" size={44}>
                            {avatarLetter}
                        </Avatar>
                        <div className="admin-user-card__meta">
                            <strong>{auth?.user?.name || 'Staff'}</strong>
                            <span>{auth?.user?.email || 'staff@techstudio.local'}</span>
                            <Tag color="orange">Staff member</Tag>
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
                    items={staffMenuItems}
                    onClick={({ key }) => onSectionChange(key)}
                />

                <div className="admin-sider__footer">
                    <div className="admin-sider__footer-meta">
                        <span>Signed in</span>
                        <strong>{auth?.user?.role || 'Staff'}</strong>
                    </div>
                    <Button danger block onClick={onLogout} className="admin-sider__logout">
                        Logout
                    </Button>
                </div>
            </Layout.Sider>

            <Layout className="admin-main">
                <div className="admin-topbar">
                    <div>
                        <p className="admin-topbar__eyebrow">Staff Dashboard</p>
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

export { staffMenuItems };
export default StaffLayout;
