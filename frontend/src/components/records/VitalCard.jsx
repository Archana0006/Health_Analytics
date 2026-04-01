import React, { useState, useEffect } from 'react';

const VitalCard = ({ title, initialValue, unit, icon, color, gradient, trend, pulse = false, fluctuationRange = 2 }) => {
    const [value, setValue] = useState(initialValue);

    // Simulate real-time subtle fluctuations
    useEffect(() => {
        if (!pulse) return;
        const interval = setInterval(() => {
            setValue(prev => {
                // Random fluctuation between -fluctuationRange and +fluctuationRange
                const change = (Math.random() * fluctuationRange * 2) - fluctuationRange;
                let newValue = prev + change;
                // Keep it reasonably close to initial
                if (Math.abs(newValue - initialValue) > fluctuationRange * 3) {
                    newValue = prev - change; // bounce back
                }
                return Number(newValue.toFixed(1));
            });
        }, 3000); // update every 3 seconds

        return () => clearInterval(interval);
    }, [initialValue, pulse, fluctuationRange]);

    return (
        <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = `0 8px 24px rgba(${color}, 0.15)`;
            e.currentTarget.style.borderColor = `rgba(${color}, 0.3)`;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--border)';
        }}
        >
            {/* Background animated gradient pulse if needed */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
                background: `radial-gradient(circle, rgba(${color}, 0.15) 0%, transparent 70%)`,
                borderRadius: '50%', transform: 'translate(30%, -30%)',
                animation: pulse ? 'pulse 3s infinite alternate ease-in-out' : 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: gradient || `rgba(${color}, 0.1)`,
                    color: gradient ? 'white' : `rgb(${color})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: gradient ? `0 4px 12px rgba(${color}, 0.2)` : 'none'
                }}>
                    {icon}
                </div>
                {trend && (
                    <span style={{
                        fontSize: '0.75rem', fontWeight: '700',
                        color: trend > 0 ? '#10B981' : (trend < 0 ? '#EF4444' : 'var(--text-muted)'),
                        background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.5rem', borderRadius: '20px'
                    }}>
                        {trend > 0 ? '↑' : (trend < 0 ? '↓' : '–')} {Math.abs(trend)}%
                    </span>
                )}
            </div>

            <div>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {title}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                    <h3 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', lineHeight: '1' }}>
                        {/* If it's a whole number roughly, don't show decimals to avoid jitter, unless specified */}
                        {typeof value === 'number' && value > 20 && value % 1 !== 0 ? Math.round(value) : value}
                    </h3>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dim)' }}>
                        {unit}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VitalCard;
