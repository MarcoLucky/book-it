import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Admin Dashboard', path: '/admin/dashboard' },
       
        { name: 'Manage Amenities', path: '/admin/amenities' },
        { name: 'Manage Bookings', path: '/admin/bookings' },
        { name: 'Add Admin', path: '/admin/add-admin' },
         { name: 'Profile', path: '/admin/profile' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <span className="font-semibold text-lg tracking-wider text-slate-100">Bloomfield Admin</span>
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
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-850">
                    <div className="text-sm font-medium truncate text-slate-200">{user?.name}</div>
                    <div className="text-xs text-slate-400 truncate mb-2">Administrator</div>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left text-xs font-semibold text-red-400 hover:text-red-300 py-1 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                    <div className="flex items-center space-x-4">
                        <span className="md:hidden font-semibold text-lg text-slate-900">Bloomfield Admin</span>
                        <span className="bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded font-semibold uppercase tracking-wider hidden md:inline-block">
                            Admin Mode
                        </span>
                    </div>
                    {/* Mobile Navigation Panel */}
                    <div className="flex items-center space-x-4">
                        <div className="md:hidden flex space-x-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`text-xs font-medium px-2 py-1 rounded ${
                                        location.pathname === item.path
                                            ? 'bg-blue-50 text-blue-600 font-semibold'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {item.name.replace('Manage ', '')}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="text-xs font-medium text-red-500 px-1 py-1 hover:text-red-700"
                            >
                                Log Out
                            </button>
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:block">
                            {user?.name}
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
