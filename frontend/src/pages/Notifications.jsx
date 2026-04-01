import React from 'react';
import { Bell, Check, Clock, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useNotifications, useMarkNotificationRead } from '../hooks/useHealthData';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
    const { user } = useAuth();
    const { data: notifications = [], isLoading } = useNotifications();
    const markReadMutation = useMarkNotificationRead();

    const handleMarkRead = async (id) => {
        try {
            await markReadMutation.mutateAsync(id);
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'alert': return <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />;
            case 'success': return <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />;
            case 'info': return <Info size={18} style={{ color: 'var(--info)' }} />;
            default: return <Bell size={18} style={{ color: 'var(--primary-light)' }} />;
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="loader" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Fetching alerts...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                    Clinical Alert Center
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Real-time notifications for patient status, appointments, and system updates.
                </p>
            </header>

            <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)' }}>Recent Activity</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                        {notifications.length} total
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <Bell size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem', opacity: 0.2 }} />
                            <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>No clinical alerts at this time.</p>
                        </div>
                    ) : (
                        notifications.map((notif, idx) => (
                            <div key={notif._id} style={{
                                padding: '1.25rem',
                                borderBottom: idx === notifications.length - 1 ? 'none' : '1px solid var(--border)',
                                display: 'flex',
                                gap: '1rem',
                                background: notif.read ? 'transparent' : 'rgba(108,99,255,0.03)',
                                transition: 'var(--transition)'
                            }}>
                                <div style={{ 
                                    width: '36px', height: '36px', borderRadius: '10px', 
                                    background: notif.read ? 'var(--bg-elevated)' : 'var(--primary-muted)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                                }}>
                                    {getIcon(notif.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: notif.read ? 'var(--text-secondary)' : 'var(--text)' }}>
                                            {notif.message}
                                        </p>
                                        {!notif.read && (
                                            <button 
                                                onClick={() => handleMarkRead(notif._id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-light)', padding: '0.2rem' }}
                                                title="Mark as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                        <Clock size={12} />
                                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
