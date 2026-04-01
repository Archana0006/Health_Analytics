import React from 'react';
import { FileText, Edit2, Trash2 } from 'lucide-react';

const RecordsTable = ({ records = [], onEdit, onDelete }) => {
    const displayRecords = records;

    return (
        <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                    <FileText size={16} />
                </div>
                Recent Medical Records
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Diagnosis</th>
                            <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Doctor</th>
                            <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayRecords.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No medical records found.
                                </td>
                            </tr>
                        ) : displayRecords.slice(0, 5).map((record) => (
                            <tr key={record._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} 
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                                    {new Date(record.date || record.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: 'var(--text)', fontSize: '0.85rem', fontWeight: '600' }}>
                                    {record.diagnosis || record.type || 'Clinical Note'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {record.doctorName || record.doctorId?.name || 'Assigned Specialist'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                    <span style={{ 
                                        padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', 
                                        background: record.status === 'Resolved' || record.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', 
                                        color: record.status === 'Resolved' || record.status === 'Completed' ? '#10B981' : '#F59E0B' 
                                    }}>
                                        {record.status || 'Reviewed'}
                                    </span>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                        {onEdit && <button onClick={() => onEdit(record)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={15} /></button>}
                                        {onDelete && <button onClick={() => onDelete(record._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Trash2 size={15} /></button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecordsTable;
