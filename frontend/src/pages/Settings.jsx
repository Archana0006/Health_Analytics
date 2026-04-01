import React, { useState, useEffect } from 'react';
import { User, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserProfileData, useUpdateProfile, useUpdatePassword } from '../hooks/useHealthData';

const Settings = () => {
    const { token } = useAuth();

    // TanStack Query Hooks
    const { data: initialProfile } = useUserProfileData();
    const updateProfileMutation = useUpdateProfile();
    const updatePasswordMutation = useUpdatePassword();

    const [profile, setProfile] = useState({
        name: '',
        age: '',
        gender: '',
        phoneNumber: '',
        address: ''
    });

    // Sync profile state when initial data is loaded
    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
        }
    }, [initialProfile]);

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const loading = updateProfileMutation.isPending || updatePasswordMutation.isPending;

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const data = await updateProfileMutation.mutateAsync(profile);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error updating profile' });
        } finally {
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        try {
            const res = await updatePasswordMutation.mutateAsync({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setMessage({ type: 'success', text: res.message || 'Password updated successfully' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error updating password' });
        } finally {
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '24px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '2rem', fontWeight: '800',
                    boxShadow: '0 0 30px var(--primary-glow)'
                }}>
                    {profile.name?.charAt(0).toUpperCase() || <User size={40} />}
                </div>
                <div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                        Settings
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Logged in as <span style={{ color: 'var(--primary-light)', fontWeight: '700' }}>{profile.name}</span>
                    </p>
                </div>
            </header>

            {message.text && (
                <div style={{
                    padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem',
                    background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    animation: 'fadeInUp 0.4s ease-out'
                }}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{message.text}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.55rem', borderRadius: '10px', background: 'var(--primary-muted)', color: 'var(--primary-light)' }}>
                            <User size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text)' }}>Personal Information</h3>
                    </div>

                    <form onSubmit={updateProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name</label>
                            <input name="name" value={profile.name || ''} className="input" onChange={handleProfileChange} required style={{ height: '46px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Age</label>
                            <input name="age" type="number" value={profile.age || ''} className="input" onChange={handleProfileChange} style={{ height: '46px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Gender</label>
                            <select name="gender" value={profile.gender || ''} className="input" onChange={handleProfileChange} style={{ height: '46px' }}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Phone Number</label>
                            <input name="phoneNumber" value={profile.phoneNumber || ''} className="input" onChange={handleProfileChange} style={{ height: '46px' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Home Address</label>
                            <input name="address" value={profile.address || ''} className="input" onChange={handleProfileChange} style={{ height: '46px' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 2rem', borderRadius: '12px', fontSize: '0.95rem' }} disabled={loading}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.55rem', borderRadius: '10px', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                            <Lock size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text)' }}>Security & Password</h3>
                    </div>

                    <form onSubmit={updatePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Current Password</label>
                            <input name="currentPassword" type="password" value={passwords.currentPassword} className="input" onChange={handlePasswordChange} required style={{ height: '46px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>New Password</label>
                            <input name="newPassword" type="password" value={passwords.newPassword} className="input" onChange={handlePasswordChange} required style={{ height: '46px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Confirm New Password</label>
                            <input name="confirmPassword" type="password" value={passwords.confirmPassword} className="input" onChange={handlePasswordChange} required style={{ height: '46px' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                            <button type="submit" className="btn" style={{
                                background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)',
                                padding: '0.7rem 2rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700'
                            }} disabled={loading}>
                                <Lock size={18} /> {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
