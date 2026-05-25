import React from 'react';
import { Container } from 'react-bootstrap';

const BootstrapAuthLayout = ({ title, description, children, footer }) => {
    return (
        <div className="bootstrap-auth-container">
            <div className="bootstrap-auth-card">
                {/* Logo and Brand */}
                <div className="bootstrap-auth-logo">T</div>
                <div className="text-center mb-4">
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', color: '#60a5fa', textTransform: 'uppercase' }}>
                        TechStudio Premium
                    </span>
                </div>

                <h1 className="bootstrap-auth-title">{title}</h1>
                {description && <p className="bootstrap-auth-desc">{description}</p>}

                <div className="bootstrap-auth-form">
                    {children}
                </div>

                {footer && (
                    <div className="bootstrap-auth-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BootstrapAuthLayout;
