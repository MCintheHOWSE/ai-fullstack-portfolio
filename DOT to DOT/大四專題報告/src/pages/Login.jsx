import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const email = `${studentId}@scu.edu.tw`;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.data));
                // Use a small timeout to allow state update before reload/redirect
                setTimeout(() => {
                    navigate('/');
                    window.location.reload();
                }, 100);
            } else {
                setError(data.message || '登入失敗，請檢查帳號密碼');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('無法連接伺服器，請稍後再試');
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '400px' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.5rem' }}>會員登入</h2>
                {error && (
                    <div style={{
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogin} className="flex flex-col gap-md">
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
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>密碼</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                        登入
                    </button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    還沒有帳號？ <Link to="/register" style={{ color: '#C8102E' }}>立即註冊</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
