import React, { useState } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, Clock3, Activity, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import {
    useUserProfile,
    useAppointments,
    useDoctorsList,
    useBookAppointment,
    useUpdateAppointmentStatus
} from '../hooks/useHealthData';

const Appointments = () => {
    const { user, token } = useAuth();
    const { patientId } = useParams();
    const effectivePatientId = patientId || user?.id;

    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [viewDate, setViewDate] = useState(new Date());
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        doctorId: '',
        date: '',
        time: '',
        reason: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // TanStack Query Hooks
    const { data: patientInfo } = useUserProfile(patientId);
    const { data: appointments = [], isLoading: loadingAppts } = useAppointments(user?.role, user?.id, patientId);
    const { data: doctors = [] } = useDoctorsList();

    // Mutations
    const bookMutation = useBookAppointment();
    const statusMutation = useUpdateAppointmentStatus();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const bookAppointment = async (e) => {
        e.preventDefault();
        try {
            const appointmentData = { ...formData, patientId: effectivePatientId };
            await bookMutation.mutateAsync(appointmentData);
            setMessage({ type: 'success', text: 'Appointment requested successfully!' });
            setFormData({ doctorId: '', date: '', time: '', reason: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to book appointment' });
        } finally {
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await statusMutation.mutateAsync({ id, status });
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'var(--primary)';
            case 'pending': return 'var(--warning)';
            case 'completed': return 'var(--success)';
            case 'cancelled': return 'var(--danger)';
            default: return 'var(--text-muted)';
        }
    };

    const filteredAppointments = appointments.filter(app => {
        const matchesSearch = user.role === 'patient'
            ? app.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            : app.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const currentAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Calendar Logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Prepend empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ height: '80px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }} />);
        }

        // Fill days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayAppts = appointments.filter(a => a.date.startsWith(dateStr));
            
            days.push(
                <div key={d} style={{ 
                    height: '80px', border: '1px solid var(--border)', padding: '0.4rem', 
                    position: 'relative', background: dayAppts.length > 0 ? 'rgba(108,99,255,0.03)' : 'transparent' 
                }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>{d}</span>
                    <div style={{ marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                        {dayAppts.map(a => (
                            <div key={a._id} title={`${a.time}: ${a.reason}`} style={{ display: 'inline-flex', padding: '2px' }}>
                                <CheckCircle size={22} color="var(--success)" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{ padding: '0.6rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        {day}
                    </div>
                ))}
                {days}
            </div>
        );
    };

    return (
        <div style={{ width: '100%' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                        {patientId ? `Consultations: ${patientInfo?.name || 'Patient'}` : 'Health Consultations'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {user.role === 'patient' ? 'Schedule and manage your professional doctor visits' : 'Manage patient consultation schedule and availability'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ 
                        display: 'flex', background: 'var(--bg-elevated)', padding: '0.25rem', 
                        borderRadius: '10px', border: '1px solid var(--border)' 
                    }}>
                        <button 
                            onClick={() => setViewMode('list')}
                            style={{ 
                                padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700',
                                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'list' ? 'white' : 'var(--text-muted)',
                                border: 'none', cursor: 'pointer', transition: 'var(--transition)'
                            }}
                        >List</button>
                        <button 
                            onClick={() => setViewMode('calendar')}
                            style={{ 
                                padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700',
                                background: viewMode === 'calendar' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'calendar' ? 'white' : 'var(--text-muted)',
                                border: 'none', cursor: 'pointer', transition: 'var(--transition)'
                            }}
                        >Calendar</button>
                    </div>
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
                    {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{message.text}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: user.role === 'patient' ? '400px 1fr' : '1fr', gap: '1.5rem' }}>
                {(user.role === 'patient' || user.role === 'admin' || user.role === 'doctor') && (
                    <div className="card" style={{ padding: '1.75rem', height: 'fit-content', position: 'sticky', top: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--primary-muted)', color: 'var(--primary-light)' }}>
                                <Calendar size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>{patientId ? 'Schedule Visit' : 'Book Consultation'}</h3>
                        </div>

                        <form onSubmit={bookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Select Specialist</label>
                                <select name="doctorId" value={formData.doctorId} className="input" onChange={handleInputChange} required style={{ height: '46px' }}>
                                    <option value="">Choose a professional...</option>
                                    {doctors.map(doc => (
                                        <option key={doc._id} value={doc._id}>Dr. {doc.name} ({doc.specialization || 'General'})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.85rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Preferred Date</label>
                                    <input name="date" type="date" value={formData.date} className="input" onChange={handleInputChange} required style={{ height: '46px' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Time Slot</label>
                                    <input name="time" type="time" value={formData.time} className="input" onChange={handleInputChange} required style={{ height: '46px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Reason for Consultation</label>
                                <textarea name="reason" value={formData.reason} className="input" rows="3" placeholder="Symptoms or purpose of visit..." onChange={handleInputChange} required style={{ padding: '0.85rem' }} />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={bookMutation.isPending} style={{ height: '48px', fontSize: '0.95rem', fontWeight: '700', marginTop: '0.25rem' }}>
                                {bookMutation.isPending ? 'Requesting...' : 'Confirm Appointment'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="card" style={{ padding: '1.75rem' }}>
                    {viewMode === 'calendar' ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>
                                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="btn" style={{ padding: '0.4rem' }}><ChevronLeft size={16} /></button>
                                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="btn" style={{ padding: '0.4rem' }}><ChevronRight size={16} /></button>
                                </div>
                            </div>
                            {renderCalendar()}
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--info-bg)', color: 'var(--info)' }}>
                                        <Clock3 size={20} />
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>Upcoming Schedule</h3>
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.65rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                    {appointments.length} total
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                    <input className="input" placeholder={`Search ${user.role === 'patient' ? 'doctors' : 'patients'}...`} style={{ paddingLeft: '2.5rem', height: '42px' }} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                                </div>
                                <div style={{ position: 'relative', width: '150px' }}>
                                    <Filter size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                    <select className="input" style={{ paddingLeft: '2.5rem', height: '42px' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {currentAppointments.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--bg-elevated)', borderRadius: '16px', border: '2px dashed var(--border)' }}>
                                        <Calendar size={40} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem', opacity: 0.4 }} />
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>No appointments found.</p>
                                    </div>
                                ) : (
                                    currentAppointments.map(app => (
                                        <div key={app._id} style={{
                                            padding: '1.15rem', borderRadius: '14px', background: 'var(--bg-card)',
                                            border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            transition: 'var(--transition)', cursor: 'default'
                                        }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '52px', height: '52px', borderRadius: '14px', background: 'var(--bg-elevated)',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    border: '1px solid var(--border)'
                                                }}>
                                                    <span style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--primary-light)', textTransform: 'uppercase' }}>
                                                        {new Date(app.date).toLocaleDateString([], { month: 'short' })}
                                                    </span>
                                                    <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text)' }}>
                                                        {new Date(app.date).getDate()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                                                        {user.role === 'patient' ? `Dr. ${app.doctorId?.name || 'Assigned Specialist'}` : app.patientId?.name || 'Patient'}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} /> {app.time}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Activity size={13} /> {app.reason}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                                                <span style={{
                                                    padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800',
                                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                                    background: app.status === 'approved' ? 'var(--success-bg)' : app.status === 'pending' ? 'var(--warning-bg)' : 'rgba(255,255,255,0.03)',
                                                    color: app.status === 'approved' ? 'var(--success)' : app.status === 'pending' ? 'var(--warning)' : 'var(--text-muted)',
                                                    border: `1px solid ${app.status === 'approved' ? 'rgba(16,185,129,0.15)' : app.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'var(--border)'}`
                                                }}>
                                                    {app.status}
                                                </span>
                                                {user.role === 'doctor' && app.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <button onClick={() => updateStatus(app._id, 'approved')} className="btn" style={{ padding: '0.35rem 0.7rem', background: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.72rem', border: '1px solid rgba(16,185,129,0.15)' }}>Approve</button>
                                                        <button onClick={() => updateStatus(app._id, 'cancelled')} className="btn" style={{ padding: '0.35rem 0.7rem', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.72rem', border: '1px solid rgba(239,68,68,0.15)' }}>Decline</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="btn" style={{ padding: '0.5rem', background: 'var(--bg-elevated)' }}><ChevronLeft size={16} /></button>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="btn" style={{ padding: '0.5rem', background: 'var(--bg-elevated)' }}><ChevronRight size={16} /></button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Appointments;
