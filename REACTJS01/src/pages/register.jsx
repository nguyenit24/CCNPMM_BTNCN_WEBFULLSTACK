import React, { useMemo, useState } from 'react';
import { Button, Form, Input, notification, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import {
    requestRegisterOtpApi,
    verifyRegisterOtpApi,
} from '../util/api';
import AuthLayout from '../components/auth/auth-layout';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [step, setStep] = useState(1);
    const [pendingRegister, setPendingRegister] = useState(null);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    const stepLabel = useMemo(() => (step === 1 ? 'Step 1: account information' : 'Step 2: OTP verification'), [step]);

    const handleSendOtp = async (values) => {
        setSendingOtp(true);
        const res = await requestRegisterOtpApi(values);
        setSendingOtp(false);

        if (res && res.EC === 0) {
            setPendingRegister(values);
            setStep(2);
            notification.success({
                message: 'Registration OTP sent',
                description: 'Please check your OTP to continue.',
            });
            return;
        }

        notification.error({
            message: 'Unable to send OTP',
            description: res?.EM ?? 'error',
        });
    };

    const handleVerifyOtp = async (values) => {
        if (!pendingRegister) {
            notification.error({
                message: 'Missing registration data',
                description: 'Please go back to the first step.',
            });
            setStep(1);
            return;
        }

        setVerifyingOtp(true);
        const res = await verifyRegisterOtpApi({
            ...pendingRegister,
            otp: values.otp,
        });
        setVerifyingOtp(false);

        if (res && res.EC === 0) {
            notification.success({
                message: 'Registration successful',
                description: 'Your account has been created, please sign in.',
            });
            form.resetFields();
            setPendingRegister(null);
            setStep(1);
            navigate('/login');
            return;
        }

        notification.error({
            message: 'OTP verification failed',
            description: res?.EM ?? 'error',
        });
    };

    const onFinish = async (values) => {
        if (step === 1) {
            await handleSendOtp(values);
            return;
        }

        await handleVerifyOtp(values);
    };

    const resendOtp = async () => {
        if (!pendingRegister) {
            return;
        }
        await handleSendOtp(pendingRegister);
    };

    return (
        <AuthLayout
            title="Register"
            description={stepLabel}
            footer={(
                <Space direction="vertical" size={10} className="auth-card__footer-block">
                    <div className="auth-card__links auth-card__links--single">
                        <Link to="/">
                            <ArrowLeftOutlined /> Back to home
                        </Link>
                        <Link to="/login">Login</Link>
                    </div>
                    <div className="auth-card__footer" style={{ textAlign: 'center' }}>
                        Already have an account? <Link to="/login">Sign in now</Link>
                    </div>
                </Space>
            )}
        >
            <Form form={form} name="register-form" onFinish={onFinish} autoComplete="off" layout="vertical" size="large">
                {step === 1 ? (
                    <>
                        <Form.Item
                            label="Full name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter your full name' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="John Doe" />
                        </Form.Item>

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
                            <Input.Password prefix={<LockOutlined />} placeholder="Create a password" />
                        </Form.Item>
                    </>
                ) : (
                    <>
                        <Form.Item
                            label="Verification OTP"
                            name="otp"
                            rules={[{ required: true, message: 'Please enter the OTP' }]}
                        >
                            <Input.OTP length={6} />
                        </Form.Item>

                        <div className="auth-inline-actions">
                            <Button onClick={resendOtp} loading={sendingOtp}>
                                Resend OTP
                            </Button>
                            <Button onClick={() => setStep(1)}>
                                Back
                            </Button>
                        </div>
                    </>
                )}

                <Form.Item className="auth-form__submit">
                    <Button type="primary" htmlType="submit" block className="auth-gradient-btn" loading={sendingOtp || verifyingOtp}>
                        {step === 1 ? 'Send OTP' : 'Verify and register'}
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default RegisterPage;