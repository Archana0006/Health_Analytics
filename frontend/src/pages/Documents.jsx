import React, { useState } from 'react';
import { Upload, FileText, Search, Filter, Download, Trash2, Eye, X, Calendar, FlaskConical, Pill, Scan, Shield, File } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import {
    useRecentDocuments,
    usePatientInfo,
    useAddDocument,
    useDeleteDocument
} from '../hooks/useHealthData';

const Documents = () => {
    const { user, token } = useAuth();
    const { patientId } = useParams();
    const effectivePatientId = patientId || user?.id;

    // TanStack Query Hooks
    const { data: documents = [], isLoading: docsLoading } = useRecentDocuments(effectivePatientId);
    const { data: patientInfo } = usePatientInfo(patientId);

    // Mutation Hooks
    const uploadMutation = useAddDocument();
    const deleteMutation = useDeleteDocument();

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const [formData, setFormData] = useState({
        category: 'Lab Report',
        title: '',
        description: '',
        tags: '',
        file: null
    });

    const categories = ['All', 'Lab Report', 'Prescription', 'Medical Imaging', 'Insurance', 'Other'];

    // Local derived state for filtering
    const filteredDocs = documents.filter(doc => {
        const matchesCategory = categoryFilter === 'All' || doc.category === categoryFilter;
        const matchesSearch = searchQuery === '' ||
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append('file', formData.file);
            data.append('category', formData.category);
            data.append('title', formData.title || formData.file.name);
            data.append('description', formData.description);
            data.append('tags', formData.tags);
            data.append('patientId', effectivePatientId);

            await uploadMutation.mutateAsync(data);

            setShowUploadModal(false);
            setFormData({ category: 'Lab Report', title: '', description: '', tags: '', file: null });
        } catch (err) {
            console.error('Error uploading document:', err);
            toast.error(err.response?.data?.error || 'Failed to upload document');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await deleteMutation.mutateAsync(id);
        } catch (err) {
            console.error('Error deleting document:', err);
            toast.error('Failed to delete document');
        }
    };

    const handleDownload = (id) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.open(`${API_URL}/api/documents/${id}/download`, '_blank');
    };

    const handlePreview = (doc) => {
        setSelectedDoc(doc);
        setShowPreviewModal(true);
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Lab Report': return <FlaskConical size={32} color="#6C63FF" />;
            case 'Prescription': return <Pill size={32} color="#FF6B9D" />;
            case 'Medical Imaging': return <Scan size={32} color="#3B82F6" />;
            case 'Insurance': return <Shield size={32} color="#10B981" />;
            default: return <FileText size={32} color="#F59E0B" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div style={{ width: '100%' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                        Medical Vault
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {patientId ? `Secure archives for ${patientInfo?.name || 'Patient'}` : 'Your encrypted health records and clinical documentation'}
                    </p>
                </div>
                <button onClick={() => setShowUploadModal(true)} className="btn btn-primary" style={{ padding: '0.7rem 1.5rem', borderRadius: '12px' }}>
                    <Upload size={18} /> Secure Upload
                </button>
            </header>

            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            className="input"
                            placeholder="Search by title, date, or category..."
                            style={{ paddingLeft: '3rem', height: '46px', fontSize: '0.9rem' }}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <select
                            className="input"
                            style={{ paddingLeft: '2.75rem', height: '46px', appearance: 'none', fontSize: '0.9rem' }}
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat} Documents</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {filteredDocs.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-elevated)', borderRadius: '20px', border: '2px dashed var(--border)' }}>
                        <FileText size={56} style={{ color: 'var(--text-dim)', marginBottom: '1rem', opacity: 0.3 }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>No documents found</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your filters or upload a new record.</p>
                    </div>
                ) : (
                    filteredDocs.map(doc => (
                        <div key={doc._id} className="card" style={{
                            cursor: 'pointer', transition: 'var(--transition)',
                            padding: '1.15rem', border: '1px solid var(--border)'
                        }}
                            onClick={() => handlePreview(doc)}
                        >
                            <div style={{
                                height: '140px', background: 'var(--bg-elevated)', borderRadius: '14px', marginBottom: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                                overflow: 'hidden', border: '1px solid var(--border)'
                            }}>
                                <div style={{ transform: 'scale(1.2)' }}>{getCategoryIcon(doc.category)}</div>
                                <div style={{
                                    position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                                    background: 'var(--bg-card)', padding: '0.25rem 0.6rem',
                                    borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800',
                                    color: 'var(--text-dim)', backdropFilter: 'blur(4px)', border: '1px solid var(--border)'
                                }}>
                                    {formatFileSize(doc.fileSize)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1, marginRight: '0.75rem' }}>
                                    <h4 style={{ fontWeight: '700', color: 'var(--text)', marginBottom: '0.35rem', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {doc.title}
                                    </h4>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Calendar size={13} /> {new Date(doc.uploadDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => handleDownload(doc._id)} className="btn" style={{ padding: '0.5rem', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }} title="Download"><Download size={16} /></button>
                                    <button onClick={() => handleDelete(doc._id)} className="btn" style={{ padding: '0.5rem', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)' }} title="Delete"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeInUp 0.3s ease-out' }}>
                    <div style={{ width: '580px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)' }}>Secure Upload</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Store your medical files in the encrypted vault</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpload}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Document Type</label>
                                    <select name="category" value={formData.category} className="input" onChange={handleInputChange} required style={{ height: '46px' }}>
                                        {categories.filter(c => c !== 'All').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Display Title</label>
                                    <input name="title" value={formData.title} className="input" placeholder="e.g. Blood Test - Jan" onChange={handleInputChange} style={{ height: '46px' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Additional Notes</label>
                                <textarea name="description" value={formData.description} className="input" rows="2" placeholder="Describe the document contents..." onChange={handleInputChange} style={{ padding: '0.85rem' }} />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Source File</label>
                                <div
                                    style={{
                                        border: '2px dashed var(--border)', padding: '2.5rem 1.5rem', borderRadius: '16px',
                                        textAlign: 'center', cursor: 'pointer', background: 'var(--bg-elevated)',
                                        transition: 'var(--transition)', position: 'relative'
                                    }}
                                    onClick={() => document.getElementById('doc-upload').click()}
                                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <div style={{
                                        width: '56px', height: '56px', background: 'var(--primary-muted)',
                                        color: 'var(--primary-light)', borderRadius: '16px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                                    }}>
                                        <Upload size={28} />
                                    </div>
                                    <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.35rem' }}>
                                        {formData.file ? formData.file.name : 'Click to browse files'}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF, JPEG, PNG, or DOC (Max 10MB)</p>
                                    <input id="doc-upload" type="file" onChange={handleFileChange} required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: 'none' }} />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={uploadMutation.isPending} style={{ width: '100%', height: '52px', fontSize: '1rem', fontWeight: '700', gap: '0.75rem' }}>
                                {uploadMutation.isPending ? 'Finalizing Encryption...' : (
                                    <>
                                        <Shield size={20} /> Upload to Secure Vault
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && selectedDoc && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(16px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '2rem', animation: 'fadeInUp 0.2s ease-out' }}>
                    <div style={{ width: '100%', maxWidth: '1100px', height: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'var(--bg-elevated)' }}>{getCategoryIcon(selectedDoc.category)}</div>
                                <div>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.15rem' }}>{selectedDoc.title}</h2>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{selectedDoc.category} • Archival Record</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => handleDownload(selectedDoc._id)} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '10px' }}>
                                    <Download size={18} /> Download
                                </button>
                                <button onClick={() => setShowPreviewModal(false)} className="btn" style={{ padding: '0.6rem', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                            <div style={{ width: '100%', height: '100%', background: 'var(--bg-surface)', borderRadius: '14px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                {selectedDoc.mimeType === 'application/pdf' ? (
                                    <iframe src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${selectedDoc.filePath}`} style={{ width: '100%', height: '100%', border: 'none' }} title="Vault Preview" />
                                ) : selectedDoc.mimeType.startsWith('image/') ? (
                                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${selectedDoc.filePath}`} alt={selectedDoc.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                                        <File size={72} style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', opacity: 0.3 }} />
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Preview Unavailable</h3>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>This file type cannot be rendered in the browser vault.</p>
                                        <button onClick={() => handleDownload(selectedDoc._id)} className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
                                            <Download size={18} style={{ marginRight: '0.6rem' }} /> Download to View Locally
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
