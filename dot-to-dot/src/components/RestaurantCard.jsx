import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant, onViewMenu }) => {
    const navigate = useNavigate();

    const handleViewMenu = () => {
        const user = localStorage.getItem('user');
        if (!user) {
            alert('請先登入會員查看菜單');
            navigate('/login');
        } else {
            onViewMenu(restaurant);
        }
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img
                src={restaurant.image}
                alt={restaurant.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1rem' }}>
                <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{restaurant.name}</h3>
                    <div className="flex items-center gap-xs" style={{ backgroundColor: '#FFFBEB', padding: '2px 6px', borderRadius: '4px' }}>
                        <span>⭐</span>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{restaurant.rating}</span>
                    </div>
                </div>
                <div className="flex justify-between" style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    <span>{restaurant.category}</span>
                    <span>🕒 {restaurant.time} 分鐘</span>
                </div>
                <div className="flex gap-xs" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {restaurant.menu.map((item, idx) => (
                        <span key={idx} style={{ fontSize: '0.8rem', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '12px', color: '#4B5563' }}>{item}</span>
                    ))}
                </div>
                <button
                    className="btn btn-outline"
                    style={{ width: '100%', borderColor: '#C8102E', color: '#C8102E' }}
                    onClick={handleViewMenu}
                >
                    查看菜單
                </button>
            </div>
        </div>
    );
};

export default RestaurantCard;
