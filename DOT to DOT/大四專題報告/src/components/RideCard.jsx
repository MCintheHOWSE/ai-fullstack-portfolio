import ChatRoom from './ChatRoom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RideCard = ({ ride, showActions, targetChatId }) => {
    const navigate = useNavigate();
    const [showChat, setShowChat] = useState(false);
    const [localRide, setLocalRide] = useState(ride);

    // Auto-open chat if targetChatId matches
    useEffect(() => {
        if (targetChatId && localRide.id == targetChatId) {
            setShowChat(true);
        }
    }, [targetChatId, localRide.id]);

    const isScooter = localRide.type === 'scooter';
    const borderColor = isScooter ? '#FFC107' : '#C8102E';
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isOwner = currentUser && localRide.user_id == currentUser.id;
    const isPassenger = currentUser && localRide.passenger_id == currentUser.id;
    const isParticipant = isOwner || isPassenger;

    const handleJoinRide = async () => {
        if (!currentUser) {
            alert('請先登入');
            navigate('/login');
            return;
        }
        if (window.confirm('確定要加入此行程嗎？')) {
            try {
                const response = await fetch(`http://localhost:3000/api/rides/${localRide.id}/join`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ passenger_id: currentUser.id })
                });
                if (response.ok) {
                    alert('加入成功！請進入聊天室與駕駛確認。');
                    setLocalRide({ ...localRide, status: 'accepted', passenger_id: currentUser.id });
                } else {
                    const data = await response.json();
                    alert(data.error || '加入失敗');
                }
            } catch (err) {
                console.error(err);
                alert('發生錯誤');
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('確定要刪除此共乘嗎？')) {
            try {
                const response = await fetch(`http://localhost:3000/api/rides/${localRide.id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert('已刪除');
                    window.location.reload();
                } else {
                    alert('刪除失敗');
                }
            } catch (err) {
                console.error(err);
                alert('刪除時發生錯誤');
            }
        }
    };

    return (
        <>
            <div className="card" style={{
                padding: '1.5rem',
                borderLeft: `4px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="flex justify-between items-start">
                    <div className="flex gap-md">
                        <img
                            src={localRide.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + localRide.driver}
                            alt={localRide.driver}
                            style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                        />
                        <div>
                            <h3 style={{ fontWeight: 'bold' }}>{localRide.driver}</h3>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>{localRide.dept || '校友'}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span style={{
                            backgroundColor: isScooter ? '#FFFBEB' : '#FEF2F2',
                            color: isScooter ? '#B45309' : '#991B1B',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            {isScooter ? '機車' : '汽車'}
                        </span>

                        <span style={{
                            fontSize: '0.8rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: localRide.status === 'completed' ? '#D1FAE5' : localRide.status === 'accepted' ? '#DBEAFE' : '#FEF3C7',
                            color: localRide.status === 'completed' ? '#059669' : localRide.status === 'accepted' ? '#1E40AF' : '#D97706'
                        }}>
                            {localRide.status === 'completed' ? '已完成' : localRide.status === 'accepted' ? '已額滿' : '等待加入'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="flex items-center gap-sm">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                        <span style={{ fontWeight: '500' }}>{localRide.origin}</span>
                    </div>
                    <div style={{ borderLeft: '2px dashed #E5E7EB', height: '16px', marginLeft: '3px' }}></div>
                    <div className="flex items-center gap-sm">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
                        <span style={{ fontWeight: '500' }}>{localRide.destination}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center" style={{ fontSize: '0.9rem', color: '#666' }}>
                    <div className="flex items-center gap-xs">
                        <span>🕒</span>
                        <span>{localRide.departureTime ? new Date(localRide.departureTime).toLocaleString() : localRide.time}</span>
                    </div>
                </div>

                <div style={{ backgroundColor: '#F9FAFB', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', color: '#4B5563' }}>
                    "{localRide.notes || localRide.description}"
                </div>

                <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #F3F4F6' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#C8102E' }}>${localRide.price}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isParticipant && localRide.status !== 'completed' && (
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745' }}
                                onClick={() => setShowChat(true)}
                            >
                                聊天室
                            </button>
                        )}

                        {isOwner && showActions && localRide.status === 'open' && (
                            <>
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem' }}
                                    onClick={() => navigate(`/edit-ride/${localRide.id}`)}
                                >
                                    編輯
                                </button>
                                <button
                                    className="btn btn-danger"
                                    style={{ padding: '0.5rem 1rem' }}
                                    onClick={handleDelete}
                                >
                                    刪除
                                </button>
                            </>
                        )}

                        {!isOwner && !isPassenger && localRide.status === 'open' && (
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1.5rem' }}
                                onClick={handleJoinRide}
                            >
                                加入行程
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {showChat && (
                <ChatRoom
                    itemId={localRide.id}
                    type="ride"
                    currentUser={currentUser}
                    onClose={() => setShowChat(false)}
                    onComplete={() => {
                        setShowChat(false);
                        window.location.reload();
                    }}
                />
            )}
        </>
    );
};

export default RideCard;
