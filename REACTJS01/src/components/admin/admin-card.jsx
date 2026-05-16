import { Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const AdminCard = ({ title, onReload, onCreate, children }) => (
    <div className="store-card admin-card">
        <div className="admin-toolbar">
            <h2 className="admin-toolbar__title">{title}</h2>
            <Space>
                {onReload ? (
                    <Button icon={<ReloadOutlined />} onClick={onReload} className="admin-toolbar__reload">
                        Reload
                    </Button>
                ) : null}
                {onCreate ? (
                    <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} className="admin-toolbar__create">
                        New
                    </Button>
                ) : null}
            </Space>
        </div>
        {children}
    </div>
);

export default AdminCard;
