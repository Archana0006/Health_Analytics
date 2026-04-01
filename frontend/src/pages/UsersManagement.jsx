import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { Users, Trash2, Key, Shield, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UsersManagement = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [passwordModal, setPasswordModal] = useState({ show: false, userId: null, newPassword: '' });

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/users');
            return data;
        }
    });

    const deleteUser = useMutation({
        mutationFn: async (id) => {
            await apiClient.delete(`/admin/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User deleted successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete user')
    });

    const changePassword = useMutation({
        mutationFn: async ({ id, newPassword }) => {
            await apiClient.put(`/admin/users/${id}/password`, { newPassword });
        },
        onSuccess: () => {
            setPasswordModal({ show: false, userId: null, newPassword: '' });
            toast.success('Password changed successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password')
    });

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800' }}>System Users</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage access, roles, and security credentials</p>
            </header>

            <div className="card">
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input 
                        className="input" 
                        placeholder="Search users by name or email..." 
                        style={{ border: 'none', background: 'transparent', flex: 1, outline: 'none' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isLoading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>User</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Role</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '600' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                                            background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : (user.role === 'doctor' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                                            color: user.role === 'admin' ? 'var(--danger)' : (user.role === 'doctor' ? 'var(--info)' : 'var(--success)')
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button 
                                            className="btn" 
                                            onClick={() => setPasswordModal({ show: true, userId: user._id, newPassword: '' })}
                                            style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.5rem', marginRight: '0.5rem' }}
                                            title="Change Password"
                                        >
                                            <Key size={16} />
                                        </button>
                                        <button 
                                            className="btn" 
                                            onClick={() => { if(window.confirm('Delete this user permanently?')) deleteUser.mutate(user._id); }}
                                            style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.5rem', color: 'var(--danger)' }}
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {passwordModal.show && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: '700' }}>Change User Password</h3>
                        <input 
                            type="password" 
                            className="input" 
                            placeholder="New Password" 
                            value={passwordModal.newPassword}
                            onChange={(e) => setPasswordModal({ ...passwordModal, newPassword: e.target.value })}
                            style={{ width: '100%', marginBottom: '1rem' }}
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn" onClick={() => setPasswordModal({ show: false, userId: null, newPassword: '' })}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => changePassword.mutate({ id: passwordModal.userId, newPassword: passwordModal.newPassword })}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManagement;
