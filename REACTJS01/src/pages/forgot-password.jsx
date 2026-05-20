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

    const stepLabel = useMemo(() => (step === 1 ? 'Nhập email để nhận mã OTP khôi phục' : 'Nhập mã OTP và thiết lập mật khẩu mới'), [step]);

    const handleRequestOtp = async (values) => {
        setSendingOtp(true);
        const res = await requestForgotPasswordOtpApi({ email: values.email });
        setSendingOtp(false);

        if (res && res.EC === 0) {
            setPendingEmail(values.email);
            setStep(2);
            notification.success({
                message: 'Đã gửi mã OTP',
                description: 'Vui lòng kiểm tra email của bạn để nhận mã khôi phục mật khẩu.',
            });
            return;
        }

        notification.error({
            message: 'Không thể gửi mã OTP',
            description: res?.EM ?? 'Đã xảy ra lỗi khi gửi mã OTP!',
        });
    };

    const handleResetPassword = async (values) => {
        if (!pendingEmail) {
            notification.error({
                message: 'Thiếu thông tin email',
                description: 'Vui lòng quay lại bước đầu tiên.',
            });
            setStep(1);
            return;
        }

        if (values.password !== values.confirmPassword) {
            notification.error({
                message: 'Mật khẩu không khớp',
                description: 'Mật khẩu xác nhận phải trùng khớp với mật khẩu mới.',
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
                message: 'Đặt lại mật khẩu thành công',
                description: 'Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập bằng mật khẩu mới.',
            });
            form.resetFields();
            setPendingEmail('');
            setStep(1);
            return;
        }

        notification.error({
            message: 'Đặt lại mật khẩu thất bại',
            description: res?.EM ?? 'Mã OTP không chính xác hoặc đã hết hạn!',
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
            title="Quên mật khẩu"
            description={stepLabel}
            footer={(
                <Space direction="vertical" size={10} className="auth-card__footer-block">
                    <div className="auth-card__links auth-card__links--single">
                        <Link to="/login">
                            <ArrowLeftOutlined /> Quay lại đăng nhập
                        </Link>
                        <Link to="/register">Tạo tài khoản mới</Link>
                    </div>
                    <div className="auth-card__footer" style={{ textAlign: 'center' }}>
                        Đã nhớ mật khẩu? <Link to="/login">Đăng nhập ngay</Link>
                    </div>
                </Space>
            )}
        >
            <Form form={form} name="forgot-password-form" onFinish={onFinish} autoComplete="off" layout="vertical" size="large">
                {step === 1 ? (
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ email!' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="your@email.com" />
                    </Form.Item>
                ) : (
                    <>
                        <Form.Item
                            label="Mã xác thực OTP"
                            name="otp"
                            rules={[{ required: true, message: 'Vui lòng nhập mã OTP đã nhận!' }]}
                        >
                            <Input.OTP length={6} />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới của bạn" />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            rules={[{ required: true, message: 'Vui lòng xác nhận lại mật khẩu!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
                        </Form.Item>

                        <div className="auth-inline-actions">
                            <Button onClick={resendOtp} loading={sendingOtp}>
                                Gửi lại OTP
                            </Button>
                            <Button onClick={() => setStep(1)}>
                                Quay lại
                            </Button>
                        </div>
                    </>
                )}

                <Form.Item className="auth-form__submit">
                    <Button type="primary" htmlType="submit" block className="auth-gradient-btn" loading={sendingOtp || resetting}>
                        {step === 1 ? 'Gửi mã OTP' : 'Đặt lại mật khẩu'}
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
