import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { socketServerUrl } from '../config';

const NotificationListener = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Request browser permission
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const socket = io(socketServerUrl());

        // Server emits exact event name: notification_{userId}
        const eventName = `notification_${user.id}`;

        socket.on(eventName, (data) => {
            console.log("Notification received:", data);
            setNotification(data);

            // Browser Notification
            if (Notification.permission === 'granted') {
                new Notification("Dot to Dot", { body: data.content || data.text });
            }

            // Auto hide internal toast after 5s
            setTimeout(() => setNotification(null), 5000);
        });

        return () => socket.disconnect();
    }, [user]);

    if (!notification) return null;

    return (
        <div
            onClick={() => {
                // Determine navigation based on type
                if (notification.type === 'ride_invite' || notification.type === 'ride_accepted') {
                    navigate('/chat');
                }
                setNotification(null);
            }}
            style={{
                position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                backgroundColor: 'white', borderLeft: '5px solid #C8102E',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '15px 20px',
                borderRadius: '8px', cursor: 'pointer', maxWidth: '320px',
                animation: 'slideIn 0.3s ease-out'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🚗</span>
                <div>
                    <h4 style={{ margin: '0 0 2px', color: '#1f2937', fontSize: '0.95rem' }}>新訊息</h4>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '0.85rem' }}>{notification.content || notification.text}</p>
                </div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#C8102E', fontWeight: 'bold' }}>
                點擊查看詳情 ➔
            </div>
        </div>
    );
};

export default NotificationListener;
