import React from 'react';
import { Pill } from 'lucide-react';

const PrescriptionsList = ({ prescriptions = [] }) => {
    // Flatten medications out of prescriptions
    const allMeds = prescriptions.flatMap(p => 
        (p.medications || []).map((m, index) => ({
            ...m,
            _id: `${p._id}-${index}`, // unique key
            startDate: p.startDate
        }))
    );
    return (
        <div className="card" style={{ padding: '1.25rem', height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(168,85,247,0.1)', color: '#A855F7' }}>
                    <Pill size={16} />
                </div>
                Active Prescriptions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {allMeds.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No active prescriptions.</div>
                ) : allMeds.slice(0, 4).map(px => (
                    <div key={px._id} style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.85rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' 
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168,85,247,0.08)', 
                            color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <Pill size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {px.medicineName} <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem' }}>{px.dosage}</span>
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {px.frequency}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-light)' }}>
                                {px.durationDays ? `${px.durationDays} Days` : 'Ongoing'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrescriptionsList;
