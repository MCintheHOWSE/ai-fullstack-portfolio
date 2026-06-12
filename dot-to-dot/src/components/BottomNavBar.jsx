import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNavBar() {
    const location = useLocation();

    // Don't show bottom nav on login/register pages
    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    const isActive = (path) => location.pathname === path;

    const navItems = [
        {
            path: '/',
            icon: '🏠',
            label: '首頁',
            active: isActive('/')
        },
        {
            path: '/logistics/lobby',
            icon: '🚚',
            label: '物流',
            active: location.pathname.startsWith('/logistics')
        },
        {
            path: '/activity',
            icon: '📋',
            label: '進行中',
            active: isActive('/activity'),
            disabled: true // TODO: Create Activity page
        },
        {
            path: '/chat',
            icon: '💬',
            label: '聊天',
            active: isActive('/chat')
        },
        {
            path: '/profile',
            icon: '👤',
            label: '我的',
            active: isActive('/profile')
        }
    ];

    return (
        <nav className="bottom-nav-bar">
            {navItems.map((item, index) => (
                <Link
                    key={index}
                    to={item.disabled ? '#' : item.path}
                    className={`bottom-nav-item ${item.active ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                    onClick={(e) => {
                        if (item.disabled) {
                            e.preventDefault();
                            alert('聊天功能開發中...');
                        }
                    }}
                >
                    <span className="bottom-nav-icon">{item.icon}</span>
                    <span className="bottom-nav-label">{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
