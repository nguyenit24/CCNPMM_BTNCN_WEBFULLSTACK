import React from 'react';
import { Card, Statistic, Divider } from 'antd';

const AdminMetricCard = ({ label, value, helper, icon, gradient, loading }) => (
    <Card 
        className="admin-metric-card premium-glass-card" 
        bordered={false}
        style={{
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            position: 'relative'
        }}
    >
        {/* Subtle background glow */}
        <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: 100,
            height: 100,
            background: gradient,
            filter: 'blur(30px)',
            opacity: 0.15,
            borderRadius: '50%'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--store-muted)' }}>{label}</span>
            <div 
                className="admin-metric-card__icon" 
                style={{ 
                    background: gradient, 
                    color: '#fff',
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.06)'
                }}
            >
                {icon}
            </div>
        </div>

        <Statistic 
            value={value} 
            loading={loading} 
            valueStyle={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--store-text)', letterSpacing: '-0.5px' }}
        />
        
        <Divider style={{ margin: '12px 0 8px 0', opacity: 0.5 }} />
        
        <p className="admin-metric-card__helper" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--store-muted)' }}>
            {helper}
        </p>
    </Card>
);

export default AdminMetricCard;
