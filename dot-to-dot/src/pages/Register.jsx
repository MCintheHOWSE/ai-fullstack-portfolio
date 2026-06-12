import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const [code, setCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const handleSendCode = async () => {
        if (!studentId) {
            setStatus({ type: 'error', message: '請先輸入學號' });
            return;
        }

        setStatus({ type: '', message: '' });
        const email = `${studentId}@scu.edu.tw`;

        try {
            const response = await fetch('/api/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: '驗證碼已發送至您的東吳信箱，請查收' });
                setIsCodeSent(true);
                setCountdown(60);
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setStatus({ type: 'error', message: data.error || '發送失敗' });
            }
        } catch (error) {
            console.error('Send code error:', error);
            setStatus({ type: 'error', message: '無法連接伺服器' });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (!gender) {
            setStatus({ type: 'error', message: '請選擇性別' });
            return;
        }

        if (!code) {
            setStatus({ type: 'error', message: '請輸入驗證碼' });
            return;
        }

        const email = `${studentId}@scu.edu.tw`;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, gender, code })
            });
            const data = await response.json();
            if (response.ok) {
                setStatus({ type: 'success', message: '註冊成功！正在跳轉至登入頁面...' });
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                const errorMsg = data.error || '';
                if (errorMsg.includes('UNIQUE constraint failed')) {
                    setStatus({ type: 'error', message: '此學號已被註冊，請直接登入' });
                } else {
                    setStatus({ type: 'error', message: errorMsg || '註冊失敗，請稍後再試' });
                }
            }
        } catch (error) {
            console.error('Register error:', error);
            setStatus({ type: 'error', message: '無法連接伺服器，請稍後再試' });
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '400px' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.5rem' }}>註冊帳號</h2>

                {status.message && (
                    <div style={{
                        backgroundColor: status.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                        color: status.type === 'success' ? '#065F46' : '#B91C1C',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-md">
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>姓名</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="請輸入真實姓名"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>學號 (東吳信箱)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                required
                                placeholder="例如: 11173000"
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                            />
                            <span style={{ color: '#666', fontWeight: '500' }}>@scu.edu.tw</span>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>驗證碼</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                placeholder="輸入6位數驗證碼"
                                maxLength="6"
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                            />
                            <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={countdown > 0 || !studentId}
                                className="btn"
                                style={{
                                    backgroundColor: countdown > 0 ? '#E5E7EB' : '#4B5563',
                                    color: 'white',
                                    whiteSpace: 'nowrap',
                                    cursor: countdown > 0 || !studentId ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {countdown > 0 ? `${countdown}s 後重發` : '發送驗證碼'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>密碼</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="設定登入密碼"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>性別</label>
                        <div style={{ display: 'flex', gap: '1.5rem', paddingLeft: '0.5rem' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={gender === 'male'}
                                    onChange={(e) => setGender(e.target.value)}
                                    style={{ width: '18px', height: '18px', accentColor: '#C8102E', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.95rem' }}>男生</span>
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === 'female'}
                                    onChange={(e) => setGender(e.target.value)}
                                    style={{ width: '18px', height: '18px', accentColor: '#C8102E', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.95rem' }}>女生</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                        註冊
                    </button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    已有帳號？ <Link to="/login" style={{ color: '#C8102E' }}>立即登入</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
