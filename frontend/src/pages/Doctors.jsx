import React, { useState } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Mail, Phone, MapPin, X, Save, Plus, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDoctorsList, useAddDoctor, useUpdateDoctor, useDeleteDoctor } from '../hooks/useHealthData';

const Doctors = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { data: doctors = [], isLoading: loading } = useDoctorsList();
    const addMutation = useAddDoctor();
    const updateMutation = useUpdateDoctor();
    const deleteMutation = useDeleteDoctor();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDoctorId, setCurrentDoctorId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', specialization: '', age: '', gender: '', phoneNumber: '', address: '' });

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleEdit = (d) => {
        setIsEditing(true); setCurrentDoctorId(d._id);
        setFormData({ name: d.name, email: d.email, password: '', specialization: d.specialization || '', age: d.age || '', gender: d.gender || '', phoneNumber: d.phoneNumber || '', address: d.address || '' });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this doctor account? This will revoke their access.')) return;
        try { await deleteMutation.mutateAsync(id); } catch { alert('Failed to delete doctor account'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) await updateMutation.mutateAsync({ id: currentDoctorId, doctorData: formData });
            else await addMutation.mutateAsync(formData);
            closeModal();
        } catch (err) { alert(err.response?.data?.message || 'Action failed'); }
    };

    const closeModal = () => {
        setShowModal(false); setIsEditing(false); setCurrentDoctorId(null);
        setFormData({ name: '', email: '', password: '', specialization: '', age: '', gender: '', phoneNumber: '', address: '' });
    };

    const filteredDoctors = doctors.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.specialization && d.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
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
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>Medical Staff</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage healthcare providers and specializations</p>
                </div>
                {user?.role === 'admin' && (
                    <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={17} /> Register Doctor</button>
                )}
            </header>

            <div className="card">
                <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input className="input" placeholder="Search medical staff..." style={{ paddingLeft: '2.5rem', height: '42px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Doctor Name</th>
                                <th style={thStyle}>Specialization</th>
                                <th style={thStyle}>Contact Info</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDoctors.map((d) => (
                                <tr key={d._id} style={{ transition: 'var(--transition)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(108,99,255,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '600', color: 'var(--text)' }}>Dr. {d.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ID: {d._id.substring(0, 8).toUpperCase()}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ padding: '0.3rem 0.65rem', borderRadius: '20px', background: 'rgba(108,99,255,0.08)', fontSize: '0.78rem', color: 'var(--primary-light)', fontWeight: '600' }}>
                                            {d.specialization || 'General'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ color: 'var(--text-secondary)' }}>{d.email}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{d.phoneNumber || 'N/A'}</div>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                            {user?.role === 'admin' && (
                                                <>
                                                    <button onClick={() => handleEdit(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.4rem', transition: 'var(--transition)' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-light)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                                    ><Edit2 size={15} /></button>
                                                    <button onClick={() => handleDelete(d._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.4rem', transition: 'var(--transition)' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                                    ><Trash2 size={15} /></button>
                                                </>
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
                    <div style={{ width: '520px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>{isEditing ? 'Edit Doctor Profile' : 'Register New Doctor'}</h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><label style={labelStyle}>Full Name</label><input name="name" value={formData.name} className="input" placeholder="e.g. John Doe" onChange={handleFormChange} required style={{ height: '42px' }} /></div>
                                <div><label style={labelStyle}>Specialization</label><input name="specialization" value={formData.specialization} className="input" placeholder="e.g. Cardiologist" onChange={handleFormChange} required style={{ height: '42px' }} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><label style={labelStyle}>Email</label><input name="email" type="email" value={formData.email} className="input" onChange={handleFormChange} required style={{ height: '42px' }} /></div>
                                {!isEditing && (
                                    <div><label style={labelStyle}>Password</label><input name="password" type="password" value={formData.password} className="input" onChange={handleFormChange} required style={{ height: '42px' }} /></div>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><label style={labelStyle}>Age</label><input name="age" type="number" value={formData.age} className="input" onChange={handleFormChange} style={{ height: '42px' }} /></div>
                                <div><label style={labelStyle}>Gender</label>
                                    <select name="gender" value={formData.gender} className="input" onChange={handleFormChange} style={{ height: '42px' }}>
                                        <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div><label style={labelStyle}>Phone</label><input name="phoneNumber" value={formData.phoneNumber} className="input" onChange={handleFormChange} style={{ height: '42px' }} /></div>
                            <div><label style={labelStyle}>Office Address</label><input name="address" value={formData.address} className="input" onChange={handleFormChange} style={{ height: '42px' }} /></div>
                            <button type="submit" className="btn btn-primary" style={{ height: '44px', marginTop: '0.5rem' }}>{isEditing ? 'Update Doctor' : 'Create Account'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Doctors;
