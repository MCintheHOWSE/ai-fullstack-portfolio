import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatList = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            fetchConversations(storedUser.id);
        } else {
            setLoading(false);
            navigate('/login');
        }
    }, [navigate]);

    const fetchConversations = async (userId) => {
        try {
            const res = await fetch(`/api/user/active-conversations?userId=${userId}`);
            const data = await res.json();
            if (data.message === 'success') {
                setConversations(data.data);
            }
        } catch (error) {
            console.error("Failed to load chats", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get consistent background colors matching the styling
    const getStatusStyle = (status) => {
        const map = {
            booked: { bg: '#e0f2fe', color: '#0369a1' },     // blue
            moving: { bg: '#f3e8ff', color: '#7e22ce' },     // purple
            buying: { bg: '#fef9c3', color: '#854d0e' },     // yellow
            delivering: { bg: '#ffedd5', color: '#9a3412' }, // orange
            negotiating: { bg: '#fee2e2', color: '#991b1b' },// red
            accepted: { bg: '#dcfce7', color: '#166534' }    // green
        };
        return map[status] || { bg: '#f3f4f6', color: '#4b5563' }; // gray
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'ride': return '🚗';
            case 'logistics': return '📦';
            case 'food': return '🍔';
            case 'errand': return '🏃';
            default: return '💬';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'ride': return '#FEF2F2'; // red-50
            case 'logistics': return '#FFF7ED'; // orange-50
            case 'food': return '#ECFDF5'; // green-50
            default: return '#F9FAFB';
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            載入中...
        </div>
    );

    return (
        <div className="container" style={{ paddingBottom: '80px', minHeight: '80vh' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
                💬 聊天列表
            </h1>

            {conversations.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>目前沒有進行中的對話</p>
                    <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>當你有進行中的訂單時，聊天室會出現在這裡</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {conversations.map((chat) => {
                        const statusStyle = getStatusStyle(chat.status);
                        return (
                            <div
                                key={`${chat.type}-${chat.id}`}
                                onClick={() => navigate(chat.link)}
                                className="card"
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {/* Icon */}
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        backgroundColor: getTypeColor(chat.type)
                                    }}>
                                        {getTypeIcon(chat.type)}
                                    </div>

                                    {/* Text */}
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                                            {chat.title}
                                        </h3>
                                        <span style={{
                                            display: 'inline-block',
                                            marginTop: '0.25rem',
                                            padding: '0.125rem 0.625rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: statusStyle.bg,
                                            color: statusStyle.color
                                        }}>
                                            {chat.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div style={{ color: '#d1d5db', fontSize: '1.25rem' }}>
                                    ❯
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatList;
