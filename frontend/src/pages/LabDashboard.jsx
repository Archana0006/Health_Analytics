import React, { useState } from 'react';
import { FlaskConical, Search, Edit2, Upload, X, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useAllLabs, useUploadLabResult } from '../hooks/useHealthData';

const LabDashboard = () => {
    const { user, token } = useAuth();
    const { data: labs = [], isLoading: loading } = useAllLabs();
    const uploadMutation = useUploadLabResult();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedLabId, setSelectedLabId] = useState(null);
    const [formData, setFormData] = useState({ comments: '', flag: 'normal' });

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUploadClick = (lab) => {
        setSelectedLabId(lab._id);
        setFormData({ comments: '', flag: 'normal' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await uploadMutation.mutateAsync({
                labTestId: selectedLabId,
                comments: formData.comments,
                resultValues: [{ flag: formData.flag, value: 'See comments' }] // Simplified for demo
            });
            setShowModal(false);
            setSelectedLabId(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload result');
        }
    };

    const filteredLabs = labs.filter(l =>
        l.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.patientId?.name && l.patientId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const thStyle = {
        padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)',
        textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)'
    };
    const tdStyle = { padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-secondary)' };
    const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' };

    return (
        <div style={{ width: '100%' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>Lab Technician Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage and upload laboratory results</p>
                </div>
            </header>

            <div className="card">
                <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input className="input" placeholder="Search tests or patients..." style={{ paddingLeft: '2.5rem', height: '42px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Date & Test</th>
                                <th style={thStyle}>Patient</th>
                                <th style={thStyle}>Ordered By</th>
                                <th style={thStyle}>Status</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLabs.map((l) => (
                                <tr key={l._id} style={{ transition: 'var(--transition)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(108,99,255,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '600', color: 'var(--text)' }}>{l.testName}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{new Date(l.orderedAt).toLocaleString()}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ color: 'var(--text-secondary)' }}>{l.patientId?.name || 'Unknown'}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ color: 'var(--text-secondary)' }}>Dr. {l.doctorId?.name || 'Unknown'}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ padding: '0.3rem 0.65rem', borderRadius: '20px', fontSize: '0.78rem', color: l.status === 'ordered' ? '#F59E0B' : '#10B981', background: l.status === 'ordered' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', fontWeight: '600', textTransform: 'capitalize' }}>
                                            {l.status}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        {l.status === 'ordered' && user?.role === 'admin' ? (
                                            <button onClick={() => handleUploadClick(l)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                                <Upload size={14} /> Upload Result
                                            </button>
                                        ) : l.status === 'completed' ? (
                                            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}><CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Done</span>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ width: '520px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>Upload Lab Results</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Result Flag</label>
                                <select name="flag" value={formData.flag} className="input" onChange={handleFormChange} style={{ height: '42px' }}>
                                    <option value="normal">Normal</option>
                                    <option value="high">High (Abnormal)</option>
                                    <option value="low">Low (Abnormal)</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Technician Comments & Findings</label>
                                <textarea name="comments" value={formData.comments} className="input" rows="4" onChange={handleFormChange} required placeholder="Enter the detailed results..." />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ height: '44px', marginTop: '0.5rem' }}>Submit Results</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabDashboard;
