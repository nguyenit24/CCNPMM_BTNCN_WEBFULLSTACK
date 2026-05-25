import React, { useMemo, useState } from 'react';
import { Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { requestForgotPasswordOtpApi, resetPasswordWithOtpApi } from '../util/api';
import { notification } from 'antd';
import BootstrapAuthLayout from '../components/auth/bootstrap-auth-layout';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [validated, setValidated] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [resetting, setResetting] = useState(false);

    const stepLabel = useMemo(() => (step === 1 ? 'Nhập email để nhận mã OTP khôi phục' : 'Nhập mã OTP và thiết lập mật khẩu mới'), [step]);

    const handleRequestOtp = async (emailAddress) => {
        setSendingOtp(true);
        try {
            const res = await requestForgotPasswordOtpApi({ email: emailAddress });
            if (res && res.EC === 0) {
                setPendingEmail(emailAddress);
                setStep(2);
                setValidated(false);
                notification.success({
                    message: 'Đã gửi mã OTP',
                    description: 'Vui lòng kiểm tra email của bạn để nhận mã khôi phục mật khẩu.',
                });
            } else {
                notification.error({
                    message: 'Không thể gửi mã OTP',
                    description: res?.EM ?? 'Đã xảy ra lỗi khi gửi mã OTP!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi kết nối',
                description: 'Không thể kết nối máy chủ để gửi mã OTP.',
            });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleResetPassword = async (otpCode, newPassword, newConfirmPassword) => {
        if (!pendingEmail) {
            notification.error({
                message: 'Thiếu thông tin email',
                description: 'Vui lòng quay lại bước đầu tiên.',
            });
            setStep(1);
            return;
        }

        if (newPassword !== newConfirmPassword) {
            notification.error({
                message: 'Mật khẩu không khớp',
                description: 'Mật khẩu xác nhận phải trùng khớp với mật khẩu mới.',
            });
            return;
        }

        setResetting(true);
        try {
            const res = await resetPasswordWithOtpApi({
                email: pendingEmail,
                otp: otpCode,
                password: newPassword,
            });

            if (res && res.EC === 0) {
                notification.success({
                    message: 'Đặt lại mật khẩu thành công',
                    description: 'Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập bằng mật khẩu mới.',
                });
                setEmail('');
                setOtp('');
                setPassword('');
                setConfirmPassword('');
                setPendingEmail('');
                setStep(1);
                setValidated(false);
                navigate('/login');
            } else {
                notification.error({
                    message: 'Đặt lại mật khẩu thất bại',
                    description: res?.EM ?? 'Mã OTP không chính xác hoặc đã hết hạn!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi hệ thống',
                description: 'Đã xảy ra sự cố trong quá trình đặt lại mật khẩu.',
            });
        } finally {
            setResetting(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(true);

        if (step === 1) {
            await handleRequestOtp(email);
        } else {
            await handleResetPassword(otp, password, confirmPassword);
        }
    };

    const resendOtp = async () => {
        if (!pendingEmail) return;
        await handleRequestOtp(pendingEmail);
    };

    const footer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="bootstrap-auth-links">
                <Link to="/login">
                    ← Quay lại đăng nhập
                </Link>
                <Link to="/register">Tạo tài khoản mới</Link>
            </div>
            <div className="text-center mt-3 text-muted" style={{ fontSize: '0.85rem' }}>
                Đã nhớ mật khẩu? <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>Đăng nhập ngay</Link>
            </div>
        </div>
    );

    return (
        <BootstrapAuthLayout
            title="Quên mật khẩu"
            description={stepLabel}
            footer={footer}
        >
            <Form noValidate validated={validated} onSubmit={handleSubmit} className="bootstrap-auth-form">
                {step === 1 ? (
                    <>
                        <Form.Group className="mb-4" controlId="forgotEmail">
                            <Form.Label>Địa chỉ Email</Form.Label>
                            <Form.Control
                                required
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng nhập email hợp lệ!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button type="submit" className="bootstrap-auth-btn w-100 py-2" disabled={sendingOtp}>
                            {sendingOtp ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Đang gửi OTP...
                                </>
                            ) : 'Gửi mã OTP'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Form.Group className="mb-3 text-center" controlId="forgotOtp">
                            <Form.Label className="d-block text-start">Mã xác thực OTP</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="------"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="text-center font-monospace fs-4 py-2"
                                style={{ letterSpacing: '8px', paddingLeft: '20px' }}
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng nhập mã OTP gồm 6 chữ số!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="forgotPassword">
                            <Form.Label>Mật khẩu mới</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Nhập mật khẩu mới của bạn"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng nhập mật khẩu mới!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="forgotConfirmPassword">
                            <Form.Label>Xác nhận mật khẩu</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng xác nhận lại mật khẩu!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row className="mb-4 g-2">
                            <Col xs={6}>
                                <Button variant="outline-light" className="w-100 py-2" onClick={resendOtp} disabled={sendingOtp} style={{ borderRadius: '12px' }}>
                                    {sendingOtp ? 'Đang gửi...' : 'Gửi lại OTP'}
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button variant="outline-light" className="w-100 py-2" onClick={() => setStep(1)} style={{ borderRadius: '12px' }}>
                                    Quay lại
                                </Button>
                            </Col>
                        </Row>

                        <Button type="submit" className="bootstrap-auth-btn w-100 py-2" disabled={resetting}>
                            {resetting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Đang khôi phục...
                                </>
                            ) : 'Đặt lại mật khẩu'}
                        </Button>
                    </>
                )}
            </Form>
        </BootstrapAuthLayout>
    );
};

export default ForgotPasswordPage;
