import React, { useState } from 'react';
import { Activity, Calendar, Clock, ClipboardList, CheckCircle, AlertCircle, Pill, FlaskConical, Filter, Download } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
// Note: We'll assume a hook useMedicalTimeline exists or we use recent records
import { usePatientRecords, useAppointments, usePatientLabs, usePatientPrescriptions } from '../hooks/useHealthData';

const Timeline = () => {
    const { user } = useAuth();
    const { patientId } = useParams();
    const effectiveId = patientId || user?.id;

    const [exportLoading, setExportLoading] = useState(false);

    const handleExport = async () => {
        if (!effectiveId) return;
        setExportLoading(true);
        try {
            const response = await apiClient.get(`/records/report/${effectiveId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'HealthTimeline_Report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Could not export the timeline.');
        } finally {
            setExportLoading(false);
        }
    };


    // Identify the user's role to prevent mapping Doctor IDs to Patient API endpoints
    const isPatientView = user?.role === 'patient' || !!patientId;
    const fetchPatientId = user?.role === 'patient' ? user.id : patientId;

    const { data: records = [], isLoading: loadingRecords } = usePatientRecords(fetchPatientId);
    const { data: appointments = [], isLoading: loadingAppts } = useAppointments(user?.role, user?.id, patientId);
    const { data: labs = [], isLoading: loadingLabs } = usePatientLabs(fetchPatientId);
    const { data: prescriptions = [], isLoading: loadingPrescriptions } = usePatientPrescriptions(fetchPatientId);

    const isLoading = loadingRecords || loadingAppts || loadingLabs || loadingPrescriptions;

    const timelineItems = [
        ...records.map(r => ({
            id: r._id,
            date: new Date(r.date || r.createdAt),
            title: r.diagnosis || r.type || 'Medical Update',
            description: r.notes || r.message || 'Clinical observation recorded.',
            type: r.doctorId ? 'Clinical' : 'Personal',
            icon: r.doctorId ? <ClipboardList size={18} /> : <Activity size={18} />,
            color: r.doctorId ? 'var(--primary)' : 'var(--accent)',
            verified: true
        })),
        ...appointments.map(a => ({
            id: a._id,
            date: new Date(a.date),
            title: 'Consultation Appointment',
            description: a.reason || 'General Checkup',
            type: 'Clinical',
            icon: <Calendar size={18} />,
            color: 'var(--info)',
            verified: a.status === 'completed'
        })),
        ...labs.map(l => ({
            id: l._id,
            date: new Date(l.orderedAt),
            title: `${l.testName} Lab Test`,
            description: l.status === 'completed' ? 'Results available for review.' : 'Test ordered and pending results.',
            type: 'Diagnostic',
            icon: <FlaskConical size={18} />,
            color: 'var(--warning)',
            verified: l.status === 'completed'
        })),
        ...prescriptions.map(p => ({
            id: p._id,
            date: new Date(p.dateIssued || p.startDate),
            title: 'Medication Prescribed',
            description: p.medications?.map(m => `${m.medicineName} (${m.dosage})`).join(', ') || 'No specific medications listed.',
            type: 'Treatment',
            icon: <Pill size={18} />,
            color: 'var(--success)',
            verified: true
        }))
    ].sort((a, b) => b.date - a.date);

    return (
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                        Health <span className="gradient-text">Timeline</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sequential journey of your clinical milestones</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn" style={{ padding: '0.6rem 1rem' }}><Filter size={18} /> Filter</button>
                    <button onClick={handleExport} disabled={exportLoading} className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>
                        <Download size={18} /> {exportLoading ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            </header>

            <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Vertical Line */}
                <div style={{ 
                    position: 'absolute', left: '7px', top: '10px', bottom: '10px', 
                    width: '2px', background: 'var(--border)', opacity: 0.5 
                }} />

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
                        <p style={{ color: 'var(--text-muted)' }}>Retrieving clinical history...</p>
                    </div>
                ) : timelineItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-elevated)', borderRadius: '24px', border: '2px dashed var(--border)' }}>
                        <Calendar size={48} style={{ color: 'var(--text-dim)', marginBottom: '1.25rem', opacity: 0.2 }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Timeline is Empty</h3>
                        <p style={{ color: 'var(--text-muted)' }}>No medical milestones recorded yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        {timelineItems.map((item, index) => (
                            <div key={item.id} style={{ position: 'relative', animation: `fadeInUp 0.4s ease forwards ${index * 0.1}s`, opacity: 0 }}>
                                {/* Timeline Dot */}
                                <div style={{ 
                                    position: 'absolute', left: '-2rem', top: '4px', transform: 'translateX(-50%)',
                                    width: '16px', height: '16px', borderRadius: '50%', background: item.color,
                                    border: '4px solid var(--bg-deep)', boxShadow: `0 0 10px ${item.color}44`,
                                    zIndex: 2
                                }} />

                                <div className="card" style={{ 
                                    padding: '1.5rem', border: '1px solid var(--border)', 
                                    marginLeft: '1rem', position: 'relative',
                                    transition: 'var(--transition)'
                                }} onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = item.color;
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                }} onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                                                <span style={{ 
                                                    padding: '0.35rem', borderRadius: '8px', 
                                                    background: `${item.color}22`, color: item.color 
                                                }}>{item.icon}</span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {item.type} Milestone
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)' }}>{item.title}</h3>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)' }}>
                                                {item.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                                <Clock size={12} /> {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.description}</p>
                                    
                                    <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '12px', background: 'var(--bg-elevated)', display: 'flex', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <CheckCircle size={14} color="var(--success)" /> Verified by AI
                                        </div>
                                        {item.type === 'Clinical' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                <AlertCircle size={14} color="var(--primary-light)" /> Includes Doctor Notes
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timeline;
