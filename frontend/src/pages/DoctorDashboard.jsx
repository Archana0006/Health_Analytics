import { Users, Calendar, ClipboardList, Clock, Activity, ArrowRight, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboardStats, useAppointments, useCriticalPatients } from '../hooks/useHealthData';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Fetch data
    const { data: stats = {}, isLoading: statsLoading } = useDashboardStats('doctor');
    const { data: appointments = [], isLoading: apptsLoading } = useAppointments('doctor', user?.id);
    const { data: criticalPatients = [], isLoading: criticalLoading } = useCriticalPatients();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Waiting queue: today's appointments that are scheduled/pending
    const waitingQueue = appointments
        .filter(a => {
            const apptDate = new Date(a.date);
            apptDate.setHours(0, 0, 0, 0);
            return apptDate.getTime() === today.getTime() &&
                (a.status === 'scheduled' || a.status === 'pending' || !a.status);
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Past visits: completed appointments from previous dates
    const pastVisits = appointments
        .filter(a => {
            const apptDate = new Date(a.date);
            apptDate.setHours(0, 0, 0, 0);
            return apptDate.getTime() < today.getTime() || a.status === 'completed';
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

    const statCards = [
        { label: 'Active Patients', value: stats.totalPatients || '0', icon: <Users size={20} />, color: 'var(--primary)' },
        { label: 'Today\'s Load', value: waitingQueue.length || '0', icon: <Calendar size={20} />, color: 'var(--accent)' },
        { label: 'Waiting Now', value: waitingQueue.length, icon: <Clock size={20} />, color: 'var(--warning)' },
        { label: 'Critical Alerts', value: stats.highRiskAlerts || '0', icon: <AlertTriangle size={20} />, color: 'var(--danger)' },
    ];

    const statusColors = {
        completed: { bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
        scheduled: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
        pending:   { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
        cancelled: { bg: 'rgba(239,68,68,0.1)',  color: '#EF4444' },
    };

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem' }}>
                        Clinical <span className="gradient-text">Command Center</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Welcome back, Dr. {user?.name?.split(' ')[0]}</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/appointments')}>View Full Schedule</button>
            </header>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {statCards.map((stat, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', animation: `fadeInUp 0.4s ease forwards ${i * 0.1}s`, opacity: 0 }}>
                        <div style={{ 
                            width: '52px', height: '52px', borderRadius: '16px', 
                            background: `${stat.color}11`, 
                            color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${stat.color}22`
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{stat.label}</p>
                            <p style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text)', lineHeight: 1 }}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Waiting Queue + Critical section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Today's Waiting Queue */}
                <div className="card" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Clock size={20} style={{ color: 'var(--warning)' }} /> Today's Waiting Queue
                        </h3>
                        <span style={{ 
                            fontSize: '0.8rem', fontWeight: '800', padding: '0.25rem 0.75rem', borderRadius: '20px',
                            background: waitingQueue.length > 0 ? 'rgba(245,158,11,0.12)' : 'var(--bg-elevated)',
                            color: waitingQueue.length > 0 ? '#F59E0B' : 'var(--text-muted)'
                        }}>
                            {waitingQueue.length} patient{waitingQueue.length !== 1 ? 's' : ''} waiting
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        {apptsLoading ? (
                            <div className="loader" style={{ margin: '2rem auto' }} />
                        ) : waitingQueue.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                <Clock size={36} style={{ color: 'var(--text-dim)', opacity: 0.3, marginBottom: '0.75rem' }} />
                                <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No patients waiting today.</p>
                            </div>
                        ) : (
                            waitingQueue.map((app, i) => (
                                <div key={app._id} style={{ 
                                    display: 'flex', alignItems: 'center', gap: '1rem', 
                                    padding: '1rem 1.15rem', borderRadius: '14px',
                                    background: 'rgba(245,158,11,0.04)',
                                    border: '1px solid rgba(245,158,11,0.15)',
                                    transition: 'var(--transition)'
                                }}>
                                    {/* Queue Position Badge */}
                                    <div style={{ 
                                        minWidth: '36px', height: '36px', borderRadius: '10px',
                                        background: 'rgba(245,158,11,0.15)', color: '#F59E0B',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem', fontWeight: '900'
                                    }}>#{i + 1}</div>

                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.15rem' }}>
                                            {app.patientId?.name || 'Unknown Patient'}
                                        </p>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Clock size={11} /> {app.time || new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            &nbsp;·&nbsp;
                                            <Activity size={11} /> {app.reason || 'General Checkup'}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/records/${app.patientId?._id}`)} 
                                        className="btn btn-primary" 
                                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', fontWeight: '700' }}
                                    >
                                        Start
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Critical Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--danger-bg)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <ShieldAlert size={18} color="var(--danger)" /> Vital Risk Alerts
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {criticalLoading ? (
                                <div className="loader" style={{ margin: '1rem auto' }} />
                            ) : criticalPatients.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--success-bg)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '700' }}>All clinical vitals are stable.</p>
                                </div>
                            ) : (
                                criticalPatients.slice(0, 3).map((p, i) => (
                                    <div key={i} style={{ 
                                        padding: '1.15rem', borderRadius: '16px', background: 'var(--danger-bg)', 
                                        border: '1px solid rgba(239,68,68,0.15)', position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--danger)', fontWeight: '800' }}>{p.name}</p>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--danger)', textTransform: 'uppercase' }}>{p.risk} Risk</span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'rgba(239,68,68,0.85)', fontWeight: '600' }}>
                                            {p.condition}: {p.bp} blood pressure detected.
                                        </p>
                                        <ArrowRight size={14} style={{ position: 'absolute', right: '1.15rem', bottom: '1.15rem', color: 'var(--danger)', opacity: 0.6 }} />
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="btn" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', background: 'var(--bg-elevated)', gap: '0.5rem' }}>
                            Full Risk Assessment <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Past Patient Visits */}
            <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <ClipboardList size={20} className="gradient-text" /> Previous Patient Visits
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {pastVisits.length} record{pastVisits.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {apptsLoading ? (
                    <div className="loader" style={{ margin: '2rem auto' }} />
                ) : pastVisits.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--bg-elevated)', borderRadius: '16px', border: '2px dashed var(--border)' }}>
                        <ClipboardList size={40} style={{ color: 'var(--text-dim)', opacity: 0.25, marginBottom: '0.75rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No past visits recorded yet.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Date', 'Patient Name', 'Reason / Diagnosis', 'Time', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pastVisits.map((app) => {
                                    const sc = statusColors[app.status] || statusColors.scheduled;
                                    return (
                                        <tr key={app._id}
                                            style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                                {new Date(app.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                    <div style={{ 
                                                        width: '32px', height: '32px', borderRadius: '10px',
                                                        background: 'var(--primary-muted)', color: 'var(--primary-light)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.85rem', fontWeight: '800', flexShrink: 0
                                                    }}>
                                                        {(app.patientId?.name || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text)' }}>{app.patientId?.name || 'Unknown Patient'}</p>
                                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{app.patientId?.email || ''}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {app.reason || 'General Checkup'}
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Clock size={12} />
                                                    {app.time || new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem' }}>
                                                <span style={{ 
                                                    padding: '0.28rem 0.65rem', borderRadius: '20px', 
                                                    fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase',
                                                    background: sc.bg, color: sc.color
                                                }}>
                                                    {app.status || 'Completed'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem' }}>
                                                <button
                                                    onClick={() => navigate(`/records/${app.patientId?._id}`)}
                                                    className="btn"
                                                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: '700', background: 'var(--bg-elevated)' }}
                                                >
                                                    View Chart
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
