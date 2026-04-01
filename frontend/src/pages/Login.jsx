import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogin } from '../hooks/useHealthData';
import { LogIn, Mail, Lock, HeartPulse, Sparkles, Activity, Shield, Zap } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const loginMutation = useLogin();
    const loading = loginMutation.isPending;

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await loginMutation.mutateAsync({ email, password });
            login(data.user, data.token);
            
            // Role-based redirection
            const role = data.user.role;
            if (role === 'admin') navigate('/admin-dashboard');
            else if (role === 'doctor') navigate('/doctor-dashboard');
            else navigate('/patient-dashboard');
            
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || (err.response ? 'Invalid email or password' : 'Server connection failed. Please check your network.');
            setError(errorMessage);
        }
    };

    const features = [
        { icon: <Activity size={20} />, title: 'Real-time Analytics', desc: 'Monitor vitals with live dashboards' },
        { icon: <Shield size={20} />, title: 'AI Predictions', desc: 'ML-powered disease risk assessment' },
        { icon: <Zap size={20} />, title: 'Smart Records', desc: 'Automated health record management' },
    ];

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--bg-deep)',
        }}>
            {/* ── Left Panel: Branding ── */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem',
                background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(255,107,157,0.05) 50%, rgba(0,212,170,0.03) 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated background orbs */}
                <div style={{
                    position: 'absolute', top: '15%', left: '10%', width: '300px', height: '300px',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
                    animation: 'float 8s ease-in-out infinite', filter: 'blur(40px)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '15%', right: '10%', width: '250px', height: '250px',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,157,0.1) 0%, transparent 70%)',
                    animation: 'float 10s ease-in-out infinite 2s', filter: 'blur(40px)'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '3rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            width: '52px', height: '52px', borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', boxShadow: '0 0 30px var(--primary-glow)'
                        }}>
                            <HeartPulse size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', lineHeight: 1 }}>HealthAI</h1>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                background: 'linear-gradient(90deg, var(--primary-light), var(--accent))',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>Analytics Pro</span>
                        </div>
                    </div>

                    <h2 style={{
                        fontSize: '2.5rem', fontWeight: '800', color: 'var(--text)',
                        lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-0.02em'
                    }}>
                        Intelligent Health<br />
                        <span style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary), var(--accent))',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto', animation: 'gradient-shift 4s ease infinite'
                        }}>
                            Analytics Platform
                        </span>
                    </h2>

                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '440px' }}>
                        Advanced AI-powered health monitoring, disease prediction, and comprehensive medical record management.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {features.map((f, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '1rem 1.25rem', borderRadius: '14px',
                                background: 'rgba(108,99,255,0.04)', border: '1px solid rgba(108,99,255,0.08)',
                                transition: 'var(--transition)'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'var(--primary-muted)', color: 'var(--primary-light)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    {f.icon}
                                </div>
                                <div>
                                    <p style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.9rem' }}>{f.title}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right Panel: Login Form ── */}
            <div style={{
                width: '520px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '3rem 3.5rem',
                background: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border)'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sign in to your health dashboard</p>
                </div>

                {error && (
                    <div style={{
                        background: 'var(--danger-bg)',
                        color: 'var(--danger)',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        marginBottom: '1.25rem',
                        fontSize: '0.85rem',
                        border: '1px solid rgba(239,68,68,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '2.5rem', height: '48px' }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '2.5rem', height: '48px' }}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginTop: '0.5rem' }} disabled={loading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                Signing in...
                            </span>
                        ) : (
                            <><LogIn size={18} /> Sign In</>
                        )}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>

                    <button type="button" className="btn" style={{ width: '100%', height: '48px', gap: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
                    </p>

                    <div style={{
                        background: 'rgba(108,99,255,0.04)',
                        padding: '1rem 1.25rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(108,99,255,0.08)'
                    }}>
                        <p style={{ fontWeight: '600', color: 'var(--text-dim)', fontSize: '0.7rem', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            <Sparkles size={10} style={{ marginRight: '4px', verticalAlign: '-1px' }} /> Demo Access
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Email:</span>{' '}
                                <code style={{ color: 'var(--primary-light)', background: 'var(--primary-muted)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>doctor@demo.com</code>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Pass:</span>{' '}
                                <code style={{ color: 'var(--primary-light)', background: 'var(--primary-muted)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>password</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
