import React, { useState } from 'react';
import { usePrediction } from '../hooks/useHealthData';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import {
    Brain, ShieldAlert, Activity, Heart, Droplet,
    Scale, User, Thermometer, CheckCircle, AlertTriangle, Sparkles,
    ArrowRight, Info, TrendingDown, Target, Zap
} from 'lucide-react';

const Predictions = () => {
    const [formData, setFormData] = useState({
        age: 45, bmi: 25, sugar: 100,
        blood_pressure: 120, cholesterol: 180, hemoglobin: 14
    });
    const [result, setResult] = useState(null);

    const { user } = useAuth();
    const predictMutation = usePrediction();
    const loading = predictMutation.isPending;
    const [reportLoading, setReportLoading] = useState(false);

    const handlePredict = async (type) => {
        setResult(null);
        try {
            const data = await predictMutation.mutateAsync({ type, formData });
            setResult({ ...data, type });
        } catch (error) {
            console.error('Prediction error', error);
        }
    };

    const handleDownloadReport = async () => {
        const patientId = user?.id;
        if (!patientId) return;
        setReportLoading(true);
        try {
            const response = await apiClient.get(`/records/report/${patientId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'HealthReport.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Report download error:', error);
            alert('Could not generate the report. Please ensure you have medical records on file.');
        } finally {
            setReportLoading(false);
        }
    };

    const inputFields = [
        { label: 'Patient Age', name: 'age', icon: <User size={16} />, type: 'number', unit: 'yrs' },
        { label: 'Body Mass Index', name: 'bmi', icon: <Scale size={16} />, type: 'number', unit: 'kg/m²' },
        { label: 'Plasma Glucose', name: 'sugar', icon: <Activity size={16} />, type: 'number', unit: 'mg/dL' },
        { label: 'Systolic BP', name: 'blood_pressure', icon: <Heart size={16} />, type: 'number', unit: 'mmHg' },
        { label: 'Total Cholesterol', name: 'cholesterol', icon: <Droplet size={16} />, type: 'number', unit: 'mg/dL' },
        { label: 'Hemoglobin', name: 'hemoglobin', icon: <Thermometer size={16} />, type: 'number', step: '0.1', unit: 'g/dL' },
    ];

    const riskColor = result?.risk_score > 60 ? '#EF4444' : (result?.risk_score > 30 ? '#F59E0B' : '#10B981');
    const riskBg = result?.risk_score > 60 ? 'rgba(239,68,68,0.1)' : (result?.risk_score > 30 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)');

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'var(--primary-muted)', color: 'var(--primary-light)' }}>
                        <Brain size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                            Clinical <span className="gradient-text">Insights</span>
                        </h1>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Advanced Diagnostic Engine v2.0
                        </span>
                    </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Leveraging neural networks to provide early risk assessment across metabolic and cardiovascular indicators.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '7fr 4fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Clinical Parameter Input */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Activity size={18} className="gradient-text" /> Diagnostic Parameters
                            </h3>
                            <div style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '20px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: '600' }}>
                                Secure Analysis
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            {inputFields.map((field) => (
                                <div key={field.name}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                                        {field.label}
                                        <span style={{ color: 'var(--text-dim)', fontWeight: '500' }}>{field.unit}</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-light)', opacity: 0.7 }}>
                                            {field.icon}
                                        </div>
                                        <input
                                            type={field.type}
                                            step={field.step}
                                            className="input"
                                            value={formData[field.name]}
                                            onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                            style={{ height: '48px', paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <button onClick={() => handlePredict('diabetes')} className="btn btn-primary" disabled={loading} style={{ height: '52px', fontWeight: '700' }}>
                                <Zap size={18} /> Diabetes Protocol
                            </button>
                            <button onClick={() => handlePredict('heart-disease')} className="btn" disabled={loading} style={{ height: '52px', fontWeight: '700', background: 'var(--bg-elevated)' }}>
                                <Heart size={18} /> Cardiac Shield
                            </button>
                            <button onClick={() => handlePredict('hypertension')} className="btn" disabled={loading} style={{ height: '52px', fontWeight: '700', background: 'var(--bg-elevated)' }}>
                                <TrendingDown size={18} /> Hypertension
                            </button>
                        </div>
                    </div>

                    {/* Educational Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(108,99,255,0.05) 0%, transparent 100%)' }}>
                            <Info size={20} color="var(--primary-light)" style={{ marginBottom: '0.75rem' }} />
                            <h4 style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9rem' }}>How it works?</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Our model analyzes historical clinical data from thousands of patients to identify subtle patterns that precede chronic conditions.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <ShieldAlert size={20} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
                            <h4 style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Clinical Accuracy</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Results are for screening purposes only. Current model accuracy for metabolic conditions is 94.2% based on cross-validation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Diagnostic Intelligence Output */}
                <div className="card" style={{ 
                    padding: '2.5rem', display: 'flex', flexDirection: 'column', 
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    border: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
                }}>
                    {!result && !loading && (
                        <>
                            <div style={{
                                width: '100px', height: '100px', borderRadius: '24px',
                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                                transform: 'rotate(10deg)'
                            }}>
                                <Brain size={48} style={{ color: 'var(--primary)', opacity: 0.4 }} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.75rem' }}>Awaiting Input</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '280px', lineHeight: 1.6 }}>
                                Select a diagnostic protocol to initiate the neural analysis process.
                            </p>
                        </>
                    )}

                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                            <div className="loader" style={{ width: '64px', height: '64px' }} />
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.35rem' }}>Neural Processing...</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Correlation of 15+ metrics across clinical datasets.</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div style={{ width: '100%', animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ 
                                    width: '180px', height: '180px', borderRadius: '50%', margin: '0 auto 1.5rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                                }}>
                                    <svg width="180" height="180" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke={riskColor} strokeWidth="8" 
                                            strokeDasharray={`${result.risk_score * 2.82} 282`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                                    </svg>
                                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: '900', color: riskColor, display: 'block' }}>{result.risk_score}%</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Risk Factor</span>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 1.25rem', borderRadius: '30px',
                                    background: riskBg, marginBottom: '1rem', border: `1px solid ${riskColor}33`
                                }}>
                                    {result.risk_score > 60 ? <AlertTriangle size={18} color={riskColor} /> : <CheckCircle size={18} color={riskColor} />}
                                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: riskColor }}>
                                        {result.risk_score > 60 ? 'High' : (result.risk_score > 30 ? 'Moderate' : 'Stable')} Condition
                                    </span>
                                </div>
                            </div>

                            <div className="card" style={{ background: 'var(--bg-elevated)', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Target size={14} className="gradient-text" /> Clinical Recommendation
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{result.recommendation}"</p>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', height: '48px', gap: '0.5rem' }}
                                onClick={handleDownloadReport}
                                disabled={reportLoading}
                            >
                                {reportLoading ? 'Generating...' : <> Detailed Report <ArrowRight size={18} /> </>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Predictions;
