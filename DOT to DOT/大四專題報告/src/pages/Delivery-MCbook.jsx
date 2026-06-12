import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';

const Delivery = () => {
    const [errands, setErrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChatErrandId, setActiveChatErrandId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const targetChatId = queryParams.get('chatId');

    useEffect(() => {
        // Load user from localStorage ONCE on mount
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
        fetchErrands();
    }, []);

    useEffect(() => {
        if (targetChatId) {
            setActiveChatErrandId(targetChatId);
        }
    }, [targetChatId]);

    const fetchErrands = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/errands');
            const data = await response.json();
            if (response.ok) {
                setErrands(data.data);
            }
        } catch (error) {
            console.error('Error fetching errands:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        if (!currentUser) {
            alert('請先登入才能接單');
            navigate('/login');
            return;
        }

        if (!window.confirm('確定要接下這個任務嗎？接單後請務必履行承諾！')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/errands/${id}/accept`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ runner_id: currentUser.id }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('接單成功！請進入聊天室與發案人聯繫。');
                fetchErrands(); // Refresh list
            } else {
                alert(data.error || '接單失敗');
            }
        } catch (error) {
            console.error('Error accepting errand:', error);
            alert('發生錯誤，請稍後再試');
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1F2937' }}>校園跑腿任務板</h2>
                    <p style={{ color: '#6B7280' }}>順路幫忙買東西，賺點零用錢！</p>
                </div>
                <button onClick={() => navigate('/post-errand')} className="btn btn-primary">
                    + 發布任務
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>載入中...</div>
            ) : errands.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                    <p style={{ color: '#6B7280', marginBottom: '1rem' }}>目前沒有待接的任務</p>
                    <button onClick={() => navigate('/post-errand')} style={{ color: '#C8102E', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        成為第一個發布任務的人！
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {errands.map((errand) => (
                        <div key={errand.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111827' }}>{errand.item}</h3>
                                <span style={{
                                    backgroundColor: '#FEF3C7',
                                    color: '#D97706',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                }}>
                                    ${errand.price}
                                </span>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#4B5563' }}>
                                    <span style={{ fontSize: '1.2rem' }}>🏪</span>
                                    <span>購買：{errand.shop_location}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#4B5563' }}>
                                    <span style={{ fontSize: '1.2rem' }}>📍</span>
                                    <span>面交：{errand.meet_location}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.9rem' }}>
                                    <span>👤 發案人：{errand.requester_name}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                {errand.status === 'open' ? (
                                    (() => {
                                        if (currentUser && currentUser.id === errand.user_id) {
                                            return (
                                                <div style={{ width: '100%', textAlign: 'center', color: '#6B7280', padding: '0.5rem', backgroundColor: '#F3F4F6', borderRadius: '0.375rem' }}>
                                                    等待接單中...
                                                </div>
                                            );
                                        }
                                        return (
                                            <button
                                                onClick={() => handleAccept(errand.id)}
                                                className="btn btn-primary"
                                                style={{ width: '100%' }}
                                            >
                                                我順路，接單！
                                            </button>
                                        );
                                    })()
                                ) : (
                                    (() => {
                                        const isParticipant = currentUser && (currentUser.id === errand.user_id || currentUser.id === errand.runner_id);

                                        if (isParticipant && errand.status !== 'completed') {
                                            return (
                                                <button
                                                    onClick={() => setActiveChatErrandId(errand.id)}
                                                    className="btn btn-primary"
                                                    style={{ backgroundColor: '#28a745', width: '100%' }}
                                                >
                                                    進入聊天室
                                                </button>
                                            );
                                        } else if (errand.status === 'completed') {
                                            return <div style={{ width: '100%', textAlign: 'center', color: '#28a745', fontWeight: 'bold', padding: '0.5rem' }}>已結案</div>;
                                        } else {
                                            return <div style={{ width: '100%', textAlign: 'center', color: '#666', padding: '0.5rem' }}>已由他人接單</div>;
                                        }
                                    })()
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeChatErrandId && currentUser && (
                <ChatRoom
                    itemId={activeChatErrandId}
                    type="errand"
                    currentUser={currentUser}
                    onClose={() => setActiveChatErrandId(null)}
                    onComplete={() => {
                        setActiveChatErrandId(null);
                        fetchErrands();
                    }}
                />
            )}
        </div>
    );
};

export default Delivery;
