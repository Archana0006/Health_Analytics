import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { usePatientInfo, usePatientRecords } from '../hooks/useHealthData';
import { Activity, Heart, Droplet, Scale, AlertTriangle } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Analytics = () => {
    const { user } = useAuth();
    const { patientId } = useParams();
    const targetId = patientId || user?.id;

    const { data: patientData, isLoading: loadingUser } = usePatientInfo(targetId);
    const { data: records = [], isLoading: loadingRecords } = usePatientRecords(targetId);

    if (loadingUser || loadingRecords) return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(108,99,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            Loading Analytics...
        </div>
    );

    // Prepare chart data 
    const displayRecords = [...records].reverse();
    const labels = displayRecords.length > 0
        ? displayRecords.map(r => new Date(r.date).toLocaleDateString())
        : ['Initial'];

    const systolicData = displayRecords.length > 0
        ? displayRecords.map(r => r.bloodPressure?.systolic || 0)
        : [patientData?.vitals?.bloodPressure?.systolic || 0];

    const sugarData = displayRecords.length > 0
        ? displayRecords.map(r => r.sugarLevel || 0)
        : [0];

    const heartRateData = displayRecords.length > 0
        ? displayRecords.map(r => r.heartRate || 0)
        : [patientData?.vitals?.heartRate || 0];

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Systolic BP',
                data: systolicData,
                borderColor: '#6C63FF',
                backgroundColor: 'rgba(108, 99, 255, 0.06)',
                fill: true, tension: 0.4, borderWidth: 2.5,
                pointRadius: 4, pointBackgroundColor: '#6C63FF',
            },
            {
                label: 'Sugar (mg/dL)',
                data: sugarData,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
                fill: true, tension: 0.4, borderWidth: 2.5,
                pointRadius: 4, pointBackgroundColor: '#10B981',
            },
            {
                label: 'Heart Rate (bpm)',
                data: heartRateData,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.06)',
                fill: true, tension: 0.4, borderWidth: 2.5,
                pointRadius: 4, pointBackgroundColor: '#EF4444',
            }
        ]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#A3B1CC', font: { size: 12, weight: '500' }, padding: 20, usePointStyle: true, pointStyle: 'circle' } },
            tooltip: { backgroundColor: '#1A2340', titleColor: '#E8ECF4', bodyColor: '#A3B1CC', padding: 12, cornerRadius: 10, borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1 }
        },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4A5670', font: { size: 11 } }, border: { display: false } },
            x: { grid: { display: false }, ticks: { color: '#4A5670', font: { size: 11 } }, border: { display: false } }
        }
    };

    // Calculate BMI
    const calculateBMI = (height, weight) => {
        if (!height || !weight) return 'N/A';
        const heightMeters = height / 100;
        return (weight / (heightMeters * heightMeters)).toFixed(1);
    };

    const latestBMI = records[0]?.bmi || calculateBMI(patientData?.vitals?.heightCm, patientData?.vitals?.weightKg);
    const criticalAlertsCount = records.filter(r => (r.bloodPressure?.systolic > 140 || r.sugarLevel > 140)).length;

    const summaryCards = [
        {
            label: 'BP Stability',
            value: systolicData.length > 1 ? (systolicData[systolicData.length-1] > systolicData[systolicData.length-2] ? 'Increasing' : 'Improving') : 'Stable',
            unit: '',
            icon: <Heart size={18} />,
            gradient: 'linear-gradient(135deg, #6C63FF, #5A52E0)',
            glow: 'rgba(108,99,255,0.15)'
        },
        {
            label: 'Avg Heart Rate',
            value: heartRateData.length > 0 ? Math.round(heartRateData.reduce((a, b) => a + b, 0) / heartRateData.length) : '--',
            unit: 'bpm',
            icon: <Activity size={18} />,
            gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
            glow: 'rgba(239,68,68,0.15)'
        },
        {
            label: 'Clinical Alerts',
            value: criticalAlertsCount,
            unit: 'detected',
            icon: <AlertTriangle size={18} />,
            gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
            glow: 'rgba(245,158,11,0.15)'
        }
    ];

    return (
        <div style={{ width: '100%' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                    Clinical Vital Intelligence
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Longitudinal trend analysis for <span style={{ color: 'var(--primary-light)', fontWeight: '600' }}>{patientData?.name || 'Patient'}</span>
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'var(--primary-muted)', color: 'var(--primary-light)' }}><Activity size={16} /></div>
                        Multi-Vital Trends
                    </h3>
                    <div style={{ height: '350px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'var(--secondary-glow)', color: 'var(--secondary)' }}><Activity size={16} /></div>
                        Risk Assessment Summary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {summaryCards.map((card, i) => (
                            <div key={i} style={{
                                padding: '1.15rem', borderRadius: '14px',
                                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                                transition: 'var(--transition)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: card.gradient, color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 4px 12px ${card.glow}`
                                    }}>
                                        {card.icon}
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>{card.label}</p>
                                </div>
                                <p style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                                    {card.value} {card.unit && <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '500' }}>{card.unit}</span>}
                                </p>
                            </div>
                        ))}
                        
                        <div style={{ 
                            marginTop: '0.5rem', padding: '1rem', borderRadius: '12px', 
                            background: 'rgba(108,99,255,0.05)', border: '1px dashed rgba(108,99,255,0.2)' 
                        }}>
                             <p style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: '600', marginBottom: '0.25rem' }}>Clinical Recommendation</p>
                             <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                {criticalAlertsCount > 0 ? 'Urgent review of high-risk vitals needed.' : 'Maintain current treatment plan. Next review in 30 days.'}
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Analytics;
