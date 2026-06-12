import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const NotificationBell = ({ currentUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!currentUser) return;

        // Fetch initial notifications
        fetchNotifications();

        // Connect to Socket
        socketRef.current = io('http://localhost:3000');

        // Listen for personal notifications
        socketRef.current.on(`notification_${currentUser.id}`, (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            // Optional: Play a sound
        });

        // Click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [currentUser]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/notifications/${currentUser.id}`);
            const data = await response.json();
            if (response.ok) {
                setNotifications(data.data);
                setUnreadCount(data.data.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const navigate = useNavigate(); // Add this hook

    const handleMarkAsRead = async (notification) => {
        // Navigate based on type
        if (notification.related_id) {
            if (notification.type === 'ride_join') {
                navigate(`/search?chatId=${notification.related_id}&type=ride`);
            } else if (notification.type === 'errand_accept') {
                navigate(`/delivery?chatId=${notification.related_id}&type=errand`);
            } else if (notification.type === 'delivery_accept') {
                navigate(`/logistics?chatId=${notification.related_id}&type=delivery`);
            }
        }

        setIsOpen(false); // Close dropdown

        if (notification.is_read) return;

        try {
            await fetch(`http://localhost:3000/api/notifications/${notification.id}/read`, {
                method: 'PUT'
            });

            // Update local state
            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, is_read: 1 } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const toggleDropdown = () => setIsOpen(!isOpen);

    if (!currentUser) return null;

    return (
        <div className="notification-bell" ref={dropdownRef} style={{ position: 'relative', marginRight: '1rem' }}>
            <button
                onClick={toggleDropdown}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    fontSize: '1.5rem'
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#C8102E',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    width: '300px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    borderRadius: '0.5rem',
                    zIndex: 1000,
                    border: '1px solid #E5E7EB'
                }}>
                    <div style={{ padding: '0.75rem', borderBottom: '1px solid #E5E7EB', fontWeight: 'bold' }}>
                        通知中心
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#6B7280' }}>
                            沒有新通知
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => handleMarkAsRead(notification)}
                                style={{
                                    padding: '0.75rem',
                                    borderBottom: '1px solid #F3F4F6',
                                    cursor: 'pointer',
                                    backgroundColor: notification.is_read ? 'white' : '#FEF2F2',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                    {notification.content}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                    {new Date(notification.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
