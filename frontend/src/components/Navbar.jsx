import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Bell, Search } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            height: '70px',
            padding: '0 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            background: 'rgba(15, 22, 41, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
        }}>
            {/* Left: Search Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.5rem 1rem',
                width: '320px',
                transition: 'var(--transition)',
            }}>
                <Search size={16} style={{ color: 'var(--text-dim)' }} />
                <input
                    placeholder="Search anything..."
                    style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        width: '100%',
                        fontFamily: 'inherit'
                    }}
                />
                <kbd style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-dim)',
                    border: '1px solid var(--border)',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap'
                }}>⌘K</kbd>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Notification Bell */}
                <button style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    transition: 'var(--transition)',
                    position: 'relative'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-active)';
                        e.currentTarget.style.color = 'var(--primary-light)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    <Bell size={18} />
                    <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: 'var(--danger)',
                        boxShadow: '0 0 8px rgba(239,68,68,0.5)'
                    }} />
                </button>

                {/* Divider */}
                <div style={{
                    width: '1px',
                    height: '28px',
                    background: 'var(--border)'
                }} />

                {/* User Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            fontWeight: '600',
                            color: 'var(--text)',
                            fontSize: '0.875rem',
                            lineHeight: 1.2
                        }}>{user?.name}</div>
                        <div style={{
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            letterSpacing: '0.03em',
                            background: 'linear-gradient(90deg, var(--primary-light), var(--accent))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>{user?.role}</div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        boxShadow: '0 0 16px var(--primary-glow)'
                    }}>
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>

                {/* Logout Button */}
                <button onClick={handleLogout} style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: 'var(--danger)',
                    background: 'var(--danger-bg)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontFamily: 'inherit'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--danger)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = 'var(--danger)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--danger-bg)';
                        e.currentTarget.style.color = 'var(--danger)';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)';
                    }}
                >
                    <LogOut size={15} /> Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
