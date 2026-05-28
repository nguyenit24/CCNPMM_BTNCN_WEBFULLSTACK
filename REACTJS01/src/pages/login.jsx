import React, { useContext, useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { notification } from 'antd';
import BootstrapAuthLayout from '../components/auth/bootstrap-auth-layout';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(true);
        setLoading(true);

        try {
            const res = await loginApi(email, password);

            if (res && res.EC === 0) {
                localStorage.setItem('access_token', res.access_token);
                if (res.refresh_token) {
                    localStorage.setItem('refresh_token', res.refresh_token);
                }

                notification.success({
                    message: 'Sign In Successful',
                    description: 'Welcome back to TechStudio Premium',
                });

                setAuth({
                    isAuthenticated: true,
                    user: {
                        id: res?.user?.id ?? res?.user?._id ?? '',
                        email: res?.user?.email ?? '',
                        name: res?.user?.name ?? '',
                        role: res?.user?.role ?? 'Member',
                        addresses: Array.isArray(res?.user?.addresses) ? res.user.addresses : [],
                        defaultAddress: res?.user?.defaultAddress || null,
                    },
                });

                const role = String(res?.user?.role || '').toLowerCase();
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'staff') {
                    navigate('/staff');
                } else {
                    navigate('/');
                }
            } else {
                notification.error({
                    message: 'Sign In Failed',
                    description: res?.EM ?? 'Incorrect email or password!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Sign In Failed',
                description: 'Server connection error occurred.',
            });
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="bootstrap-auth-links">
                <Link to="/">
                    ← Back to Home
                </Link>
                <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <div className="text-center mt-3" style={{ fontSize: '0.85rem' }}>
                Don't have an account? <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600 }}>Register now</Link>
            </div>
        </div>
    );

    return (
        <BootstrapAuthLayout
            title="Sign In"
            description="Sign in to access your premium technology experience"
            footer={footer}
        >
            <Form noValidate validated={validated} onSubmit={handleSubmit} className="bootstrap-auth-form">
                <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                        required
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">
                        Please enter a valid email address!
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="loginPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        required
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">
                        Please enter your password!
                    </Form.Control.Feedback>
                </Form.Group>

                <Button type="submit" className="bootstrap-auth-btn w-100" disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                            Signing In...
                        </>
                    ) : 'Sign In'}
                </Button>
            </Form>
        </BootstrapAuthLayout>
    );
};

export default LoginPage;