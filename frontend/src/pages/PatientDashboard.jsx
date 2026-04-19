import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    useNotifications,
    usePatientRecords,
    useReminders,
    useAddReminder,
    useAppointments,
    useRecentDocuments,
    useMLScore,
    useDashboardStats
} from '../hooks/useHealthData';
import {
    Users, AlertCircle, FileText, CheckCircle, Bell, Download, Clock,
    TrendingUp, Calendar, FolderOpen, ClipboardList, Cpu, ChevronRight,
    Plus, Upload, BarChart3, Stethoscope, ArrowRight, Sparkles
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/* ── Helpers ── */
const categoryIcon = (cat) => {
    switch (cat) {
        case 'Lab Report': return '🧪';
        case 'Prescription': return '💊';
        case 'Medical Imaging': return '🔬';
        case 'Insurance': return '🏥';
        default: return '📄';
    }
};

const Dashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const { data: notifications = [], isLoading: loadingNotifs } = useNotifications();
    const { data: records = [], isLoading: loadingRecords } = usePatientRecords(user?.role === 'patient' ? user.id : null);
    const { data: reminders = [], isLoading: loadingReminders } = useReminders();
    const addReminderMutation = useAddReminder();
    const { data: upcomingAppointments = [], isLoading: loadingAppts } = useAppointments(user?.role, user?.id);
    const { data: recentDocuments = [], isLoading: loadingDocs } = useRecentDocuments(user?.role === 'patient' ? user.id : null);
    const { data: statsData } = useDashboardStats(user?.role);
    const { data: aiHealthScore, isLoading: loadingScore } = useMLScore(user?.role === 'patient' ? user.id : null);

    const [showReminderInput, setShowReminderInput] = useState(false);
    const [newReminderTitle, setNewReminderTitle] = useState('');

    const handleAddReminder = async (e) => {
        e.preventDefault();
        if (!newReminderTitle.trim()) return;
        try {
            await addReminderMutation.mutateAsync({
                title: newReminderTitle,
                time: new Date().toLocaleTimeString(),
                type: 'follow-up'
            });
            setNewReminderTitle('');
            setShowReminderInput(false);
            toast.success('Reminder added');
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0] ? Object.values(err.response.data.errors[0])[0] : err.response?.data?.message || 'Failed to add reminder';
            toast.error(`Error: ${errorMsg}`);
            console.error(err.response?.data);
        }
    };

    // Only block on core patient data, not AI score (which depends on external service)
    const loading = loadingRecords || loadingAppts;

    const generateReport = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();
        const pageWidth = doc.internal.pageSize.width;

        // ── Header: Hospital Information ──
        doc.setFillColor(248, 250, 252); // Light background for header
        doc.rect(0, 0, pageWidth, 45, 'F');
        
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 56, 202); // Darker Indigo
        doc.text("ST. MARY'S DIGITAL HOSPITAL", 14, 22);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text('123 Health Innovation Way, Digital City, State 45678', 14, 28);
        doc.text('Phone: (555) 012-3456 | Email: clinical@healthanalytics.com', 14, 33);
        
        doc.setDrawColor(67, 56, 202);
        doc.setLineWidth(1.5);
        doc.line(0, 45, pageWidth, 45); // Header separator line

        // ── Report Metadata ──
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59);
        doc.text('Patient Health Summary Report', 14, 60);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Report ID: HAR-${Math.floor(Date.now() / 1000)}`, pageWidth - 60, 60);
        
        // Patient Info Box
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.roundedRect(14, 65, pageWidth - 28, 25, 3, 3);
        
        doc.setFont('helvetica', 'bold');
        doc.text('PATIENT NAME:', 20, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(user?.name?.toUpperCase() || 'VALUED PATIENT', 55, 75);
        
        doc.setFont('helvetica', 'bold');
        doc.text('REPORT DATE:', 20, 82);
        doc.setFont('helvetica', 'normal');
        doc.text(timestamp, 55, 82);
        
        doc.setFont('helvetica', 'bold');
        doc.text('GENDER:', pageWidth / 2 + 10, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(user?.gender || 'N/A', pageWidth / 2 + 35, 75);

        // ── AI Health Score Section ──
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 56, 202);
        doc.text('AI CLINICAL INSIGHTS', 14, 105);
        
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(`Composite Health Score:`, 14, 115);
        
        // Score Badge
        const score = typeof aiHealthScore?.score === 'string' ? aiHealthScore.score : `${aiHealthScore?.score || 0}%`;
        doc.setFillColor(238, 242, 255);
        doc.roundedRect(65, 110, 20, 8, 2, 2, 'F');
        doc.setTextColor(67, 56, 202);
        doc.text(score, 67, 116);

        doc.setFontSize(10);
        doc.setTextColor(100);
        const recommendationRows = doc.splitTextToSize(`Clinical Recommendation: ${aiHealthScore?.recommendation || 'Continuous monitoring of vitals advised.'}`, pageWidth - 28);
        doc.text(recommendationRows, 14, 125);

        // ── Tables ──
        let finalY = 125 + (recommendationRows.length * 5) + 12;
        
        // Upcoming Visits
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 56, 202);
        doc.text('UPCOMING CLINICAL VISITS', 14, finalY);

        const apptData = upcomingAppointments.length > 0 ?
            upcomingAppointments.map(appt => [
                { content: `Dr. ${appt.doctorId?.name || 'Demo Doctor'}`, styles: { fontStyle: 'bold' } },
                new Date(appt.date).toLocaleDateString(),
                appt.time,
                { content: appt.status.toUpperCase(), styles: { textColor: [108, 99, 255] } }
            ]) : [['No upcoming appointments scheduled', '', '', '']];

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Practitioner', 'Scheduled Date', 'Time Slot', 'Status']],
            body: apptData,
            theme: 'striped',
            headStyles: { fillColor: [67, 56, 202], fontSize: 10 },
            bodyStyles: { fontSize: 9, cellPadding: 4 },
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });

        // Medical Records
        finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text('RECENT VITAL SIGNS & OBSERVATIONS', 14, finalY);

        const recordData = records.length > 0 ?
            records.slice(0, 10).map(r => [
                new Date(r.date).toLocaleDateString(),
                r.type || 'Clinical Checkup',
                r.bloodPressure ? `${r.bloodPressure.systolic}/${r.bloodPressure.diastolic} mmHg` : 'N/A',
                r.sugarLevel ? `${r.sugarLevel} mg/dL` : 'N/A',
                r.notes || 'Routine observation'
            ]) : [['No records available', '', '', '', '']];

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Date', 'Visit Type', 'Blood Pressure', 'Sugar Level', 'Clinical Notes']],
            body: recordData,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129], fontSize: 10 },
            bodyStyles: { fontSize: 9, cellPadding: 4 },
            styles: { lineColor: [226, 232, 240], lineWidth: 0.1 }
        });

        // ── Signature Section ──
        const signatureY = doc.internal.pageSize.height - 50;
        doc.setDrawColor(200);
        doc.setLineWidth(0.5);
        doc.line(pageWidth - 85, signatureY, pageWidth - 14, signatureY);
        
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('Digitally Verified By', pageWidth - 85, signatureY + 5);
        
        doc.setFontSize(12);
        doc.setFont('times', 'italic'); // Mock cursive/signature style
        doc.setTextColor(67, 56, 202);
        doc.text('Dr. Sarah Johnson, MD', pageWidth - 80, signatureY - 5);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150);
        doc.text('Chief Medical Officer', pageWidth - 85, signatureY + 10);

        // ── Footer ──
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount} | Confidential – HealthAI Clinical Pro`, 14, doc.internal.pageSize.height - 10);
        }

        doc.save(`Clinical_Report_${user?.name?.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    };

    const handleDownloadReport = () => {
        generateReport();
    };

    /* ── Stat cards config ── */
    const stats = user?.role === 'doctor' ? [
        { label: 'Total Patients', value: statsData?.totalPatients || 0, icon: <Users size={22} />, gradient: 'linear-gradient(135deg, #6C63FF, #5A52E0)', glow: 'rgba(108,99,255,0.2)' },
        { label: 'High Risk Alerts', value: statsData?.highRiskAlerts || 0, icon: <AlertCircle size={22} />, gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', glow: 'rgba(239,68,68,0.2)' },
        { label: 'Recent Reports', value: statsData?.recentReports || 0, icon: <FileText size={22} />, gradient: 'linear-gradient(135deg, #10B981, #059669)', glow: 'rgba(16,185,129,0.2)' },
        { label: 'Upcoming Visits', value: upcomingAppointments.length, icon: <Calendar size={22} />, gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', glow: 'rgba(245,158,11,0.2)' },
    ] : user?.role === 'admin' ? [
        { label: 'Total Users', value: statsData?.totalUsers || 0, icon: <Users size={22} />, gradient: 'linear-gradient(135deg, #6C63FF, #5A52E0)', glow: 'rgba(108,99,255,0.2)' },
        { label: 'Total Records', value: statsData?.totalRecords || 0, icon: <FileText size={22} />, gradient: 'linear-gradient(135deg, #10B981, #059669)', glow: 'rgba(16,185,129,0.2)' },
        { label: 'System Alerts', value: statsData?.recentAlerts?.length || 0, icon: <AlertCircle size={22} />, gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', glow: 'rgba(239,68,68,0.2)' },
        { label: 'Doctors', value: statsData?.totalDoctors || 0, icon: <Stethoscope size={22} />, gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', glow: 'rgba(245,158,11,0.2)' },
    ] : [
        { label: 'AI Health Score', value: `${aiHealthScore?.score || 0}%`, icon: <TrendingUp size={22} />, gradient: 'linear-gradient(135deg, #10B981, #059669)', glow: 'rgba(16,185,129,0.2)' },
        { label: 'Upcoming Visits', value: upcomingAppointments.length, icon: <Calendar size={22} />, gradient: 'linear-gradient(135deg, #6C63FF, #5A52E0)', glow: 'rgba(108,99,255,0.2)' },
        { label: 'Active Reminders', value: reminders.length, icon: <Clock size={22} />, gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', glow: 'rgba(59,130,246,0.2)' },
        { label: 'Recent Alerts', value: notifications.length, icon: <Bell size={22} />, gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', glow: 'rgba(239,68,68,0.2)' },
    ];

    /* ── Chart ── */
    const chartData = {
        labels: records.length > 0 ? [...records].reverse().map(r => new Date(r.date).toLocaleDateString()) : ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
            label: 'Health Metric',
            data: records.length > 0 ? [...records].reverse().map(r => r.bloodPressure?.systolic || r.sugarLevel) : [100, 120, 150, 180, 200],
            borderColor: '#6C63FF',
            backgroundColor: 'rgba(108, 99, 255, 0.08)',
            fill: true,
            tension: 0.45,
            pointRadius: 4,
            pointBackgroundColor: '#6C63FF',
            pointBorderColor: 'rgba(108,99,255,0.3)',
            pointBorderWidth: 3,
            borderWidth: 2.5,
        }]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'var(--bg-elevated)',
                titleColor: '#E8ECF4',
                bodyColor: '#A3B1CC',
                padding: 12,
                cornerRadius: 10,
                borderColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
                ticks: { color: '#4A5670', font: { size: 11 } },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#4A5670', font: { size: 11 } },
                border: { display: false }
            }
        }
    };

    const quickActions = [
        { label: 'Book Appointment', icon: <Calendar size={20} />, gradient: 'linear-gradient(135deg, #6C63FF, #5A52E0)', path: '/appointments' },
        { label: 'Upload Document', icon: <Upload size={20} />, gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', path: '/documents' },
        { label: 'Add Record', icon: <Plus size={20} />, gradient: 'linear-gradient(135deg, #10B981, #059669)', path: '/records' },
        { label: 'View Analytics', icon: <BarChart3 size={20} />, gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', path: '/analytics' },
    ];

    return (
        <div style={{ width: '100%' }}>
            {/* ── Header ── */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                        Welcome, <span style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>{user?.name}</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Here's your health dashboard overview
                    </p>
                </div>
                <button
                    onClick={handleDownloadReport}
                    className="btn btn-primary"
                    style={{ padding: '0.7rem 1.25rem', borderRadius: '12px' }}
                >
                    <Download size={17} /> Download Report
                </button>
            </header>

            {/* ── Stats Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.35rem',
                        animation: `fadeInUp 0.4s ease ${i * 0.08}s both`
                    }}>
                        <div style={{
                            width: '50px', height: '50px', borderRadius: '14px',
                            background: stat.gradient, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 6px 20px ${stat.glow}`, flexShrink: 0
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', lineHeight: 1 }}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Middle: Chart + Appointments ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'var(--primary-muted)', color: 'var(--primary-light)' }}>
                                <TrendingUp size={16} />
                            </div>
                            Health Improvement Trend
                        </h3>
                    </div>
                    <div style={{ height: '280px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                                <Calendar size={16} />
                            </div>
                            Upcoming
                        </h3>
                        <Link to="/appointments" style={{ fontSize: '0.75rem', color: 'var(--primary-light)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {upcomingAppointments.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0.5rem' }}>
                                <Calendar size={36} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.85rem' }}>No upcoming appointments</p>
                            </div>
                        ) : upcomingAppointments.slice(0, 3).map((appt, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '0.85rem',
                                padding: '0.85rem', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)'
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Calendar size={16} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        Dr. {appt.doctorId?.name || 'Demo Doctor'}
                                    </p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        {new Date(appt.date).toLocaleDateString()} · {appt.time}
                                    </p>
                                </div>
                                <span style={{
                                    padding: '3px 8px', borderRadius: '20px', fontSize: '0.6rem',
                                    fontWeight: '700', textTransform: 'uppercase',
                                    background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                                    letterSpacing: '0.03em', whiteSpace: 'nowrap'
                                }}>{appt.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Bottom: Documents + Quick Actions + Alerts ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                {/* Recent Documents */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ padding: '0.3rem', borderRadius: '6px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}><FolderOpen size={15} /></div>
                            Recent Documents
                        </h3>
                        <Link to="/documents" style={{ fontSize: '0.75rem', color: 'var(--primary-light)', textDecoration: 'none', fontWeight: '600' }}>View all →</Link>
                    </div>
                    {recentDocuments.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1.5rem' }}>
                            <FolderOpen size={36} style={{ opacity: 0.1, marginBottom: '0.75rem' }} />
                            <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>No documents yet</p>
                            <Link to="/documents" className="btn btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>Upload Now</Link>
                        </div>
                    ) : recentDocuments.slice(0, 3).map((doc, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '0.85rem',
                            padding: '0.65rem 0',
                            borderBottom: i < 2 ? '1px solid var(--border)' : 'none'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{categoryIcon(doc.category)}</span>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{new Date(doc.uploadDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ padding: '0.3rem', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: '#10B981' }}><Sparkles size={15} /></div>
                        Quick Actions
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {quickActions.map((action, i) => (
                            <Link key={i} to={action.path} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                                    padding: '1.1rem 0.75rem', borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                                    transition: 'var(--transition)', cursor: 'pointer'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-active)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '10px',
                                        background: action.gradient, color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {action.icon}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'center' }}>{action.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Reminders + Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ padding: '0.3rem', borderRadius: '6px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}><Clock size={14} /></div>
                                Reminders
                            </h3>
                            <button onClick={() => setShowReminderInput(!showReminderInput)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}>
                                <Plus size={16} />
                            </button>
                        </div>
                        {showReminderInput && (
                            <form onSubmit={handleAddReminder} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                                <input
                                    autoFocus
                                    className="input"
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', height: 'auto', flex: 1 }}
                                    placeholder="e.g. Take Vitamins"
                                    value={newReminderTitle}
                                    onChange={e => setNewReminderTitle(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} disabled={addReminderMutation.isPending}>
                                    Add
                                </button>
                            </form>
                        )}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {reminders.length === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No reminders scheduled.</p>
                            ) : reminders.map((r, i) => (
                                <div key={i} style={{ padding: '0.45rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {r.title}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card" style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.85rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ padding: '0.3rem', borderRadius: '6px', background: 'var(--danger-bg)', color: 'var(--danger)' }}><Bell size={14} /></div>
                            Alerts
                        </h3>
                        {notifications.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                <CheckCircle size={24} style={{ opacity: 0.15, marginBottom: '0.5rem', display: 'block', margin: '0 auto' }} />
                                No active alerts at this time.
                            </div>
                        ) : notifications.slice(0, 1).map((n, i) => (
                            <div key={i} style={{ fontSize: '0.8rem', color: 'var(--danger)', background: 'var(--danger-bg)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.1)' }}>{n.message}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
