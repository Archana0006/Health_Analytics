import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { HeartPulse, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import apiClient from '../api/apiClient';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const getStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };

    const strength = getStrength(password);
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#00d4aa'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await apiClient.post(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset link is invalid or has expired.');
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
                position: 'absolute', top: '10%', right: '15%', width: '350px', height: '350px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)',
                filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', bottom: '15%', left: '10%', width: '280px', height: '280px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,157,0.07) 0%, transparent 70%)',
                filter: 'blur(60px)', animation: 'float 10s ease-in-out infinite 3s',
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

                {!success ? (
                    <>
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                Set New Password
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Choose a strong password for your account.
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

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* New Password */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                    New Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                                    <input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min. 6 characters"
                                        className="input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: '48px' }}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(p => !p)} style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-dim)', padding: 0, display: 'flex',
                                    }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {/* Strength bar */}
                                {password && (
                                    <div style={{ marginTop: '0.6rem' }}>
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} style={{
                                                    flex: 1, height: '4px', borderRadius: '4px',
                                                    background: i <= strength ? strengthColors[strength] : 'var(--border)',
                                                    transition: 'background 0.3s',
                                                }} />
                                            ))}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: strengthColors[strength], fontWeight: '600' }}>
                                            {strengthLabels[strength]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                    Confirm Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                                    <input
                                        id="confirm-password"
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Repeat your password"
                                        className="input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={{
                                            paddingLeft: '2.5rem', paddingRight: '2.5rem', height: '48px',
                                            borderColor: confirmPassword && confirmPassword !== password
                                                ? 'rgba(239,68,68,0.5)' : undefined,
                                        }}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirm(p => !p)} style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-dim)', padding: 0, display: 'flex',
                                    }}>
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== password && (
                                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>Passwords do not match</p>
                                )}
                                {confirmPassword && confirmPassword === password && (
                                    <p style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '4px' }}>✓ Passwords match</p>
                                )}
                            </div>

                            <button
                                id="reset-password-btn"
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginTop: '0.25rem' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                        Resetting...
                                    </span>
                                ) : 'Reset Password'}
                            </button>
                        </form>
                    </>
                ) : (
                    /* Success state */
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
                            Password Reset! 🎉
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                            Your password has been updated successfully.<br />
                            Redirecting you to login in <strong style={{ color: 'var(--primary-light)' }}>3 seconds...</strong>
                        </p>
                        <Link to="/login" className="btn btn-primary" style={{
                            marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center',
                            gap: '0.5rem', height: '44px', padding: '0 1.5rem', textDecoration: 'none',
                        }}>
                            Go to Sign In
                        </Link>
                    </div>
                )}

                {/* Back to login */}
                {!success && (
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
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
