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
                        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '700' }}>Profile</h1>
                        <p style={{ margin: 0, color: '#64748b' }}>Manage your account information</p>
                    </div>
                </div>
            </div>

            <Row gutter={[20, 20]}>
                <Col xs={24} md={12}>
                    <Card 
                        title={
                            <span style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <IdcardOutlined /> Personal information
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
                                    <UserOutlined /> Full name
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
                                    <IdcardOutlined /> Role
                                </span>
                                <Tag color="blue">{user.role || 'Member'}</Tag>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card 
                        title={
                            <span style={{ fontSize: '16px', fontWeight: '700' }}>Quick actions</span>
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
                                Back to home
                            </Button>
                            <Button 
                                size="large" 
                                icon={<ShoppingOutlined />}
                                onClick={() => navigate('/products')}
                                block
                            >
                                Browse products
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePage;
