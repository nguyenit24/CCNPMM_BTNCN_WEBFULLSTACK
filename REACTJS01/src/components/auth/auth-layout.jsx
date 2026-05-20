import React from 'react';
import techHero from '../../assets/tech_auth_hero.png';

const AuthLayout = ({ title, description, children, footer }) => {
    return (
        <div className="auth-split-screen">
            {/* Cột Trái - Hình ảnh Thiết bị Công nghệ & Tagline */}
            <div 
                className="auth-split-visual" 
                style={{ backgroundImage: `url(${techHero})` }}
            >
                <div className="auth-split-visual__content">
                    <div className="auth-split-visual__badge">
                        TechStudio Premium
                    </div>
                    <h2 className="auth-split-visual__title">
                        Kiến Tạo Không Gian Công Nghệ Bứt Phá
                    </h2>
                    <p className="auth-split-visual__desc">
                        Khám phá hệ sinh thái sản phẩm công nghệ cao cấp, thiết bị gaming đỉnh cao và giải pháp thông minh tối ưu cho hiệu năng vượt trội tại TechStudio.
                    </p>
                </div>
            </div>

            {/* Cột Phải - Form Đăng nhập / Đăng ký dạng Kính Mờ */}
            <div className="auth-split-form-panel">
                <div className="auth-split-card">
                    {/* Thương hiệu */}
                    <div className="auth-split-card__brand">
                        <div className="auth-split-card__brand-logo">T</div>
                        <span className="auth-split-card__brand-name">TechStudio Premium</span>
                    </div>

                    <h1 className="auth-split-card__title">{title}</h1>
                    {description && <p className="auth-split-card__desc">{description}</p>}

                    <div className="auth-split-card__content">
                        {children}
                    </div>

                    {footer && (
                        <div className="auth-split-card__footer">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
