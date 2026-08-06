import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard' },
       
        { name: 'View Amenities', path: '/amenities' },
        { name: 'My Bookings', path: '/bookings' },
        { name: 'Profile', path: '/profile' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-950 text-white border-r border-gray-950 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-gray-900">
                    <span className="font-semibold text-lg text-white">Bloomfield Portal</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`block px-4 py-2.5 rounded text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-900">
                    <div className="text-sm font-medium truncate text-white">{user?.name}</div>
                    <div className="text-xs text-gray-400 truncate mb-2">{user?.email}</div>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left text-xs font-semibold text-red-200 hover:text-white py-1 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-gray-950 border-b border-gray-900 flex items-center justify-between px-6 md:bg-white md:border-gray-200">
                    <div className="flex items-center space-x-4">
                        <span className="md:hidden font-semibold text-lg text-white">Bloomfield Portal</span>
                    </div>
                    {/* Mobile Navigation Panel */}
                    <div className="flex items-center space-x-4">
                        <div className="md:hidden flex space-x-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`text-xs font-medium px-2 py-1 rounded ${
                                        location.pathname === item.path
                                            ? 'bg-gray-800 text-white font-semibold'
                                            : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="text-xs font-medium text-red-200 px-2 py-1 hover:text-white"
                            >
                                Log Out
                            </button>
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:block">
                            Welcome, {user?.name}
                        </span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-grow p-6 overflow-y-auto max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
