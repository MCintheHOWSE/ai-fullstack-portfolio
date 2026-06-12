import ChatRoom from './ChatRoom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MoverCard = ({ mover, showActions }) => {
    const navigate = useNavigate();
    const [showChat, setShowChat] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isOwner = currentUser && mover.user_id == currentUser.id;
    const isCustomer = currentUser && mover.customer_id == currentUser.id;
    const isParticipant = isOwner || isCustomer;

    const handleDelete = async () => {
        if (window.confirm('確定要刪除此搬家服務嗎？')) {
            try {
                const response = await fetch(`/api/movers/${mover.id}`, {
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

    const handleBookMover = async () => {
        if (!currentUser) {
            alert('請先登入');
            navigate('/login');
            return;
        }
        if (window.confirm('確定要預約此搬家服務嗎？')) {
            try {
                const response = await fetch(`/api/movers/${mover.id}/book`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customer_id: currentUser.id })
                });

                if (response.ok) {
                    alert('預約成功！請進入聊天室與搬家夥伴確認細節。');
                    window.location.reload();
                } else {
                    const data = await response.json();
                    alert(data.error || '預約失敗');
                }
            } catch (error) {
                console.error('Booking error:', error);
                alert('發生錯誤');
            }
        }
    };

    return (
        <>
            <div className="card" style={{ padding: '1.5rem', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="flex items-center gap-md">
                    <img
                        src={mover.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + mover.vehicle}
                        alt={mover.name}
                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{mover.name}</h3>
                        <div className="flex items-center gap-xs">
                            <span style={{ color: '#F59E0B' }}>★</span>
                            <span style={{ fontWeight: 'bold', color: '#666' }}>{mover.rating}</span>
                        </div>
                        <span style={{
                            fontSize: '0.8rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: mover.status === 'completed' ? '#D1FAE5' : mover.status === 'accepted' ? '#DBEAFE' : '#FEF3C7',
                            color: mover.status === 'completed' ? '#059669' : mover.status === 'accepted' ? '#1E40AF' : '#D97706',
                            marginTop: '0.25rem',
                            display: 'inline-block'
                        }}>
                            {mover.status === 'completed' ? '已完成' : mover.status === 'accepted' ? '已預約' : '可預約'}
                        </span>
                    </div>
                </div>

                <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '8px' }}>
                    <div className="flex items-center gap-sm" style={{ marginBottom: '0.5rem' }}>
                        <span>🚛</span>
                        <span style={{ fontWeight: 'bold' }}>{mover.vehicle}</span>
                    </div>
                    <div className="flex items-center gap-sm" style={{ color: '#666', fontSize: '0.9rem' }}>
                        <span>📦</span>
                        <span>載重 {mover.capacity}</span>
                    </div>
                </div>

                <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                    {(Array.isArray(mover.tags) ? mover.tags : (mover.tags || '').split(',')).map((tag, idx) => (
                        <span key={idx} style={{
                            fontSize: '0.8rem',
                            border: '1px solid #E5E7EB',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            color: '#666'
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex justify-between items-center" style={{ marginTop: 'auto' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#C8102E' }}>${mover.price} <span style={{ fontSize: '0.9rem', color: '#666' }}>/ 趟</span></span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isParticipant && mover.status !== 'completed' && (
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745' }}
                                onClick={() => setShowChat(true)}
                            >
                                聊天室
                            </button>
                        )}

                        {isOwner && showActions && mover.status === 'open' && (
                            <>
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem' }}
                                    onClick={() => navigate(`/edit-mover/${mover.id}`)}
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

                        {!isOwner && !isCustomer && mover.status === 'open' && (
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1.5rem' }}
                                onClick={handleBookMover}
                            >
                                預約搬家
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {showChat && (
                <ChatRoom
                    itemId={mover.id}
                    type="mover"
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

export default MoverCard;
