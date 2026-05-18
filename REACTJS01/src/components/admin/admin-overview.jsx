import { Card, Statistic, Button, Space } from 'antd';
import {
    AppstoreOutlined,
    BarChartOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    TeamOutlined,
} from '@ant-design/icons';

const AdminMetricCard = ({ label, value, helper, icon, color, loading }) => (
    <Card className="admin-metric-card" bordered={false}>
        <div className="admin-metric-card__icon" style={{ background: color }}>
            {icon}
        </div>
        <Statistic title={label} value={value} loading={loading} />
        <p className="admin-metric-card__helper">{helper}</p>
    </Card>
);

const AdminOverview = ({ stats, loading, onOpenSection }) => (
    <div className="admin-overview">
        <div className="admin-metrics-grid">
            <AdminMetricCard
                label="Users"
                value={stats.users}
                helper="User accounts from the /user API"
                icon={<TeamOutlined />}
                color="linear-gradient(135deg, #2563eb, #38bdf8)"
                loading={loading}
            />
            <AdminMetricCard
                label="Categories"
                value={stats.categories}
                helper="Taxonomy management"
                icon={<AppstoreOutlined />}
                color="linear-gradient(135deg, #0f766e, #34d399)"
                loading={loading}
            />
            <AdminMetricCard
                label="Promotions"
                value={stats.promotions}
                helper="Active homepage banners"
                icon={<BarChartOutlined />}
                color="linear-gradient(135deg, #ea580c, #f59e0b)"
                loading={loading}
            />
            <AdminMetricCard
                label="Products"
                value={stats.products}
                helper="Total catalog products"
                icon={<ShoppingOutlined />}
                color="linear-gradient(135deg, #7c3aed, #a78bfa)"
                loading={loading}
            />
            <AdminMetricCard
                label="Posts"
                value={stats.posts}
                helper="News and advice articles"
                icon={<FileTextOutlined />}
                color="linear-gradient(135deg, #14b8a6, #22c55e)"
                loading={loading}
            />
        </div>

        <div className="admin-overview__grid">
            <Card className="admin-overview__panel" bordered={false} title="Quick actions">
                <div className="admin-shortcuts">
                    <Button onClick={() => onOpenSection('users')}>Users</Button>
                    <Button onClick={() => onOpenSection('categories')}>Categories</Button>
                    <Button onClick={() => onOpenSection('promotions')}>Promotions</Button>
                    <Button onClick={() => onOpenSection('products')}>Products</Button>
                    <Button onClick={() => onOpenSection('posts')}>Posts</Button>
                </div>
            </Card>
        </div>
    </div>
);

export default AdminOverview;
