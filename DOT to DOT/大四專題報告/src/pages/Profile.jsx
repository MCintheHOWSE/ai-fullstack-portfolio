import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RideCard from '../components/RideCard';
import MoverCard from '../components/MoverCard';
import ChatRoom from '../components/ChatRoom';
import StarRating from '../components/StarRating';
import { saveBankInfo, loadBankInfo, deleteBankInfo, maskAccountNumber, getBankName } from '../utils/encryptionUtils';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [myRides, setMyRides] = useState([]);
    const [myMovers, setMyMovers] = useState([]);
    const [myErrands, setMyErrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChatErrandId, setActiveChatErrandId] = useState(null);

    // Payment settings state
    const [showPaymentSettings, setShowPaymentSettings] = useState(false);
    const [bankInfo, setBankInfo] = useState(null);
    const [editingPayment, setEditingPayment] = useState(false);
    const [bankCode, setBankCode] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Tab state for activity sections
    const [activeTab, setActiveTab] = useState('errands'); // 'errands', 'rides', 'movers'

    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        const currentUser = JSON.parse(userData);
        setUser(currentUser);
        fetchMyData(currentUser.id);
        loadPaymentInfo(currentUser.id);
    }, [navigate]);

    const fetchMyData = async (userId) => {
        try {
            // Fetch Rides
            const ridesRes = await fetch('http://localhost:3000/api/rides');
            const ridesData = await ridesRes.json();
            if (ridesRes.ok) {
                const allRides = ridesData.data || [];
                const userRides = allRides.filter(ride => ride.user_id == userId || ride.passenger_id == userId);
                setMyRides(userRides);
            }

            // Fetch Movers
            const moversRes = await fetch('http://localhost:3000/api/movers');
            const moversData = await moversRes.json();
            if (moversRes.ok) {
                const allMovers = moversData.data || [];
                const userMovers = allMovers.filter(mover => mover.user_id == userId);
                const transformedMovers = userMovers.map(mover => ({
                    ...mover,
                    tags: typeof mover.tags === 'string' ? mover.tags.split(',') : (Array.isArray(mover.tags) ? mover.tags : [])
                }));
                setMyMovers(transformedMovers);
            }

            // Fetch Errands
            const errandsRes = await fetch(`http://localhost:3000/api/users/${userId}/errands`);
            const errandsData = await errandsRes.json();
            if (errandsRes.ok) {
                setMyErrands(errandsData.data || []);
            }

        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Payment functions
    const loadPaymentInfo = async (userId) => {
        try {
            const info = await loadBankInfo(userId);
            setBankInfo(info);
        } catch (error) {
            console.error('Failed to load payment info:', error);
        }
    };

    const handleSavePaymentInfo = async () => {
        if (!bankCode || !accountNumber) {
            alert('請輸入銀行代碼和帳號');
            return;
        }

        if (bankCode.length !== 3 || isNaN(bankCode)) {
            alert('銀行代碼必須為 3 位數字');
            return;
        }

        setPaymentLoading(true);
        try {
            await saveBankInfo(bankCode, accountNumber, user.id);
            await loadPaymentInfo(user.id);
            setEditingPayment(false);
            setBankCode('');
            setAccountNumber('');
            alert('收款資訊已加密儲存');
        } catch (error) {
            console.error('Failed to save payment info:', error);
            alert('儲存失敗：' + error.message);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleDeletePaymentInfo = () => {
        if (window.confirm('確定要刪除收款資訊嗎？此操作無法復原。')) {
            deleteBankInfo(user.id);
            setBankInfo(null);
            alert('收款資訊已刪除');
        }
    };

    if (!user) return null;

    return (
        <div className="container" style={{ padding: '0.75rem 0' }}>
            <div className="card" style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
                <div className="flex items-center gap-md">
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#C8102E',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                    }}>
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{user.name}</h1>
                        <p style={{ color: '#666', margin: '0.25rem 0', fontSize: '0.875rem' }}>{user.email}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StarRating rating={user.rating || 0} readonly={true} />
                            <span style={{ color: '#666', fontSize: '0.8125rem' }}>
                                ({user.rating_count || 0} 則評價)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Settings Section */}
            <div className="card" style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                        💳 收款設定
                    </h2>
                    <button
                        onClick={() => setShowPaymentSettings(!showPaymentSettings)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                    >
                        {showPaymentSettings ? '收起' : '展開'}
                    </button>
                </div>

                {showPaymentSettings && (
                    <div>
                        <div style={{
                            backgroundColor: '#FFF9E6',
                            border: '1px solid #FFD700',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            marginBottom: '0.75rem'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#856404' }}>
                                🔒 <strong>隱私保護：</strong>您的銀行資訊將<strong>加密儲存於您的裝置</strong>，伺服器不會保存任何金融資料。
                            </p>
                        </div>

                        {bankInfo ? (
                            // Display existing bank info
                            <div>
                                {!editingPayment ? (
                                    <div style={{
                                        backgroundColor: '#F9FAFB',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        padding: '0.75rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ display: 'block', color: '#6B7280', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                                                收款銀行
                                            </label>
                                            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '600' }}>
                                                {getBankName(bankInfo.bankCode)} ({bankInfo.bankCode})
                                            </p>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: '#6B7280', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                                                帳號
                                            </label>
                                            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '600', fontFamily: 'monospace' }}>
                                                {maskAccountNumber(bankInfo.accountNumber)}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    // Edit mode
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                                銀行代碼 (3位數)
                                            </label>
                                            <input
                                                type="text"
                                                value={bankCode}
                                                onChange={(e) => setBankCode(e.target.value)}
                                                placeholder="例如: 822 (中國信託)"
                                                maxLength={3}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #D1D5DB',
                                                    borderRadius: '4px',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                            {bankCode && getBankName(bankCode) && (
                                                <p style={{ marginTop: '0.25rem', color: '#059669', fontSize: '0.9rem' }}>
                                                    ✓ {getBankName(bankCode)}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                                帳號
                                            </label>
                                            <input
                                                type="text"
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                placeholder="請輸入完整帳號"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    border: '1px solid #D1D5DB',
                                                    borderRadius: '4px',
                                                    fontSize: '1rem',
                                                    fontFamily: 'monospace'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {!editingPayment ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditingPayment(true);
                                                    setBankCode(bankInfo.bankCode);
                                                    setAccountNumber(bankInfo.accountNumber);
                                                }}
                                                className="btn"
                                                style={{ backgroundColor: '#3B82F6', color: 'white' }}
                                            >
                                                📝 修改
                                            </button>
                                            <button
                                                onClick={handleDeletePaymentInfo}
                                                className="btn"
                                                style={{ backgroundColor: '#EF4444', color: 'white' }}
                                            >
                                                🗑️ 刪除
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSavePaymentInfo}
                                                disabled={paymentLoading}
                                                className="btn btn-primary"
                                            >
                                                {paymentLoading ? '儲存中...' : '💾 儲存'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingPayment(false);
                                                    setBankCode('');
                                                    setAccountNumber('');
                                                }}
                                                className="btn"
                                                style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                                            >
                                                取消
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Add new bank info
                            <div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        銀行代碼 (3位數)
                                    </label>
                                    <input
                                        type="text"
                                        value={bankCode}
                                        onChange={(e) => setBankCode(e.target.value)}
                                        placeholder="例如: 822 (中國信託)"
                                        maxLength={3}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '4px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    {bankCode && getBankName(bankCode) && (
                                        <p style={{ marginTop: '0.25rem', color: '#059669', fontSize: '0.9rem' }}>
                                            ✓ {getBankName(bankCode)}
                                        </p>
                                    )}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        帳號
                                    </label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="請輸入完整帳號"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #D1D5DB',
                                            borderRadius: '4px',
                                            fontSize: '1rem',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleSavePaymentInfo}
                                    disabled={paymentLoading}
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    {paymentLoading ? '儲存中...' : '💾 儲存收款資訊'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Admin Dashboard Link - Only for admin users */}
            {(user.role === 'admin' || user.is_admin || user.email === 'admin@scu.edu.tw') && (
                <div
                    className="card"
                    style={{
                        padding: '0.5rem 0.75rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        border: '2px solid #C8102E',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => navigate('/admin')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, color: '#C8102E' }}>
                            🛡️ 後台管理
                        </h2>
                        <span style={{ color: '#C8102E', fontSize: '1.25rem' }}>→</span>
                    </div>
                </div>
            )}

            {/* Activity Tabs */}
            <div style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    borderBottom: '2px solid #E5E7EB',
                    marginBottom: '1rem'
                }}>
                    <button
                        onClick={() => setActiveTab('errands')}
                        style={{
                            flex: 1,
                            padding: '0.75rem 0',
                            border: 'none',
                            background: 'none',
                            fontSize: '0.9375rem',
                            fontWeight: activeTab === 'errands' ? '600' : '400',
                            color: activeTab === 'errands' ? '#C8102E' : '#6B7280',
                            borderBottom: activeTab === 'errands' ? '3px solid #C8102E' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        🏃 跑腿任務 ({myErrands.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('rides')}
                        style={{
                            flex: 1,
                            padding: '0.75rem 0',
                            border: 'none',
                            background: 'none',
                            fontSize: '0.9375rem',
                            fontWeight: activeTab === 'rides' ? '600' : '400',
                            color: activeTab === 'rides' ? '#C8102E' : '#6B7280',
                            borderBottom: activeTab === 'rides' ? '3px solid #C8102E' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        🚗 共乘行程 ({myRides.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('movers')}
                        style={{
                            flex: 1,
                            padding: '0.75rem 0',
                            border: 'none',
                            background: 'none',
                            fontSize: '0.9375rem',
                            fontWeight: activeTab === 'movers' ? '600' : '400',
                            color: activeTab === 'movers' ? '#C8102E' : '#6B7280',
                            borderBottom: activeTab === 'movers' ? '3px solid #C8102E' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        📦 搬家服務 ({myMovers.length})
                    </button>
                </div>
            </div>

            {/* Errands Section */}
            {activeTab === 'errands' && (
                <div>
                    {loading ? (
                        <p>載入中...</p>
                    ) : myErrands.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {myErrands.map(errand => (
                                <div key={errand.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#111827' }}>{errand.item}</h3>
                                        <span style={{
                                            backgroundColor: errand.status === 'completed' ? '#D1FAE5' : '#FEF3C7',
                                            color: errand.status === 'completed' ? '#059669' : '#D97706',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontSize: '0.8125rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {errand.status === 'completed' ? '已完成' : `$${errand.price}`}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1, color: '#4B5563' }}>
                                        <p>🏪 購買：{errand.shop_location}</p>
                                        <p>📍 面交：{errand.meet_location}</p>
                                        <p>👤 發案人：{errand.requester_name}</p>
                                    </div>
                                    <div style={{ marginTop: '1rem' }}>
                                        {errand.status !== 'completed' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => setActiveChatErrandId(errand.id)}
                                                    className="btn btn-primary"
                                                    style={{ flex: 1, backgroundColor: '#28a745' }}
                                                >
                                                    進入聊天室
                                                </button>
                                                {errand.user_id === user.id && errand.status === 'open' && (
                                                    <button
                                                        onClick={() => navigate(`/edit-errand/${errand.id}`)}
                                                        className="btn"
                                                        style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                                                    >
                                                        編輯
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#666', marginBottom: '1rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>目前沒有跑腿任務</p>
                            <button className="btn btn-primary" style={{ marginTop: '0', padding: '0.625rem 1.25rem', fontSize: '0.9375rem' }} onClick={() => navigate('/delivery')}>
                                去接單或發布任務
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Rides Section */}
            {activeTab === 'rides' && (
                <div>


                    {loading ? (
                        <p>載入中...</p>
                    ) : myRides.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '3rem'
                        }}>
                            {myRides.map(ride => (
                                <RideCard key={ride.id} ride={ride} showActions={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#666', marginBottom: '3rem' }}>
                            <p>目前沒有發布的共乘行程</p>
                            <button
                                className="btn btn-primary"
                                style={{ marginTop: '1rem' }}
                                onClick={() => navigate('/search')}
                            >
                                去發布共乘
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Movers Section */}
            {activeTab === 'movers' && (
                <div>

                    {loading ? (
                        <p>載入中...</p>
                    ) : myMovers.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {myMovers.map(mover => (
                                <MoverCard key={mover.id} mover={mover} showActions={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                            <p>目前沒有註冊的搬家服務</p>
                            <button
                                className="btn btn-primary"
                                style={{ marginTop: '1rem' }}
                                onClick={() => navigate('/logistics')}
                            >
                                成為搬家夥伴
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeChatErrandId && (
                <ChatRoom
                    itemId={activeChatErrandId}
                    type="errand"
                    currentUser={user}
                    onClose={() => setActiveChatErrandId(null)}
                    onComplete={() => {
                        setActiveChatErrandId(null);
                        fetchMyData(user.id);
                    }}
                />
            )}
            {/* Logout Button */}
            <div style={{ marginTop: '2rem', paddingBottom: '1rem' }}>
                <button
                    onClick={() => {
                        if (window.confirm('確定要登出嗎？')) {
                            localStorage.removeItem('user');
                            navigate('/login');
                            window.location.reload();
                        }
                    }}
                    className="btn"
                    style={{
                        width: '100%',
                        backgroundColor: '#fff',
                        color: '#dc3545',
                        border: '1px solid #dc3545',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>🚪</span>
                    登出帳號
                </button>
            </div>
        </div>
    );
}
