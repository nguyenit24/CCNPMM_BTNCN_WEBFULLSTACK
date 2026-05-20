import React, { useMemo, useState } from 'react';
import { Button, Form, Input, notification, Space } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { requestForgotPasswordOtpApi, resetPasswordWithOtpApi } from '../util/api';
import AuthLayout from '../components/auth/auth-layout';

const ForgotPasswordPage = () => {
    const [form] = Form.useForm();
    const [step, setStep] = useState(1);
    const [pendingEmail, setPendingEmail] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [resetting, setResetting] = useState(false);

    const stepLabel = useMemo(() => (step === 1 ? 'Enter your email to receive an OTP' : 'Enter OTP and new password'), [step]);

    const handleRequestOtp = async (values) => {
        setSendingOtp(true);
        const res = await requestForgotPasswordOtpApi({ email: values.email });
        setSendingOtp(false);

        if (res && res.EC === 0) {
            setPendingEmail(values.email);
            setStep(2);
            notification.success({
                message: 'OTP sent',
                description: 'Please check your OTP to continue.',
            });
            return;
        }

        notification.error({
            message: 'Unable to send OTP',
            description: res?.EM ?? 'error',
        });
    };

    const handleResetPassword = async (values) => {
        if (!pendingEmail) {
            notification.error({
                message: 'Missing email',
                description: 'Please go back to the first step.',
            });
            setStep(1);
            return;
        }

        if (values.password !== values.confirmPassword) {
            notification.error({
                message: 'Passwords do not match',
                description: 'Please check your new password again.',
            });
            return;
        }

        setResetting(true);
        const res = await resetPasswordWithOtpApi({
            email: pendingEmail,
            otp: values.otp,
            password: values.password,
        });
        setResetting(false);

        if (res && res.EC === 0) {
            notification.success({
                message: 'Password reset successful',
                description: 'You can now sign in with your new password.',
            });
            form.resetFields();
            setPendingEmail('');
            setStep(1);
            return;
        }

        notification.error({
            message: 'Unable to reset password',
            description: res?.EM ?? 'error',
        });
    };

    const onFinish = async (values) => {
        if (step === 1) {
            await handleRequestOtp(values);
            return;
        }

        await handleResetPassword(values);
    };

    const resendOtp = async () => {
        if (!pendingEmail) {
            return;
        }
        await handleRequestOtp({ email: pendingEmail });
    };

    return (
        <AuthLayout
            title="Forgot password"
            description={stepLabel}
            footer={(
                <Space direction="vertical" size={10} className="auth-card__footer-block">
                    <div className="auth-card__links auth-card__links--single">
                        <Link to="/login">
                            <ArrowLeftOutlined /> Back to sign in
                        </Link>
                        <Link to="/register">Create new account</Link>
                    </div>
                    <div className="auth-card__footer" style={{ textAlign: 'center' }}>
                        Remembered your password? <Link to="/login">Sign in now</Link>
                    </div>
                </Space>
            )}
        >
            <Form form={form} name="forgot-password-form" onFinish={onFinish} autoComplete="off" layout="vertical" size="large">
                {step === 1 ? (
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please enter your email' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="your@email.com" />
                    </Form.Item>
                ) : (
                    <>
                        <Form.Item
                            label="Verification OTP"
                            name="otp"
                            rules={[{ required: true, message: 'Please enter the OTP' }]}
                        >
                            <Input.OTP length={6} />
                        </Form.Item>

                        <Form.Item
                            label="New password"
                            name="password"
                            rules={[{ required: true, message: 'Please enter your new password' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Enter your new password" />
                        </Form.Item>

                        <Form.Item
                            label="Confirm password"
                            name="confirmPassword"
                            rules={[{ required: true, message: 'Please confirm your password' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Re-enter your new password" />
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
                    <Button type="primary" htmlType="submit" block className="auth-gradient-btn" loading={sendingOtp || resetting}>
                        {step === 1 ? 'Send OTP' : 'Reset password'}
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
