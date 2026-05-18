import React, { useContext } from 'react';
import { Button, Form, Input, notification, Space } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { ArrowLeftOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import AuthLayout from '../components/auth/auth-layout';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const { email, password } = values;
        const res = await loginApi(email, password);

        if (res && res.EC === 0) {
            localStorage.setItem('access_token', res.access_token);

            notification.success({
                message: 'Login successful',
                description: 'Welcome back to TechStudio',
            });

            setAuth({
                isAuthenticated: true,
                user: {
                    email: res?.user?.email ?? '',
                    name: res?.user?.name ?? '',
                    role: res?.user?.role ?? 'Member',
                },
            });

            navigate('/');
        } else {
            notification.error({
                message: 'Login failed',
                description: res?.EM ?? 'error',
            });
        }
    };

    return (
        <AuthLayout
            title="Login"
            footer={(
                <Space direction="vertical" size={10} className="auth-card__footer-block">
                    <div className="auth-card__links auth-card__links--single">
                        <Link to="/">
                            <ArrowLeftOutlined /> Back to home
                        </Link>
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>
                    <div className="auth-card__footer" style={{ textAlign: 'center' }}>
                        No account yet? <Link to="/register">Register now</Link>
                    </div>
                </Space>
            )}
        >
            <div className="auth-card__head">
                <h2 className="auth-card__title">Sign in to your account</h2>
            </div>

            <Form form={form} name="login-form" onFinish={onFinish} autoComplete="off" layout="vertical" size="large">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please enter your email' }]}
                >
                    <Input prefix={<MailOutlined />} placeholder="your@email.com" />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
                </Form.Item>

                <Form.Item className="auth-form__submit">
                    <Button type="primary" htmlType="submit" block className="auth-gradient-btn">
                        Sign in
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default LoginPage;