import React from 'react';
import { User, Droplet, Calendar, Activity } from 'lucide-react';

const PatientCard = ({ patientInfo }) => {
    // Generate some mock data if patientInfo doesn't have it
    const age = patientInfo?.dateOfBirth ? 
        new Date().getFullYear() - new Date(patientInfo.dateOfBirth).getFullYear() : 
        (patientInfo?.age || 34);
    
    const gender = patientInfo?.gender || 'Male';
    const bloodGroup = patientInfo?.bloodGroup || 'O+';
    const lastVisit = patientInfo?.lastVisit ? new Date(patientInfo.lastVisit).toLocaleDateString() : 'Today';

    return (
        <div className="card" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem', 
            padding: '1.5rem',
            background: 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)',
            border: '1px solid rgba(108,99,255,0.15)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute', top: '-50%', right: '-10%', width: '200px', height: '200px',
                background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none'
            }} />

            {/* Avatar */}
            <div style={{
                width: '75px', height: '75px', borderRadius: '18px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '2rem', fontWeight: '800',
                boxShadow: '0 8px 24px rgba(108,99,255,0.25)',
                flexShrink: 0
            }}>
                {patientInfo?.name?.[0]?.toUpperCase() || 'P'}
            </div>

            {/* Details */}
            <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
                    {patientInfo?.name || 'Patient Overview'}
                </h2>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <User size={15} style={{ color: 'var(--primary-light)' }} />
                        <span style={{ fontWeight: '600' }}>{age} yrs, {gender}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Droplet size={15} style={{ color: '#EF4444' }} />
                        <span style={{ fontWeight: '600' }}>Blood: {bloodGroup}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Calendar size={15} style={{ color: '#10B981' }} />
                        <span style={{ fontWeight: '600' }}>Last Visit: {lastVisit}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Activity size={15} style={{ color: '#F59E0B' }} />
                        <span style={{ fontWeight: '600', color: '#F59E0B' }}>Status: Monitored</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientCard;
