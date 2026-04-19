import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import apiClient from '../api/apiClient';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiClient.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-deep)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background orbs */}
            <div style={{
                position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)',
                filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '15%', width: '300px', height: '300px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
                filter: 'blur(60px)', animation: 'float 10s ease-in-out infinite 2s',
            }} />

            <div style={{
                width: '100%', maxWidth: '440px',
                background: 'var(--bg-surface)',
                borderRadius: '24px',
                border: '1px solid var(--border)',
                padding: '2.5rem',
                position: 'relative', zIndex: 1,
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        width: '44px', height: '44px', borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 0 24px var(--primary-glow)',
                    }}>
                        <HeartPulse size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text)', lineHeight: 1 }}>HealthAI</h1>
                        <span style={{
                            fontSize: '0.6rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em',
                            background: 'linear-gradient(90deg, var(--primary-light), var(--accent))',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>Analytics Pro</span>
                    </div>
                </div>

                {!sent ? (
                    <>
                        {/* Header */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                Forgot Password?
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                No worries! Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                background: 'var(--danger-bg)', color: 'var(--danger)',
                                padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.25rem',
                                fontSize: '0.85rem', border: '1px solid rgba(239,68,68,0.15)',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                                    <input
                                        id="forgot-email"
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

                            <button
                                id="send-reset-btn"
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', height: '48px', fontSize: '0.95rem' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                        Sending...
                                    </span>
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                ) : (
                    /* Success State */
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: 'rgba(0,212,170,0.12)', border: '2px solid rgba(0,212,170,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            animation: 'pulse 2s ease-in-out infinite',
                        }}>
                            <CheckCircle size={36} color="var(--accent)" />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.75rem' }}>
                            Check Your Email!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '0.5rem' }}>
                            We've sent a password reset link to:
                        </p>
                        <p style={{
                            color: 'var(--primary-light)', fontWeight: '700', fontSize: '0.95rem',
                            background: 'var(--primary-muted)', padding: '6px 14px', borderRadius: '8px',
                            display: 'inline-block', marginBottom: '1.5rem',
                        }}>
                            {email}
                        </p>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                            The link expires in <strong style={{ color: 'var(--text-muted)' }}>15 minutes</strong>. Check your spam folder if you don't see it.
                        </p>

                        {/* Resend */}
                        <button
                            onClick={() => { setSent(false); setEmail(''); }}
                            className="btn"
                            style={{ marginTop: '1.5rem', width: '100%', height: '44px', fontSize: '0.88rem' }}
                        >
                            Try a different email
                        </button>
                    </div>
                )}

                {/* Back to Login */}
                <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
                    <Link to="/login" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        color: 'var(--text-muted)', fontSize: '0.88rem', textDecoration: 'none',
                        transition: 'color 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <ArrowLeft size={15} /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
