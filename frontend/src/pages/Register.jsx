import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../hooks/useHealthData';
import { User, Mail, Lock, Briefcase, UserPlus, HeartPulse } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const registerMutation = useRegister();
    const loading = registerMutation.isPending;
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await registerMutation.mutateAsync(formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => { navigate('/login'); }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '2rem',
            background: 'var(--bg-deep)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Bg orbs */}
            <div style={{
                position: 'absolute', top: '10%', right: '20%', width: '350px', height: '350px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)',
                filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', left: '15%', width: '300px', height: '300px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)',
                filter: 'blur(60px)', animation: 'float 10s ease-in-out infinite 3s'
            }} />

            <div className="card" style={{
                width: '100%',
                maxWidth: '480px',
                padding: '2.5rem',
                position: 'relative',
                zIndex: 1,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '64px', height: '64px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white', marginBottom: '1.25rem',
                        boxShadow: '0 0 30px var(--primary-glow)'
                    }}>
                        <UserPlus size={30} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.4rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Join the health revolution today</p>
                </div>

                {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.85rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(239,68,68,0.15)' }}>⚠️ {error}</div>}
                {success && <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.85rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(16,185,129,0.15)' }}>✓ {success}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                            <input name="name" placeholder="John Doe" className="input" value={formData.name} onChange={handleChange} style={{ paddingLeft: '2.5rem', height: '46px' }} required />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                            <input type="email" name="email" placeholder="john@example.com" className="input" value={formData.email} onChange={handleChange} style={{ paddingLeft: '2.5rem', height: '46px' }} required />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                            <input type="password" name="password" placeholder="••••••••" className="input" value={formData.password} onChange={handleChange} style={{ paddingLeft: '2.5rem', height: '46px' }} required />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>I am a...</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                            <select name="role" className="input" value={formData.role} onChange={handleChange} style={{ paddingLeft: '2.5rem', height: '46px' }}>
                                <option value="patient">Patient</option>
                                <option value="doctor">Healthcare Professional</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '0.95rem', marginTop: '0.5rem' }} disabled={loading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                Creating Account...
                            </span>
                        ) : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <p>Already have an account? <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
