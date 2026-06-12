import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RideCard from '../components/RideCard';
import RidePublishForm from '../components/RidePublishForm';
import { rides as mockRides } from '../data/mockData';

export default function Search() {
    const [filterType, setFilterType] = useState('all'); // 'all', 'scooter', 'car'
    const [searchTerm, setSearchTerm] = useState('');
    const [rides, setRides] = useState([]);
    const [filteredRides, setFilteredRides] = useState([]);
    const [showPublishForm, setShowPublishForm] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const targetChatId = queryParams.get('chatId');

    // Fetch rides from API
    useEffect(() => {
        const fetchRides = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/rides', { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    // Get API data
                    const apiRides = data.data || data || [];
                    // Combine API rides with mock rides, ensuring mock rides are always shown
                    const combinedRides = [...apiRides, ...mockRides];
                    setRides(combinedRides);
                    setFilteredRides(combinedRides);
                } else {
                    console.error('Failed to fetch rides');
                    setRides(mockRides); // Fallback to mock data
                    setFilteredRides(mockRides);
                }
            } catch (error) {
                console.error('Error fetching rides:', error);
                setRides(mockRides); // Fallback to mock data
                setFilteredRides(mockRides);
            }
        };
        fetchRides();
    }, []);

    useEffect(() => {
        let result = rides;

        // Filter by type
        if (filterType !== 'all') {
            result = result.filter(ride => ride.type === filterType);
        }

        // Filter by search term (origin or destination)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(ride =>
                ride.origin.includes(searchTerm) ||
                ride.destination.includes(searchTerm)
            );
        }

        setFilteredRides(result);
    }, [filterType, searchTerm, rides]);

    const handlePostRide = () => {
        const user = localStorage.getItem('user');
        if (!user) {
            alert('請先登入會員以發布共乘');
            navigate('/login');
        } else {
            setShowPublishForm(true);
        }
    };

    const handlePublishSuccess = (newRide) => {
        // Add new ride to the list
        setRides([newRide, ...rides]);
        alert('成功發布共乘！');
    };

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            {/* Header */}
            <div className="flex justify-between items-end flex-col-mobile items-start-mobile gap-sm-mobile" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🛵</span> 交通共乘
                    </h1>
                    <p style={{ color: '#666' }}>尋找順路的夥伴，一起分攤油資！</p>
                </div>
                <button
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem' }}
                    onClick={handlePostRide}
                >
                    + 發布共乘
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <input
                        type="text"
                        placeholder="輸入出發地或目的地..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                <div className="flex gap-sm">
                    <button
                        className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilterType('all')}
                        style={{ backgroundColor: filterType === 'all' ? '#A00C24' : 'transparent', borderColor: '#A00C24', color: filterType === 'all' ? 'white' : '#A00C24' }}
                    >
                        全部
                    </button>
                    <button
                        className={`btn ${filterType === 'scooter' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilterType('scooter')}
                        style={{ display: 'flex', gap: '0.5rem' }}
                    >
                        <span>🛵</span> 機車
                    </button>
                    <button
                        className={`btn ${filterType === 'car' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilterType('car')}
                        style={{ display: 'flex', gap: '0.5rem' }}
                    >
                        <span>🚗</span> 汽車
                    </button>
                </div>
            </div>

            {/* Ride List */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
            }}>
                {filteredRides.map(ride => (
                    <RideCard key={ride.id} ride={ride} targetChatId={targetChatId} />
                ))}
            </div>

            {filteredRides.length === 0 && (
                <div className="text-center" style={{ padding: '4rem', color: '#999' }}>
                    <p>沒有找到符合條件的共乘。</p>
                </div>
            )}

            {/* Publish Form Modal */}
            {showPublishForm && (
                <RidePublishForm
                    onClose={() => setShowPublishForm(false)}
                    onSuccess={handlePublishSuccess}
                />
            )}
        </div>
    );
}
