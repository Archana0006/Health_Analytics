import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Cpu, ClipboardList, Settings, Calendar, FolderOpen, Users, Stethoscope, HeartPulse, Sparkles, FlaskConical, Activity, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    
    // Determine the correct dashboard path based on role
    const dashboardPath = user?.role === 'admin' ? '/admin-dashboard' : (user?.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');

    const links = [
        { name: 'Dashboard', path: dashboardPath, icon: <LayoutDashboard size={19} /> },
        { name: 'Analytics', path: '/analytics', icon: <TrendingUp size={19} /> },
        { name: 'AI Clinical Insights', path: '/predictions', icon: <Cpu size={19} /> },
        { name: 'Medical Repository', path: '/records', icon: <ClipboardList size={19} /> },
        ...(user?.role === 'admin' ? [{ name: 'System Users', path: '/users', icon: <Users size={19} /> }] : []),
        ...(user?.role !== 'patient' ? [{ name: 'Search Patients', path: '/patients', icon: <Users size={19} /> }] : []),
        { name: 'Appointments', path: '/appointments', icon: <Calendar size={19} /> },
        { name: 'Timeline', path: '/timeline', icon: <Activity size={19} /> },
        { name: 'Notifications', path: '/notifications', icon: <Bell size={19} /> },
    ];

    return (
        <aside style={{
            width: '280px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            padding: '1.5rem 1rem',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, rgba(11,15,26,0.98) 0%, rgba(15,22,41,0.95) 100%)',
            borderRight: '1px solid var(--border)',
            backdropFilter: 'blur(24px)',
        }}>
            {/* ── Logo Section ── */}
            <div style={{
                padding: '0.5rem 0.75rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 0 24px var(--primary-glow)',
                    flexShrink: 0
                }}>
                    <HeartPulse size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 style={{
                        fontSize: '1.35rem',
                        fontWeight: '800',
                        color: 'var(--text)',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em'
                    }}>
                        HealthAI Clinical
                    </h2>
                    <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        background: 'linear-gradient(90deg, var(--primary-light), var(--accent))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                    }}>
                        <Sparkles size={10} style={{ WebkitTextFillColor: 'initial', color: 'var(--accent)' }} />
                        Analytics Pro
                    </span>
                </div>
            </div>

            {/* ── Divider ── */}
            <div style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
                marginBottom: '1.25rem'
            }} />

            {/* ── Navigation ── */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            textDecoration: 'none',
                            color: isActive ? 'white' : 'var(--text-muted)',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            background: isActive
                                ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                                : 'transparent',
                            transition: 'var(--transition)',
                            boxShadow: isActive ? '0 4px 16px rgba(108,99,255,0.3)' : 'none',
                            fontWeight: isActive ? '600' : '500',
                            fontSize: '0.9rem',
                            position: 'relative',
                            letterSpacing: '0.01em'
                        })}
                        onMouseEnter={(e) => {
                            if (!e.currentTarget.classList.contains('active'))
                                e.currentTarget.style.background = 'rgba(108,99,255,0.08)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                        onMouseLeave={(e) => {
                            if (!e.currentTarget.classList.contains('active'))
                                e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '';
                        }}
                    >
                        {link.icon}
                        <span>{link.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* ── Divider ── */}
            <div style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
                marginBottom: '0.75rem'
            }} />

            {/* ── Settings Link ── */}
            <NavLink
                to="/settings"
                style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    textDecoration: 'none',
                    color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    transition: 'var(--transition)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: isActive ? 'var(--primary-muted)' : 'transparent'
                })}
            >
                <Settings size={19} />
                <span>Settings</span>
            </NavLink>

            {/* ── User Card ── */}
            <div style={{
                marginTop: '0.75rem',
                padding: '0.85rem',
                borderRadius: '14px',
                background: 'rgba(108,99,255,0.06)',
                border: '1px solid rgba(108,99,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    flexShrink: 0
                }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: 'var(--text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {user?.name}
                    </p>
                    <p style={{
                        fontSize: '0.65rem',
                        color: 'var(--primary-light)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {user?.role}
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
