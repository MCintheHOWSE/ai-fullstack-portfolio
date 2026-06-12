import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { isAdmin } from '../utils/auth';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
        window.location.reload();
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav style={{
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container flex justify-between items-center">
                <Link to="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#C8102E',
                    textDecoration: 'none'
                }} onClick={closeMenu}>
                    Dot to Dot
                </Link>

                {/* Desktop Menu */}
                {location.pathname !== '/admin' && (
                    <div className="flex gap-lg items-center hidden-mobile">
                        <Link
                            to="/search"
                            style={{
                                color: isActive('/search') ? '#C8102E' : '#666',
                                fontWeight: isActive('/search') ? 'bold' : 'normal',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            交通共乘
                        </Link>
                        <Link
                            to="/delivery"
                            style={{
                                color: isActive('/delivery') ? '#C8102E' : '#666',
                                fontWeight: isActive('/delivery') ? 'bold' : 'normal',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            校園跑腿
                        </Link>
                        <Link
                            to="/logistics"
                            style={{
                                color: isActive('/logistics') ? '#C8102E' : '#666',
                                fontWeight: isActive('/logistics') ? 'bold' : 'normal',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            物流搬家
                        </Link>
                        {user ? (
                            <div className="flex items-center gap-md">
                                {isAdmin(user) && (
                                    <Link to="/admin" style={{ color: '#C8102E', textDecoration: 'none', fontWeight: 'bold', marginRight: '0.5rem' }}>
                                        管理後台
                                    </Link>
                                )}
                                <NotificationBell currentUser={user} />
                                <Link to="/profile" style={{ color: '#666', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#C8102E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    Hi, {user.name}
                                </Link>
                                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                                    登出
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                登入 / 註冊
                            </Link>
                        )}
                    </div>
                )}

                {/* Mobile Menu Button */}
                <button
                    className="visible-mobile"
                    onClick={toggleMenu}
                    style={{ fontSize: '1.5rem', padding: '0.5rem' }}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <Link to="/search" onClick={closeMenu} style={{ color: isActive('/search') ? '#C8102E' : '#333', fontWeight: isActive('/search') ? 'bold' : 'normal' }}>
                        交通共乘
                    </Link>
                    <Link to="/delivery" onClick={closeMenu} style={{ color: isActive('/delivery') ? '#C8102E' : '#333', fontWeight: isActive('/delivery') ? 'bold' : 'normal' }}>
                        校園跑腿
                    </Link>
                    <Link to="/logistics" onClick={closeMenu} style={{ color: isActive('/logistics') ? '#C8102E' : '#333', fontWeight: isActive('/logistics') ? 'bold' : 'normal' }}>
                        物流搬家
                    </Link>
                    {user ? (
                        <>
                            {isAdmin(user) && (
                                <Link to="/admin" onClick={closeMenu} style={{ color: '#C8102E', fontWeight: 'bold' }}>
                                    管理後台
                                </Link>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                                <NotificationBell currentUser={user} />
                            </div>
                            <Link to="/profile" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#C8102E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                    {user.name.charAt(0)}
                                </div>
                                Hi, {user.name}
                            </Link>
                            <button onClick={() => { handleLogout(); closeMenu(); }} style={{ color: '#C8102E', padding: '1rem', borderBottom: '1px solid #f0f0f0', width: '100%' }}>
                                登出
                            </button>
                        </>
                    ) : (
                        <Link to="/login" onClick={closeMenu} style={{ color: '#C8102E', fontWeight: 'bold' }}>
                            登入 / 註冊
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
