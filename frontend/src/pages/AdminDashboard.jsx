import { Users, Shield, Activity, BarChart3, Bell, Settings, ArrowRight, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { useDashboardStats } from '../hooks/useHealthData';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    // Fetch system stats
    const { data: stats = {}, isLoading } = useDashboardStats('admin');

    const statCards = [
        { label: 'Total Patients', value: stats.totalPatients || '0', change: '+2.4%', icon: <Users size={20} />, color: 'var(--primary)' },
        { label: 'System Uptime', value: '99.98%', change: 'Stable', icon: <Activity size={20} />, color: 'var(--accent)' },
        { label: 'Clinical Staff', value: stats.totalDoctors || '0', change: 'Active', icon: <Shield size={20} />, color: 'var(--warning)' },
        { label: 'Total Records', value: stats.totalRecords || '0', change: 'Encrypted', icon: <Cpu size={20} />, color: 'var(--info)' },
    ];

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem' }}>
                    Admin Control <span className="gradient-text">Center</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>System-wide performance and user management</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {statCards.map((stat, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', animation: `fadeInUp 0.4s ease forwards ${i * 0.1}s`, opacity: 0 }}>
                        <div style={{ 
                            width: '52px', height: '52px', borderRadius: '16px', 
                            background: `var(--bg-elevated)`, 
                            color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid var(--border)`
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{stat.label}</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <p style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text)', lineHeight: 1 }}>{stat.value}</p>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--success)' }}>{stat.change}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Traffic Visualization */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <BarChart3 size={20} className="gradient-text" /> Data Processing Volume
                        </h3>
                        <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 0.5rem' }}>
                            {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85, 40, 75, 60, 80, 55, 90].map((h, i) => (
                                <div key={i} style={{ 
                                    width: '18px', height: `${h}%`, background: 'var(--primary)', 
                                    borderRadius: '6px 6px 0 0', opacity: 0.6 + (h/200),
                                    transition: 'var(--transition)'
                                }} className="hover-scale" />
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>00:00 UTC</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>12:00 UTC</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>23:59 UTC</span>
                        </div>
                    </div>

                    {/* Quick Management */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <button className="card" onClick={() => navigate('/users')} style={{ padding: '1.5rem', border: '1px solid var(--border)', textAlign: 'left', background: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ padding: '0.5rem', width: 'fit-content', borderRadius: '10px', background: 'var(--primary-muted)', color: 'var(--primary-light)', marginBottom: '1rem' }}><Users size={20} /></div>
                            <h4 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '0.4rem' }}>Manage Users & Roles</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure user profiles, view stats, and access controls.</p>
                        </button>
                        <button className="card" onClick={() => navigate('/settings')} style={{ padding: '1.5rem', border: '1px solid var(--border)', textAlign: 'left', background: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ padding: '0.5rem', width: 'fit-content', borderRadius: '10px', background: 'var(--accent-muted)', color: 'var(--accent)', marginBottom: '1rem' }}><Settings size={20} /></div>
                            <h4 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '0.4rem' }}>System Config</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security protocols, API limits and database pruning.</p>
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* System Alerts */}
                    <div className="card" style={{ padding: '1.75rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Bell size={20} className="gradient-text" /> Recent Audit Alerts
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {!stats.recentAlerts || stats.recentAlerts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: '14px' }}>
                                    No critical audit events found.
                                </div>
                            ) : (
                                stats.recentAlerts.map((a, i) => (
                                    <div key={a.id} style={{ 
                                        padding: '1.15rem', borderRadius: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                        display: 'flex', gap: '1rem', alignItems: 'flex-start'
                                    }}>
                                        <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
                                            <ShieldAlert size={16} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.2rem' }}>{a.userName}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{a.message}</p>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.4rem', display: 'block' }}>{new Date(a.date).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="btn" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', gap: '0.5rem' }}>
                            View Full Audit Logs <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Security Status</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={14} color="var(--success)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All core services encrypted & signed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
