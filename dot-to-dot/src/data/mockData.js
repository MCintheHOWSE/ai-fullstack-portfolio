// Minimal fallback data for API failures
// Only used when backend is unavailable

export const rides = [
    {
        id: 'mock-1',
        driver: '範例司機',
        department: '資管系',
        vehicle: 'Yamaha 勁戰',
        type: 'scooter',
        origin: '外雙溪校區',
        destination: '士林捷運站',
        time: '08:30',
        date: '2025-11-25',
        price: 30,
        seats: 1,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
        description: '這是範例資料，請連接伺服器查看真實共乘資訊'
    }
];

// Note: movers and restaurants exports removed as they were never used
