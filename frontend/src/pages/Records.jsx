import React, { useState } from 'react';
import { Upload, FileText, Download, Plus, X, Edit2, Trash2, Calendar, Activity, Heart, Droplet, FilePlus, Pill, FlaskConical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import {
    usePatientRecords,
    usePatientInfo,
    useAddRecord,
    useUpdateRecord,
    useDeleteRecord,
    usePatientLabs,
    usePatientPrescriptions
} from '../hooks/useHealthData';

import PatientCard from '../components/records/PatientCard';
import VitalCard from '../components/records/VitalCard';
import RecordsTable from '../components/records/RecordsTable';
import LabsSummary from '../components/records/LabsSummary';
import PrescriptionsList from '../components/records/PrescriptionsList';

const Records = () => {
    const { user, token } = useAuth();
    const { patientId } = useParams();
    const navigate = useNavigate();

    // For patients: use own ID. For doctors/admins: only use URL param (require explicit patient selection).
    const isPatient = user?.role === 'patient';
    const effectivePatientId = patientId || (isPatient ? user?.id : null);

    const { data: records = [], isLoading: loadingRecords } = usePatientRecords(effectivePatientId);
    const { data: labs = [], isLoading: loadingLabs } = usePatientLabs(effectivePatientId);
    const { data: prescriptions = [], isLoading: loadingPrescriptions } = usePatientPrescriptions(effectivePatientId);
    const { data: patientInfo, isLoading: loadingPatientInfo } = usePatientInfo(effectivePatientId);

    const addRecordMutation = useAddRecord();
    const updateRecordMutation = useUpdateRecord();
    const deleteRecordMutation = useDeleteRecord();

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRecordId, setCurrentRecordId] = useState(null);
    const [formData, setFormData] = useState({ diagnosis: '', systolic: '', diastolic: '', sugarLevel: '', weight: '', height: '' });
    const [files, setFiles] = useState([]);

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFiles(e.target.files);

    const handleEdit = (record) => {
        setIsEditing(true);
        setCurrentRecordId(record._id);
        setFormData({
            diagnosis: record.diagnosis || '', systolic: record.bloodPressure?.systolic || '',
            sugarLevel: record.sugarLevel || '',
            weight: record.weight || '', height: record.height || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try { await deleteRecordMutation.mutateAsync(id); }
        catch (err) { console.error('Delete failed', err); toast.error('Failed to delete record'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                patientId: effectivePatientId,
                diagnosis: formData.diagnosis,
                bloodPressure: { 
                    systolic: Number(formData.systolic), 
                    diastolic: Number(formData.diastolic) 
                },
                sugarLevel: Number(formData.sugarLevel),
                weight: Number(formData.weight), 
                height: Number(formData.height)
            };
            if (isEditing) {
                await updateRecordMutation.mutateAsync({ id: currentRecordId, recordData: data });
            } else {
                const formDataPayload = new FormData();
                formDataPayload.append('patientId', effectivePatientId);
                formDataPayload.append('diagnosis', formData.diagnosis);
                formDataPayload.append('bloodPressure[systolic]', formData.systolic);
                formDataPayload.append('bloodPressure[diastolic]', formData.diastolic);
                formDataPayload.append('sugarLevel', formData.sugarLevel);
                formDataPayload.append('weight', formData.weight);
                formDataPayload.append('height', formData.height);
                for (let i = 0; i < files.length; i++) formDataPayload.append('attachments', files[i]);
                await addRecordMutation.mutateAsync(formDataPayload);
            }
            closeModal();
        } catch (err) {
            console.error('Submit failed', err);
            const errorMsg = err.response?.data?.errors
                ? err.response.data.errors.map(e => Object.values(e)[0]).join(', ')
                : err.response?.data?.error || err.response?.data?.message || 'Operation failed';
            toast.error(errorMsg);
        }
    };

    const closeModal = () => {
        setShowModal(false); setIsEditing(false); setCurrentRecordId(null);
        setFormData({ diagnosis: '', systolic: '', diastolic: '', sugarLevel: '', weight: '', height: '' });
        setFiles([]);
    };

    const thStyle = {
        padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)',
        textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid var(--border)'
    };
    const tdStyle = { padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-secondary)' };

    const isLoading = loadingRecords || loadingLabs || loadingPrescriptions || loadingPatientInfo;

    const latestRecord = records?.length > 0 ? records[0] : null;
    const systolic = latestRecord?.bloodPressure?.systolic || 120;
    const diastolic = latestRecord?.bloodPressure?.diastolic || 80;
    const bpString = `${systolic}/${diastolic}`;
    const initialTemp = 98.6 + (Math.random() * 0.4 - 0.2);

    return (
        <div>
            {/* ── Doctor/Admin: No patient selected ── */}
            {!effectivePatientId && !isPatient && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={36} style={{ color: 'var(--primary-light)', opacity: 0.7 }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Select a Patient</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '380px' }}>
                            To view or manage medical records, first search for a patient and open their profile.
                        </p>
                    </div>
                    <button onClick={() => navigate('/patients')} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                        Go to Search Patients
                    </button>
                </div>
            )}

            {/* ── Main Records UI ── */}
            {effectivePatientId && (
            <div>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.02em' }}>
                        <Activity size={24} style={{ color: 'var(--primary-light)' }} />
                        {patientId ? `Health Profile: ${patientInfo?.name || 'Loading...'}` : 'My Health Profile'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {patientId ? `Viewing comprehensive health history for ${patientInfo?.name || 'the selected patient'}.` : 'Manage your detailed health history, labs, and prescriptions.'}
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={17} /> Add Record</button>
            </header>

            {/* ── Dashboard Content ── */}
            {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: '1rem' }}>
                    <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid rgba(108,99,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Loading clinical repository...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
                    <PatientCard patientInfo={patientInfo} />
                
                {/* Vitals Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <VitalCard title="Heart Rate" initialValue={72} unit="bpm" icon={<Heart size={20} />} color="239, 68, 68" gradient="linear-gradient(135deg, #EF4444, #DC2626)" trend={-2} pulse={true} fluctuationRange={3} />
                    <VitalCard title="Blood Pressure" initialValue={bpString} unit="mmHg" icon={<Activity size={20} />} color="59, 130, 246" gradient="linear-gradient(135deg, #3B82F6, #2563EB)" pulse={false} />
                    <VitalCard title="Oxygen Level" initialValue={98} unit="%" icon={<Droplet size={20} />} color="16, 185, 129" gradient="linear-gradient(135deg, #10B981, #059669)" trend={1} pulse={true} fluctuationRange={1} />
                    <VitalCard title="Body Temp" initialValue={Number(initialTemp.toFixed(1))} unit="°F" icon={<Activity size={20} />} color="245, 158, 11" gradient="linear-gradient(135deg, #F59E0B, #D97706)" pulse={false} />
                </div>

                {/* Main Tables Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                        <RecordsTable records={records} onEdit={handleEdit} onDelete={handleDelete} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                        <LabsSummary labs={labs} />
                        <PrescriptionsList prescriptions={prescriptions} />
                    </div>
                </div>
            </div>
            )}

            {/* ── Modal ── */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text)' }}>{isEditing ? 'Edit Record' : 'Add New Record'}</h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.3rem' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Diagnosis</label>
                                <input name="diagnosis" value={formData.diagnosis} className="input" onChange={handleFormChange} required style={{ height: '42px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Systolic</label>
                                    <input name="systolic" type="number" value={formData.systolic} className="input" onChange={handleFormChange} style={{ height: '42px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Diastolic</label>
                                    <input name="diastolic" type="number" value={formData.diastolic} className="input" onChange={handleFormChange} style={{ height: '42px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Sugar</label>
                                    <input name="sugarLevel" type="number" value={formData.sugarLevel} className="input" onChange={handleFormChange} style={{ height: '42px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Weight (kg)</label>
                                    <input name="weight" type="number" step="0.1" value={formData.weight || ''} className="input" onChange={handleFormChange} style={{ height: '42px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Height (cm)</label>
                                    <input name="height" type="number" value={formData.height || ''} className="input" onChange={handleFormChange} style={{ height: '42px' }} />
                                </div>
                            </div>
                            {!isEditing && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Attachments</label>
                                    <input type="file" multiple onChange={handleFileChange} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} />
                                </div>
                            )}
                            <button type="submit" className="btn btn-primary" style={{ height: '44px', marginTop: '0.5rem' }}>
                                {isEditing ? 'Update' : 'Save'} Record
                            </button>
                        </form>
                    </div>
                </div>
            )}
            </div>
            )}
        </div>
    );
};

export default Records;
