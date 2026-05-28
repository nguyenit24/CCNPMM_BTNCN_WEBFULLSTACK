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

    const stepLabel = useMemo(() => (step === 1 ? 'Enter your email to receive password recovery OTP' : 'Enter the OTP code and set your new password'), [step]);

    const handleRequestOtp = async (emailAddress) => {
        setSendingOtp(true);
        try {
            const res = await requestForgotPasswordOtpApi({ email: emailAddress });
            if (res && res.EC === 0) {
                setPendingEmail(emailAddress);
                setStep(2);
                setValidated(false);
                notification.success({
                    message: 'OTP Sent',
                    description: 'Please check your email for the password recovery OTP code.',
                });
            } else {
                notification.error({
                    message: 'Could Not Send OTP',
                    description: res?.EM ?? 'An error occurred while sending the OTP code!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Connection Error',
                description: 'Could not connect to server to send OTP code.',
            });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleResetPassword = async (otpCode, newPassword, newConfirmPassword) => {
        if (!pendingEmail) {
            notification.error({
                message: 'Missing Email Address',
                description: 'Please go back to the first step.',
            });
            setStep(1);
            return;
        }

        if (newPassword !== newConfirmPassword) {
            notification.error({
                message: 'Passwords Do Not Match',
                description: 'Confirm password must match the new password.',
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
                    message: 'Password Reset Successful',
                    description: 'Your password has been updated. Please sign in with your new password.',
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
                    message: 'Password Reset Failed',
                    description: res?.EM ?? 'Incorrect or expired OTP code!',
                });
            }
        } catch (error) {
            notification.error({
                message: 'System Error',
                description: 'An error occurred during password reset.',
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
                    ← Back to Sign In
                </Link>
                <Link to="/register">Create new account</Link>
            </div>
            <div className="text-center mt-3" style={{ fontSize: '0.85rem' }}>
                Remembered your password? <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>Sign In now</Link>
            </div>
        </div>
    );

    return (
        <BootstrapAuthLayout
            title="Forgot Password"
            description={stepLabel}
            footer={footer}
        >
            <Form noValidate validated={validated} onSubmit={handleSubmit} className="bootstrap-auth-form">
                {step === 1 ? (
                    <>
                        <Form.Group className="mb-4" controlId="forgotEmail">
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

                        <Button type="submit" className="bootstrap-auth-btn w-100 py-2" disabled={sendingOtp}>
                            {sendingOtp ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Sending OTP...
                                </>
                            ) : 'Send OTP Code'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Form.Group className="mb-3 text-center" controlId="forgotOtp">
                            <Form.Label className="d-block text-start">OTP Verification Code</Form.Label>
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
                                Please enter the 6-digit OTP code!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="forgotPassword">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter a new password!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="forgotConfirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Re-enter your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please confirm your new password!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row className="mb-4 g-2">
                            <Col xs={6}>
                                <Button variant="outline-light" className="w-100 py-2" onClick={resendOtp} disabled={sendingOtp} style={{ borderRadius: '12px' }}>
                                    {sendingOtp ? 'Sending...' : 'Resend OTP'}
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button variant="outline-light" className="w-100 py-2" onClick={() => setStep(1)} style={{ borderRadius: '12px' }}>
                                    Back
                                </Button>
                            </Col>
                        </Row>

                        <Button type="submit" className="bootstrap-auth-btn w-100 py-2" disabled={resetting}>
                            {resetting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Resetting...
                                </>
                            ) : 'Reset Password'}
                        </Button>
                    </>
                )}
            </Form>
        </BootstrapAuthLayout>
    );
};

export default ForgotPasswordPage;
