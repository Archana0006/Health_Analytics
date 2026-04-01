import React from 'react';
import { FlaskConical } from 'lucide-react';

const LabsSummary = ({ labs = [] }) => {
    const displayLabs = labs;

    return (
        <div className="card" style={{ padding: '1.25rem', height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(236,72,153,0.1)', color: '#EC4899' }}>
                    <FlaskConical size={16} />
                </div>
                Lab Results
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {displayLabs.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No lab records found.</div>
                ) : displayLabs.slice(0, 4).map(lab => {
                    const isAbnormal = lab.abnormal || lab.resultId?.abnormal;
                    return (
                        <div key={lab._id} style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                            padding: '0.85rem', borderRadius: '12px', background: 'var(--bg-card)', 
                            border: `1px solid ${isAbnormal ? 'rgba(239,68,68,0.2)' : 'var(--border)'}` 
                        }}>
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.2rem' }}>
                                    {lab.testName} <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '500' }}>({lab.testCode})</span>
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {new Date(lab.orderedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                {isAbnormal ? (
                                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                                        Critical
                                    </span>
                                ) : (
                                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                                        Normal
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LabsSummary;
