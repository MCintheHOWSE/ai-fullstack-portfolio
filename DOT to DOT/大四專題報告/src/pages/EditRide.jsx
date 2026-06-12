import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditRide() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        departureTime: '',
        seats: 1,
        price: 0,
        notes: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch ride details
        // In a real app, we would fetch from API by ID
        // For now, we'll try to find it in the list or fetch if API supports it
        const fetchRide = async () => {
            try {
                // Since we don't have a single ride endpoint in the initial setup, 
                // we might need to fetch all and find, or assume the backend supports /api/rides/:id
                // Let's assume we added GET /api/rides/:id or we can filter from all
                const response = await fetch('/api/rides');
                const data = await response.json();
                if (data.message === 'success') {
                    const ride = data.data.find(r => r.id === parseInt(id));
                    if (ride) {
                        setFormData({
                            origin: ride.origin,
                            destination: ride.destination,
                            departureTime: ride.departureTime,
                            seats: ride.seats,
                            price: ride.price,
                            notes: ride.notes || ''
                        });
                    } else {
                        alert('找不到此行程');
                        navigate('/search');
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchRide();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`/api/rides/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('行程更新成功！');
                navigate('/profile');
            } else {
                alert('更新失敗，請稍後再試。');
            }
        } catch (error) {
            console.error('Error updating ride:', error);
            alert('發生錯誤');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '800px' }}>
            <div className="card">
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>編輯行程</h2>
                <form className="flex flex-col gap-md">
                    <div className="flex gap-md flex-col-mobile">
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>出發地</label>
                            <select
                                name="origin"
                                value={formData.origin}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            >
                                <option>外雙溪校區</option>
                                <option>城中校區</option>
                                <option>捷運士林站</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>目的地</label>
                            <select
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            >
                                <option>捷運士林站</option>
                                <option>城中校區</option>
                                <option>外雙溪校區</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>出發時間</label>
                        <input
                            type="datetime-local"
                            name="departureTime"
                            value={formData.departureTime}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    <div className="flex gap-md">
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>提供座位數</label>
                            <input
                                type="number"
                                name="seats"
                                min="1"
                                max="6"
                                value={formData.seats}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>每人費用 (TWD)</label>
                            <input
                                type="number"
                                name="price"
                                min="0"
                                step="5"
                                value={formData.price}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>備註 (選填)</label>
                        <textarea
                            name="notes"
                            rows="3"
                            placeholder="例如：只載女生、不菸..."
                            value={formData.notes}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        ></textarea>
                    </div>

                    <div className="flex gap-md" style={{ marginTop: '1rem' }}>
                        <button type="button" onClick={() => navigate('/search')} className="btn btn-outline" style={{ flex: 1, padding: '1rem' }}>
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
