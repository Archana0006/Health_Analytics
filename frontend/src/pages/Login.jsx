import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogin } from '../hooks/useHealthData';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const loginMutation = useLogin();
    const loading = loginMutation.isPending;

    const { login } = useAuth();
    const navigate = useNavigate();
    const [retrying, setRetrying] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setRetrying(false);

        const attemptLogin = async () => {
            const data = await loginMutation.mutateAsync({ email, password });
            login(data.user, data.token);
            const role = data.user.role;
            if (role === 'admin') navigate('/admin-dashboard');
            else if (role === 'doctor') navigate('/doctor-dashboard');
            else navigate('/patient-dashboard');
        };

        try {
            await attemptLogin();
        } catch (err) {
            if (!err.response) {
                setRetrying(true);
                setError('⏳ Server waking up. Retrying in 10s...');
                await new Promise(resolve => setTimeout(resolve, 10000));
                setRetrying(false);
                try {
                    await attemptLogin();
                } catch (retryErr) {
                    setError(retryErr.response?.data?.error || retryErr.response?.data?.message || 'Server connection failed.');
                }
            } else {
                setError(err.response?.data?.error || err.response?.data?.message || 'Invalid credentials');
            }
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100vw',
            background: `linear-gradient(rgba(15, 20, 35, 0.75), rgba(15, 20, 35, 0.9)), url('/doctor-patient-bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}>
            <div style={{
                display: 'flex',
                width: '850px',
                height: '550px',
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                overflow: 'hidden'
            }}>
                {/* ── Left Panel ── */}
                <div style={{
                    flex: '1',
                    background: 'linear-gradient(135deg, #42dcf5 0%, #2f9af5 100%)',
                    padding: '3rem 2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Wavy Background Elements */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-10%', left: '-10%',
                        width: '150%', height: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '50%',
                        transform: 'rotate(-15deg)',
                        zIndex: 1
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: '-20%', right: '-10%',
                        width: '120%', height: '40%',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '40%',
                        transform: 'rotate(10deg)',
                        zIndex: 1
                    }}></div>

                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ fontWeight: '800', fontSize: '1.4rem', marginBottom: '4rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                            HealthAI
                        </div>
                        
                        <h1 style={{ fontSize: '2.8rem', fontWeight: 'bold', marginBottom: '1.25rem', lineHeight: 1.2 }}>
                            Healthcare Portal
                        </h1>
                        <p style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.95, maxWidth: '90%' }}>
                            Securely access your medical records, manage appointments, and connect seamlessly with your healthcare providers.
                        </p>
                    </div>

                    <div style={{ position: 'relative', zIndex: 2, fontSize: '0.85rem', opacity: 0.8, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        End-to-End Encrypted System
                    </div>
                </div>

                {/* ── Right Panel Form ── */}
                <div style={{
                    flex: '0 0 450px',
                    padding: '3.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: '#ffffff'
                }}>
                    <h2 style={{ color: '#3b82f6', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>
                        Login
                    </h2>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                        Welcome back! Please enter your details to access your dashboard.
                    </p>

                    {error && (
                        <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#ef4444', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                                User Name
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                                type="checkbox" 
                                id="rememberMe" 
                                defaultChecked
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3b82f6' }}
                            />
                            <label htmlFor="rememberMe" style={{ color: '#9ca3af', fontSize: '0.85rem', cursor: 'pointer' }}>
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || retrying}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: (loading || retrying) ? 'not-allowed' : 'pointer',
                                marginTop: '0.5rem',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => { if(!loading && !retrying) e.currentTarget.style.background = '#2563eb' }}
                            onMouseLeave={e => { if(!loading && !retrying) e.currentTarget.style.background = '#3b82f6' }}
                        >
                            {loading || retrying ? 'LOGGING IN...' : 'LOGIN'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', fontSize: '0.85rem' }}>
                        <span style={{ color: '#9ca3af' }}>
                            New User? <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none' }}>Signup</Link>
                        </span>
                        <Link to="/forgot-password" style={{ color: '#9ca3af', textDecoration: 'none', fontStyle: 'italic' }}>
                            Forgot your password?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
