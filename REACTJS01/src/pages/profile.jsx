import { useContext } from 'react';
import { Button, Card, Tag, Divider, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { UserOutlined, MailOutlined, IdcardOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const user = auth?.user || {};
    const initials = (user.name || 'M').trim().charAt(0).toUpperCase();

    return (
        <div className="store-layout">
            <div style={{ marginBottom: '32px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        fontSize: '24px',
                        fontWeight: '800'
                    }}>
                        {initials}
                    </div>
                    <div>
                        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '700' }}>Hồ sơ cá nhân</h1>
                        <p style={{ margin: 0, color: '#64748b' }}>Quản lý thông tin tài khoản của bạn</p>
                    </div>
                </div>
            </div>

            <Row gutter={[20, 20]}>
                <Col xs={24} md={12}>
                    <Card 
                        title={
                            <span style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <IdcardOutlined /> Thông tin cá nhân
                            </span>
                        }
                        bordered={false}
                        style={{
                            borderRadius: '20px',
                            border: '1px solid rgba(15, 23, 42, 0.08)',
                            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)'
                        }}
                    >
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                    <UserOutlined /> Họ tên
                                </span>
                                <strong>{user.name || '---'}</strong>
                            </div>
                            <Divider style={{ margin: 0 }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                    <MailOutlined /> Email
                                </span>
                                <strong>{user.email || '---'}</strong>
                            </div>
                            <Divider style={{ margin: 0 }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                    <IdcardOutlined /> Vai trò
                                </span>
                                <Tag color="blue">{user.role || 'Member'}</Tag>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card 
                        title={
                            <span style={{ fontSize: '16px', fontWeight: '700' }}>Thao tác nhanh</span>
                        }
                        bordered={false}
                        style={{
                            borderRadius: '20px',
                            border: '1px solid rgba(15, 23, 42, 0.08)',
                            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)'
                        }}
                    >
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={<HomeOutlined />}
                                onClick={() => navigate('/')}
                                block
                            >
                                Về trang chủ
                            </Button>
                            <Button 
                                size="large" 
                                icon={<ShoppingOutlined />}
                                onClick={() => navigate('/products')}
                                block
                            >
                                Xem sản phẩm
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePage;
