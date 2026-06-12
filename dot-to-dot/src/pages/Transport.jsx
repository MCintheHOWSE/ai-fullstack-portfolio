import React, { useState } from 'react';
import RideCard from '../components/RideCard';
import { rides } from '../data/mockData';

const Transport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'scooter', 'car'

  const filteredRides = rides.filter(ride => {
    const matchesSearch = ride.destination.includes(searchTerm) || ride.origin.includes(searchTerm);
    const matchesType = filterType === 'all' || ride.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>🛵 交通共乘</h1>
          <p style={{ color: 'var(--color-text-light)' }}>尋找順路的夥伴，一起分攤油資！</p>
        </div>
        <button className="btn btn-primary">
          + 發布共乘
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)' }}>
        <div className="flex gap-md items-center" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="輸入出發地或目的地..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '1rem'
              }}
            />
          </div>
          <div className="flex gap-sm">
            <button
              className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline'} `}
              onClick={() => setFilterType('all')}
            >
              全部
            </button>
            <button
              className={`btn ${filterType === 'scooter' ? 'btn-primary' : 'btn-outline'} `}
              onClick={() => setFilterType('scooter')}
            >
              🛵 機車
            </button>
            <button
              className={`btn ${filterType === 'car' ? 'btn-primary' : 'btn-outline'} `}
              onClick={() => setFilterType('car')}
            >
              🚗 汽車
            </button>
          </div>
        </div>
      </div>

      {/* Ride List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
        {filteredRides.map(ride => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </div>

      {filteredRides.length === 0 && (
        <div className="text-center" style={{ padding: 'var(--spacing-xl)', color: 'var(--color-text-light)' }}>
          <p>沒有找到符合條件的共乘行程。</p>
        </div>
      )}
    </div>
  );
};

export default Transport;
