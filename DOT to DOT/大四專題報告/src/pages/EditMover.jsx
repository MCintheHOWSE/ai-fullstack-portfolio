import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditMover() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        vehicle: '機車',
        capacity: '少量物品',
        price: 300,
        tags: []
    });
    const [loading, setLoading] = useState(true);

    const vehicleOptions = [
        '機車',
        '小貨車 (3.5噸)',
        '中型貨車 (5噸)',
        '大型貨車 (10噸以上)'
    ];

    const tagOptions = [
        '宿舍搬遷',
        '校外租屋',
        '家具搬運',
        '快速到府',
        '可代購紙箱',
        '樓層搬運'
    ];

    useEffect(() => {
        const fetchMover = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/movers');
                const data = await response.json();
                if (data.message === 'success') {
                    const mover = data.data.find(m => m.id === parseInt(id));
                    if (mover) {
                        setFormData({
                            vehicle: mover.vehicle,
                            capacity: mover.capacity,
                            price: mover.price,
                            tags: typeof mover.tags === 'string' ? mover.tags.split(',') : (Array.isArray(mover.tags) ? mover.tags : [])
                        });
                    } else {
                        alert('找不到此搬家服務');
                        navigate('/profile');
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMover();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/movers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('搬家服務更新成功！');
                navigate('/profile');
            } else {
                alert('更新失敗，請稍後再試。');
            }
        } catch (error) {
            console.error('Error updating mover:', error);
            alert('發生錯誤');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '800px' }}>
            <div className="card">
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>編輯搬家服務</h2>
                <form className="flex flex-col gap-md">
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>交通工具</label>
                        <select
                            name="vehicle"
                            value={formData.vehicle}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        >
                            {vehicleOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>載運量</label>
                        <input
                            type="text"
                            name="capacity"
                            placeholder="例如：少量物品、單人套房搬家"
                            value={formData.capacity}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>預估費用 (TWD/趟)</label>
                        <input
                            type="number"
                            name="price"
                            min="0"
                            step="50"
                            value={formData.price}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500' }}>
                            服務標籤（可多選）
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {tagOptions.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagToggle(tag)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: formData.tags.includes(tag) ? 'none' : '1px solid #C8102E',
                                        backgroundColor: formData.tags.includes(tag) ? '#C8102E' : 'transparent',
                                        color: formData.tags.includes(tag) ? 'white' : '#C8102E',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-md" style={{ marginTop: '1rem' }}>
                        <button type="button" onClick={() => navigate('/profile')} className="btn btn-outline" style={{ flex: 1, padding: '1rem' }}>
                            取消
                        </button>
                        <button type="button" onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>
                            儲存修改
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
