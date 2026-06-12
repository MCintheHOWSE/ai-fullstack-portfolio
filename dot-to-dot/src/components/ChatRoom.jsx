import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { socketServerUrl } from '../config';
import StarRating from './StarRating';
import PaymentCard from './PaymentCard';
import usePaymentSocket from '../hooks/usePaymentSocket';
import { loadBankInfo } from '../utils/encryptionUtils';

const ChatRoom = ({ itemId, type = 'errand', currentUser, onClose, onComplete }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [item, setItem] = useState(null);
    const [showRating, setShowRating] = useState(false);
    const [ratingScore, setRatingScore] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [myBankInfo, setMyBankInfo] = useState(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Payment Socket Hook (for rides, food, and logistics)
    const {
        paymentInfo,
        paymentStatus,
        notification: paymentNotification,
        sendPaymentInfo,
        confirmPaymentSent,
        confirmPaymentReceived
    } = usePaymentSocket(
        ['ride', 'food', 'logistics'].includes(type) ? currentUser.id : null,
        ['ride', 'food', 'logistics'].includes(type) ? itemId : null
    );

    // Helper to get API endpoints based on type
    const getEndpoints = () => {
        const base = '/api';
        if (type === 'errand') {
            return {
                details: `${base}/errands`,
                messages: `${base}/errands/${itemId}/messages`,
                confirm: `${base}/errands/${itemId}/confirm`
            };
        } else if (type === 'food') {
            return {
                details: `${base}/group-buys`,
                messages: `${base}/chats/food/${itemId}`,
                confirm: `${base}/group-buys/${itemId}/confirm`
            };
        } else if (type === 'logistics') {
            return {
                details: `${base}/deliveries/${itemId}`,
                messages: `${base}/chats/logistics/${itemId}`,
                confirm: `${base}/deliveries/${itemId}/status`
            };
        } else {
            // Rides and Movers use the generic chat API
            return {
                details: `${base}/${type}s`, // /api/rides or /api/movers
                messages: `${base}/chats/${type}/${itemId}`,
                confirm: `${base}/${type}s/${itemId}/confirm`
            };
        }
    };

    const endpoints = getEndpoints();

    useEffect(() => {
        fetchItemDetails();
        fetchMessages();

        // Initialize Socket.io
        socketRef.current = io(socketServerUrl());

        // Join Room
        socketRef.current.emit('join_room', { itemId, type });

        // Listen for messages
        socketRef.current.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [itemId, type]);

    // Load bank info for driver (rides only)
    useEffect(() => {
        if (type === 'ride' && item && currentUser.id === item.user_id) {
            loadBankInfo(currentUser.id).then(info => {
                if (info) {
                    setMyBankInfo(info);
                }
            }).catch(err => {
                console.error('Failed to load bank info:', err);
            });
        }
    }, [type, item, currentUser.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchItemDetails = async () => {
        try {
            // Fetch list and find item (simple approach)
            const response = await fetch(endpoints.details);
            const data = await response.json();
            if (response.ok) {
                const found = data.data.find(e => e.id === parseInt(itemId));
                if (found) setItem(found);
            }
        } catch (error) {
            console.error("Error fetching item details:", error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch(endpoints.messages);
            const data = await response.json();
            if (response.ok) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            sender_id: currentUser.id,
            content: newMessage,
            sender_name: currentUser.name, // Optimistic UI support
            createdAt: new Date().toISOString()
        };

        // Emit to socket
        socketRef.current.emit('send_message', {
            itemId,
            type,
            message: messageData
        });

        // Also save to DB via API (for persistence)
        try {
            await fetch(endpoints.messages, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: currentUser.id,
                    content: newMessage
                })
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error saving message:", error);
        }
    };

    const handleConfirm = async () => {
        if (!window.confirm('確定任務已完成？')) return;
        try {
            const response = await fetch(endpoints.confirm, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id })
            });
            const data = await response.json();
            if (response.ok) {
                alert('已確認！等待對方確認。');
                fetchItemDetails(); // Refresh status
                if (data.status === 'completed') {
                    onComplete();
                }
            }
        } catch (error) {
            console.error("Error confirming:", error);
        }
    };

    const submitRating = async () => {
        if (ratingScore === 0) {
            alert('請選擇評分星數');
            return;
        }

        // Determine who we are rating
        let targetUserId = null;
        if (type === 'errand') {
            targetUserId = currentUser.id === item.user_id ? item.runner_id : item.user_id;
        } else if (type === 'ride') {
            targetUserId = currentUser.id === item.user_id ? item.passenger_id : item.user_id;
        } else if (type === 'mover') {
            targetUserId = currentUser.id === item.user_id ? item.customer_id : item.user_id;
        } else if (type === 'logistics') {
            targetUserId = currentUser.id === item.requester_id ? item.provider_id : item.requester_id;
        }

        try {
            const response = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from_user_id: currentUser.id,
                    to_user_id: targetUserId,
                    service_type: type,
                    service_id: itemId,
                    score: ratingScore,
                    comment: ratingComment
                })
            });

            if (response.ok) {
                alert('評分成功！');
                setShowRating(false);
                onClose(); // Close chat after rating
            } else {
                const data = await response.json();
                alert(data.error || '評分失敗');
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    };

    // Determine confirmation status based on type and role
    let myConfirmed = false;
    // let otherConfirmed = false; // Not strictly needed for UI, but good to know

    if (item) {
        if (type === 'errand') {
            const isRequester = currentUser.id === item.user_id;
            myConfirmed = isRequester ? item.requester_confirmed : item.runner_confirmed;
        } else if (type === 'ride') {
            const isDriver = currentUser.id === item.user_id;
            myConfirmed = isDriver ? item.driver_confirmed : item.passenger_confirmed;
        } else if (type === 'mover') {
            const isMover = currentUser.id === item.user_id;
            myConfirmed = isMover ? item.mover_confirmed : item.customer_confirmed;
        }
    }

    if (showRating) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
            }}>
                <div style={{
                    backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center'
                }}>
                    <h3 style={{ marginTop: 0 }}>給予評價</h3>
                    <p style={{ color: '#666' }}>這次的體驗如何？</p>

                    <div style={{ margin: '1.5rem 0' }}>
                        <StarRating rating={ratingScore} onRate={setRatingScore} />
                    </div>

                    <textarea
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="寫點評論..."
                        style={{ width: '100%', height: '80px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem' }}
                    />

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setShowRating(false)} className="btn" style={{ flex: 1, backgroundColor: '#eee' }}>略過</button>
                        <button onClick={submitRating} className="btn btn-primary" style={{ flex: 1 }}>送出評價</button>
                    </div>
                </div>
            </div>
        );
    }

    // Handle Accept Invite
    const handleAcceptInvite = async (inviteMsg) => {
        try {
            // 1. Call API to update status and create ride
            // We need to pass the driverId (who sent the invite)
            const res = await fetch(`/api/rides/${itemId}/accept`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passengerId: currentUser.id,
                    driverId: inviteMsg.sender_id, // Critical: passed from message
                    price: inviteMsg.inviteData?.price
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert("🎉 配對成功！已建立正式訂單。");
                // Refresh to show updated status
                fetchItemDetails();
                // Optionally navigate to the new ride? Or stay here?
                // The ChatList will now show the new ride.
                // We could emit a system message here too if we wanted.
            } else {
                alert("接受失敗，請稍後再試");
            }
        } catch (err) {
            console.error("接受失敗", err);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', width: '90%', maxWidth: '500px', height: '80vh',
                borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#C8102E', color: 'white' }}>
                    <h3 style={{ margin: 0 }}>聊天室 ({type === 'ride' ? '共乘' : type === 'mover' ? '搬家' : type === 'food' ? '餐飲跑腿' : '跑腿'})</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {/* Status Bar */}
                <div style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        狀態: {item?.status === 'completed' ? '已結案' : item?.status === 'accepted' ? '已接受' : '進行中'}
                    </span>
                    {item?.status === 'completed' && (
                        <button
                            onClick={() => setShowRating(true)}
                            style={{ fontSize: '0.8rem', color: '#C8102E', border: '1px solid #C8102E', padding: '2px 8px', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                        >
                            給予評價
                        </button>
                    )}
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {messages.map((msg, index) => {
                        const isMe = msg.sender_id === currentUser.id;

                        // Parse Invitation Data if present
                        let isInvitation = false;
                        let inviteData = {};

                        // Check DB format (string prefix)
                        if (typeof msg.content === 'string' && msg.content.startsWith('INVITATION_JSON:')) {
                            isInvitation = true;
                            try {
                                inviteData = JSON.parse(msg.content.substring('INVITATION_JSON:'.length));
                            } catch (e) { }
                        }
                        // Check Socket format (object content or type property)
                        else if (msg.type === 'invitation') {
                            isInvitation = true;
                            inviteData = msg.content;
                        }

                        // Attach data to message object for handler
                        if (isInvitation) msg.inviteData = inviteData;

                        // RENDER INVITATION CARD
                        if (isInvitation) {
                            return (
                                <div key={index} style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                                    <div style={{
                                        backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        border: '1px solid #fee2e2', width: '280px', textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>🚗</div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.25rem 0' }}>共乘邀請</h3>
                                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                            駕駛 <strong>{msg.sender_name}</strong> 邀請您共乘<br />
                                            報價：<span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '1.125rem' }}>${inviteData.price || 50}</span>
                                        </p>

                                        {isMe ? (
                                            <div style={{ backgroundColor: '#f3f4f6', color: '#6b7280', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                                ⏳ 等待乘客回應中...
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button
                                                    onClick={() => handleAcceptInvite(msg)}
                                                    style={{
                                                        flex: 1, backgroundColor: '#dc2626', color: 'white', padding: '0.625rem',
                                                        borderRadius: '0.75rem', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                                    }}
                                                >
                                                    ✅ 答應上車
                                                </button>
                                                <button style={{
                                                    flex: 1, backgroundColor: '#e5e7eb', color: '#4b5563', padding: '0.625rem',
                                                    borderRadius: '0.75rem', fontWeight: 'bold', border: 'none', cursor: 'pointer'
                                                }}>
                                                    再看看
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // Regular Message
                        return (
                            <div key={index} style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '70%',
                                backgroundColor: isMe ? '#C8102E' : '#f0f0f0',
                                color: isMe ? 'white' : '#333',
                                padding: '0.5rem 1rem',
                                borderRadius: '12px',
                                borderBottomRightRadius: isMe ? '2px' : '12px',
                                borderBottomLeftRadius: isMe ? '12px' : '2px'
                            }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '2px' }}>{msg.sender_name}</div>
                                <div>{msg.content}</div>
                            </div>
                        );
                    })}

                    {/* Payment Card (for rides and food, passenger/eater view) */}
                    {['ride', 'food'].includes(type) && paymentInfo && item && (
                        (type === 'ride' && currentUser.id === item.passenger_id) ||
                        (type === 'food' && currentUser.id !== item.runner_id)
                    ) && (
                            <PaymentCard
                                amount={paymentInfo.amount || item.price || item.delivery_fee}
                                bankCode={paymentInfo.bankCode}
                                accountNumber={paymentInfo.accountNumber}
                                rideId={itemId}
                                onPaymentSent={() => confirmPaymentSent(
                                    type === 'ride' ? item.user_id : item.runner_id,
                                    currentUser.id
                                )}
                            />
                        )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Payment Notification */}
                {type === 'ride' && paymentNotification && (
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FFF9E6', borderTop: '1px solid #FFD700', borderBottom: '1px solid #FFD700' }}>
                        <span style={{ fontSize: '0.875rem', color: '#856404' }}>ℹ️ {paymentNotification}</span>
                    </div>
                )}

                {/* Payment Action Buttons (for rides and food) */}
                {['ride', 'food'].includes(type) && item?.status !== 'completed' && (
                    <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem' }}>
                        {/* Driver/Runner: Send payment info */}
                        {((type === 'ride' && currentUser.id === item.user_id) || (type === 'food' && currentUser.id === item.runner_id)) && paymentStatus === 'pending' && (
                            <button
                                onClick={() => {
                                    if (!myBankInfo) {
                                        alert('請先至個人頁面設定收款帳號');
                                        return;
                                    }
                                    const recipientId = type === 'ride' ? item.passenger_id : null; // For food, broadcast to all
                                    const confirmMsg = type === 'ride'
                                        ? `確定要向乘客發送收款資訊？\n金額：NT$ ${item.price}`
                                        : `確定要向飢餓者發送收款資訊？\n金額：NT$ ${item.delivery_fee}`;
                                    if (window.confirm(confirmMsg)) {
                                        sendPaymentInfo(
                                            recipientId,
                                            myBankInfo.bankCode,
                                            myBankInfo.accountNumber,
                                            type === 'ride' ? item.price : item.delivery_fee
                                        );
                                        alert('已發送收款資訊');
                                    }
                                }}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '0.75rem', fontSize: '0.9375rem' }}
                            >
                                💸 發送收款資訊
                            </button>
                        )}

                        {/* Driver/Runner: Confirm received payment */}
                        {((type === 'ride' && currentUser.id === item.user_id) || (type === 'food' && currentUser.id === item.runner_id)) && paymentStatus === 'passenger_confirmed' && (
                            <button
                                onClick={() => {
                                    if (window.confirm('確認已收到款項？')) {
                                        confirmPaymentReceived(item.passenger_id, currentUser.id);
                                    }
                                }}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '0.75rem', fontSize: '0.9375rem', backgroundColor: '#10B981' }}
                            >
                                ✅ 確認收款
                            </button>
                        )}

                        {/* Payment Status Display */}
                        {paymentStatus === 'completed' && (
                            <div style={{ flex: 1, padding: '0.75rem', textAlign: 'center', backgroundColor: '#10B981', color: 'white', borderRadius: '8px', fontWeight: '600' }}>
                                ✓ 交易已完成
                            </div>
                        )}
                    </div>
                )}

                {/* Regular Confirmation Button (for non-rides or fallback) */}
                {(type !== 'ride' && item?.status !== 'completed') && (
                    <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={handleConfirm}
                            disabled={myConfirmed}
                            className={`btn ${myConfirmed ? 'btn-outline' : 'btn-primary'}`}
                            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', backgroundColor: myConfirmed ? '#eee' : '#C8102E', color: myConfirmed ? '#666' : 'white', border: myConfirmed ? '1px solid #ddd' : 'none' }}
                        >
                            {myConfirmed ? '等待對方確認...' : '確認完成任務'}
                        </button>
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSend} style={{ padding: '1rem', paddingTop: '0.5rem', borderTop: 'none', display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="輸入訊息..."
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '24px', border: '1px solid #ddd' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0 1.5rem' }}>
                        發送
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatRoom;
