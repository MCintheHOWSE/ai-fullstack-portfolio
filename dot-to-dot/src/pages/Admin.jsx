import React, { useState, useEffect } from 'react';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            if (response.ok) {
                setUsers(data.data);
            } else {
                setError('無法載入用戶資料');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('無法連接伺服器');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getGenderText = (gender) => {
        if (gender === 'male') return '男生';
        if (gender === 'female') return '女生';
        return '未設定';
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
    };

    const handleUpdateUser = async (updatedData) => {
        try {
            const response = await fetch(`/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                alert('更新成功！');
                setEditingUser(null);
                fetchUsers(); // Refresh list
            } else {
                const data = await response.json();
                alert('更新失敗: ' + (data.error || '未知錯誤'));
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('更新時發生錯誤');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('用戶已刪除');
                setEditingUser(null);
                fetchUsers(); // Refresh list
            } else {
                const data = await response.json();
                alert('刪除失敗: ' + (data.error || '未知錯誤'));
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('刪除時發生錯誤');
        }
    };

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>👥</span> 管理後台
                </h1>
                <p style={{ color: '#666' }}>查看並管理所有註冊用戶的資料</p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#FEE2E2',
                    color: '#B91C1C',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    載入中...
                </div>
            ) : (
                <div className="card" style={{ padding: '0', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>ID</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>姓名</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Email</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>性別</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>身份</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>註冊時間</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                                        目前沒有註冊用戶
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '1rem', color: '#6B7280' }}>{user.id}</td>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{user.name}</td>
                                        <td style={{ padding: '1rem', color: '#6B7280', fontFamily: 'monospace' }}>{user.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.875rem',
                                                backgroundColor: user.gender === 'male' ? '#DBEAFE' : '#FCE7F3',
                                                color: user.gender === 'male' ? '#1E40AF' : '#BE185D'
                                            }}>
                                                {getGenderText(user.gender)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {user.is_admin ? (
                                                <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold', marginRight: '0.5rem' }}>網站管理員</span>
                                            ) : user.is_partner ? (
                                                <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>合作夥伴</span>
                                            ) : (
                                                <span style={{ color: '#9CA3AF' }}>一般會員</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#6B7280', fontSize: '0.875rem' }}>
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                onClick={() => handleEditClick(user)}
                                            >
                                                編輯
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {users.length > 0 && (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#F9FAFB',
                            borderTop: '1px solid #E5E7EB',
                            textAlign: 'center',
                            color: '#6B7280',
                            fontSize: '0.875rem'
                        }}>
                            總共 {users.length} 位用戶
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button
                    onClick={fetchUsers}
                    className="btn btn-outline"
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    🔄 重新整理
                </button>
            </div>

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleUpdateUser}
                    onDelete={handleDeleteUser}
                />
            )}
        </div>
    );
};

const EditUserModal = ({ user, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        gender: user.gender,
        is_partner: user.is_partner || 0
    });
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>編輯用戶資料</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>姓名</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>性別</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'white' }}
                        >
                            <option value="male">男生</option>
                            <option value="female">女生</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.is_partner === 1 || formData.is_partner === true}
                                onChange={(e) => setFormData({ ...formData, is_partner: e.target.checked ? 1 : 0 })}
                                style={{ width: '18px', height: '18px', accentColor: '#C8102E' }}
                            />
                            <span style={{ fontWeight: '500' }}>設為合作夥伴 (搬家/外送)</span>
                        </label>
                    </div>

                    <div className="flex gap-md" style={{ marginTop: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                        {isConfirmingDelete ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                                <span style={{ color: '#B91C1C', fontWeight: 'bold', fontSize: '0.9rem' }}>確定刪除？</span>
                                <button
                                    type="button"
                                    onClick={() => onDelete(user.id)}
                                    className="btn"
                                    style={{ backgroundColor: '#DC2626', color: 'white', border: 'none', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                >
                                    是，刪除
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmingDelete(false)}
                                    className="btn btn-outline"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                >
                                    取消
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsConfirmingDelete(true)}
                                className="btn"
                                style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none' }}
                            >
                                刪除用戶
                            </button>
                        )}

                        {!isConfirmingDelete && (
                            <div className="flex gap-md">
                                <button type="button" onClick={onClose} className="btn btn-outline">取消</button>
                                <button type="submit" className="btn btn-primary">儲存變更</button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Admin;
