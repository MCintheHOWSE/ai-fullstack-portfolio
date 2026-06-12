import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ currentUser }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [taskType, setTaskType] = useState('errand'); // errand, ride, mover
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        // Check if user is admin (support both role and is_admin for legacy compatibility)
        if (!currentUser || (currentUser.role !== 'admin' && !currentUser.is_admin)) {
            alert('Access Denied');
            navigate('/');
            return;
        }
        fetchStats();
    }, [currentUser, navigate]);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'tasks') fetchTasks();
    }, [activeTab, taskType]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { 'x-user-id': currentUser.id }
            });
            const data = await res.json();
            if (res.ok) setStats(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'x-user-id': currentUser.id }
            });
            const data = await res.json();
            if (res.ok) setUsers(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tasks/${taskType}`, {
                headers: { 'x-user-id': currentUser.id }
            });
            const data = await res.json();
            if (res.ok) setTasks(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': currentUser.id }
            });
            if (res.ok) {
                alert('User deleted');
                fetchUsers();
                fetchStats();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const res = await fetch(`/api/admin/tasks/${taskType}/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': currentUser.id }
            });
            if (res.ok) {
                alert('Task deleted');
                fetchTasks();
                fetchStats();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser({ ...user });
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': currentUser.id
                },
                body: JSON.stringify({ name: editingUser.name, role: editingUser.role })
            });
            if (res.ok) {
                alert('User updated');
                setEditingUser(null);
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1>🛡️ 管理員後台</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #ddd' }}>
                <button
                    className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    總覽 (Overview)
                </button>
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('users')}
                >
                    用戶管理 (Users)
                </button>
                <button
                    className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('tasks')}
                >
                    任務管理 (Tasks)
                </button>
            </div>

            {activeTab === 'overview' && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div
                        className="card"
                        style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => setActiveTab('users')}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <h3>👥 總用戶數</h3>
                        <div style={{ fontSize: '3rem', color: '#C8102E' }}>{stats.users}</div>
                    </div>
                    <div
                        className="card"
                        style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => { setActiveTab('tasks'); setTaskType('errand'); }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <h3>🏃 跑腿任務</h3>
                        <div style={{ fontSize: '3rem', color: '#C8102E' }}>{stats.errands}</div>
                    </div>
                    <div
                        className="card"
                        style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => { setActiveTab('tasks'); setTaskType('ride'); }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <h3>🚗 共乘行程</h3>
                        <div style={{ fontSize: '3rem', color: '#C8102E' }}>{stats.rides}</div>
                    </div>
                    <div
                        className="card"
                        style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => { setActiveTab('tasks'); setTaskType('delivery'); }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <h3>📦 物流配送</h3>
                        <div style={{ fontSize: '3rem', color: '#C8102E' }}>{stats.deliveries}</div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div>
                    {loading ? <p>Loading...</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>ID</th>
                                    <th style={{ padding: '1rem' }}>姓名</th>
                                    <th style={{ padding: '1rem' }}>Email</th>
                                    <th style={{ padding: '1rem' }}>角色</th>
                                    <th style={{ padding: '1rem' }}>評分</th>
                                    <th style={{ padding: '1rem' }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem' }}>{user.id}</td>
                                        <td style={{ padding: '1rem' }}>{user.name}</td>
                                        <td style={{ padding: '1rem' }}>{user.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                backgroundColor: user.role === 'admin' ? '#C8102E' : '#eee',
                                                color: user.role === 'admin' ? 'white' : '#333',
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{user.rating ? user.rating.toFixed(1) : '-'} ({user.rating_count})</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                style={{ color: 'blue', border: 'none', background: 'none', cursor: 'pointer', marginRight: '1rem' }}
                                            >
                                                編輯
                                            </button>
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                                                >
                                                    刪除
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'tasks' && (
                <div>
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                            className={`btn ${taskType === 'errand' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setTaskType('errand')}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            跑腿 (Errands)
                        </button>
                        <button
                            className={`btn ${taskType === 'ride' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setTaskType('ride')}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            共乘 (Rides)
                        </button>
                        <button
                            className={`btn ${taskType === 'delivery' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setTaskType('delivery')}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            物流 (Deliveries)
                        </button>
                    </div>

                    {loading ? <p>Loading...</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>ID</th>
                                    <th style={{ padding: '1rem' }}>發布者</th>
                                    <th style={{ padding: '1rem' }}>內容/路線</th>
                                    <th style={{ padding: '1rem' }}>狀態</th>
                                    <th style={{ padding: '1rem' }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem' }}>{task.id}</td>
                                        <td style={{ padding: '1rem' }}>{task.creator_name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {taskType === 'errand' ? task.item :
                                                taskType === 'ride' ? `${task.origin} -> ${task.destination}` :
                                                    task.vehicle}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{task.status}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                                            >
                                                刪除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {editingUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '300px' }}>
                        <h3>編輯用戶</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>姓名</label>
                            <input
                                type="text"
                                value={editingUser.name}
                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>角色</label>
                            <select
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingUser(null)} className="btn btn-outline">取消</button>
                            <button onClick={handleUpdateUser} className="btn btn-primary">儲存</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
