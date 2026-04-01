import React, { useState } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, FileText, X, Save, Plus, TrendingUp, FolderOpen, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAllPatients, useAddPatient, useUpdatePatient, useDeletePatient } from '../hooks/useHealthData';

const Patients = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { data: patients = [], isLoading: loading } = useAllPatients();
    const addMutation = useAddPatient();
    const updateMutation = useUpdatePatient();
    const deleteMutation = useDeletePatient();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPatientId, setCurrentPatientId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', age: '', gender: '', phoneNumber: '', address: '' });

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleEdit = (p) => {
        setIsEditing(true); setCurrentPatientId(p._id);
        setFormData({ name: p.name, email: p.email, password: '', age: p.age || '', gender: p.gender || '', phoneNumber: p.phoneNumber || '', address: p.address || '' });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this patient? This will also remove their access.')) return;
        try { await deleteMutation.mutateAsync(id); toast.success('Patient deleted'); } catch { toast.error('Failed to delete patient'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) await updateMutation.mutateAsync({ id: currentPatientId, patientData: formData });
            else await addMutation.mutateAsync(formData);
            closeModal();
        } catch (err) {
            const errorMsg = err.response?.data?.message || (err.response?.data?.errors && err.response.data.errors.map(e => Object.values(e)[0]).join(', ')) || 'Action failed';
            toast.error(errorMsg);
        }
    };

    const closeModal = () => {
        setShowModal(false); setIsEditing(false); setCurrentPatientId(null);
        setFormData({ name: '', email: '', password: '', age: '', gender: '', phoneNumber: '', address: '' });
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>Patient Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage health profiles and medical access</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'doctor') && (
                    <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={17} /> Add Patient</button>
                )}
            </header>

            <div className="card">
                <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input className="input" placeholder="Search patients..." style={{ paddingLeft: '2.5rem', height: '42px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Patient Profile</th>
                                <th style={thStyle}>Clinical Vitals</th>
                                <th style={thStyle}>Last Activity</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Diagnostic Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map((p) => (
                                <tr key={p._id} style={{ transition: 'var(--transition)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(108,99,255,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ 
                                                width: '40px', height: '40px', borderRadius: '12px', 
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--primary-light)', fontWeight: '800', fontSize: '1rem'
                                            }}>
                                                {p.name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.95rem' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <span style={{ color: 'var(--primary-light)' }}>{p.hospitalPatientId || `ID-${p._id.substring(0,6).toUpperCase()}`}</span>
                                                    <span>•</span>
                                                    <span>{p.gender?.[0] || 'N'}/{p.age || '??'}y</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'rgba(59,130,246,0.08)', fontSize: '0.72rem', color: 'var(--info)', fontWeight: '700', border: '1px solid rgba(59,130,246,0.1)' }}>
                                                BP: {p.vitals?.bloodPressure?.systolic || '??'}/{p.vitals?.bloodPressure?.diastolic || '??'}
                                            </span>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'rgba(16,185,129,0.08)', fontSize: '0.72rem', color: 'var(--success)', fontWeight: '700', border: '1px solid rgba(16,185,129,0.1)' }}>
                                                HR: {p.vitals?.heartRate || '??'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'No recent activity'}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Clinical Sync Completed</div>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                            <button 
                                                onClick={() => navigate(`/timeline/${p._id}`)} 
                                                className="btn" 
                                                title="View Clinical Timeline"
                                                style={{ padding: '0.45rem', minWidth: '36px', height: '36px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                                            >
                                                <FolderOpen size={16} />
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/analytics/${p._id}`)} 
                                                title="Health Analytics"
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', cursor: 'pointer', padding: '0.45rem', borderRadius: '8px', color: 'var(--text-muted)', transition: 'var(--transition)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                            ><TrendingUp size={16} /></button>
                                            <button 
                                                onClick={() => navigate(`/records/${p._id}`)} 
                                                title="Medical Records"
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', cursor: 'pointer', padding: '0.45rem', borderRadius: '8px', color: 'var(--text-muted)', transition: 'var(--transition)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                            ><FileText size={16} /></button>
                                            <button 
                                                onClick={() => handleEdit(p)} 
                                                title="Edit Profile"
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', cursor: 'pointer', padding: '0.45rem', borderRadius: '8px', color: 'var(--text-muted)', transition: 'var(--transition)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--warning)'}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                            ><Edit2 size={16} /></button>
                                            {(user?.role === 'admin' || user?.role === 'doctor') && (
                                                <button 
                                                    onClick={() => handleDelete(p._id)} 
                                                    title="Remove Patient"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.45rem', transition: 'var(--transition)' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                                ><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>{isEditing ? 'Edit Patient' : 'Register New Patient'}</h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><label style={labelStyle}>Full Name</label><input name="name" value={formData.name} className="input" onChange={handleFormChange} required style={{ height: '42px' }} /></div>
                                <div><label style={labelStyle}>Email</label><input name="email" type="email" value={formData.email} className="input" onChange={handleFormChange} required style={{ height: '42px' }} /></div>
                            </div>
                            {!isEditing && (
                                <div><label style={labelStyle}>Initial Password</label><input name="password" type="password" value={formData.password} className="input" onChange={handleFormChange} required style={{ height: '42px' }} /></div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><label style={labelStyle}>Age</label><input name="age" type="number" value={formData.age} className="input" onChange={handleFormChange} style={{ height: '42px' }} /></div>
                                <div><label style={labelStyle}>Gender</label>
                                    <select name="gender" value={formData.gender} className="input" onChange={handleFormChange} style={{ height: '42px' }}>
                                        <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div><label style={labelStyle}>Phone</label><input name="phoneNumber" value={formData.phoneNumber} className="input" onChange={handleFormChange} style={{ height: '42px' }} /></div>
                            <div><label style={labelStyle}>Address</label><input name="address" value={formData.address} className="input" onChange={handleFormChange} style={{ height: '42px' }} /></div>
                            <button type="submit" className="btn btn-primary" style={{ height: '44px', marginTop: '0.5rem' }}>{isEditing ? 'Update Patient' : 'Create Account'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patients;
