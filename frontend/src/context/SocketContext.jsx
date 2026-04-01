import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);
    const [lastNotification, setLastNotification] = useState(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (lastNotification) {
            const timer = setTimeout(() => setLastNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [lastNotification]);

    useEffect(() => {
        if (user && token) {
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const newSocket = io(socketUrl, {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('Connected to socket server');
                newSocket.emit('join', user.id);
            });

            newSocket.on('notification:new', (notification) => {
                console.log('New real-time notification:', notification);

                // Refresh data
                queryClient.invalidateQueries({ queryKey: ['notifications'] });

                // Show local UI toast
                setLastNotification(notification);

                // Browser notification fallback
                if (Notification.permission === 'granted') {
                    new Notification('HealthAI Alert', { body: notification.message });
                }
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [user, token, queryClient]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
            {lastNotification && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--primary-light)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px var(--primary-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: 9999,
                    animation: 'slideInRight 0.4s ease-out',
                    maxWidth: '400px'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: lastNotification.type === 'alert' ? 'var(--danger-bg)' : 'var(--primary-muted)',
                        color: lastNotification.type === 'alert' ? 'var(--danger)' : 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </div>
                    <div>
                        <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'white', marginBottom: '0.2rem' }}>
                            {lastNotification.type === 'alert' ? 'Health Alert' : 'New Notification'}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                            {lastNotification.message}
                        </p>
                    </div>
                    <button
                        onClick={() => setLastNotification(null)}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </SocketContext.Provider>
    );
};
