import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './CustomerLayout.css';

const CustomerLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'C';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="customer-layout">
            <div className="customer-layout__main-wrap customer-layout__main-wrap--full">
                <header className="customer-layout__header">
                    <div className="customer-layout__header-left" onClick={() => navigate('/customer')}>
                        <div className="customer-layout__brand-icon">A</div>
                        <div>
                            <div className="customer-layout__brand-title">Auto Assist</div>
                            <div className="customer-layout__brand-subtitle">Customer Portal</div>
                        </div>
                    </div>

                    <div className="customer-layout__nav-list">
                        <NavLink to="/customer" end className={({ isActive }) => `customer-layout__nav-link ${isActive ? 'customer-layout__nav-link--active' : ''}`}>
                            Home
                        </NavLink>
                        <NavLink to="/customer/tracking" className={({ isActive }) => `customer-layout__nav-link ${isActive ? 'customer-layout__nav-link--active' : ''}`}>
                            Track Car
                        </NavLink>
                        <NavLink to="/customer/book" className={({ isActive }) => `customer-layout__nav-link ${isActive ? 'customer-layout__nav-link--active' : ''}`}>
                            Booking
                        </NavLink>
                        <NavLink to="/customer/history" className={({ isActive }) => `customer-layout__nav-link ${isActive ? 'customer-layout__nav-link--active' : ''}`}>
                            History
                        </NavLink>
                        <NavLink to="/customer/chat" className={({ isActive }) => `customer-layout__nav-link ${isActive ? 'customer-layout__nav-link--active' : ''}`}>
                            Chat
                        </NavLink>
                        <NavLink to="/customer/inventory" className={({ isActive }) => `customer-layout__nav-link ${isActive ? 'customer-layout__nav-link--active' : ''}`}>
                            Inventory
                        </NavLink>
                        <NavLink to="/customer/cart" className={({ isActive }) => `customer-layout__nav-link ${isActive ? 'customer-layout__nav-link--active' : ''}`}>
                            Cart
                        </NavLink>
                    </div>

                    <div className="customer-layout__header-clock">
                        {currentTime.toLocaleTimeString()}
                    </div>

                    <div className="customer-layout__profile-wrap" ref={dropdownRef}>
                        <div
                            className="customer-layout__profile-trigger"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <div className="customer-layout__profile-meta">
                                <div className="customer-layout__profile-name">{user?.name}</div>
                                <div className="customer-layout__profile-role">Customer Account</div>
                            </div>
                            <div className="customer-layout__avatar">
                                {getInitials(user?.name)}
                            </div>
                        </div>

                        {showDropdown && (
                            <div className="customer-layout__dropdown">
                                <div className="customer-layout__dropdown-head">
                                    <div className="customer-layout__dropdown-name">{user?.name}</div>
                                    <div className="customer-layout__dropdown-email">{user?.email}</div>
                                </div>
                                <div className="customer-layout__dropdown-links">
                                    <button onClick={() => { navigate('/customer/profile'); setShowDropdown(false); }} className="customer-layout__dropdown-btn">
                                        <span className="customer-layout__dropdown-icon">👤</span> My Profile
                                    </button>
                                    <button onClick={() => { navigate('/customer/profile'); setShowDropdown(false); }} className="customer-layout__dropdown-btn">
                                        <span className="customer-layout__dropdown-icon">⚙️</span> Settings
                                    </button>
                                    <div className="customer-layout__dropdown-sep"></div>
                                    <button onClick={handleLogout} className="customer-layout__dropdown-btn customer-layout__dropdown-btn--danger">
                                        <span className="customer-layout__dropdown-icon">🚪</span> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="customer-layout__main custom-scrollbar">
                    <div className="customer-layout__main-inner">
                        <div className="customer-layout__page">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerLayout;


