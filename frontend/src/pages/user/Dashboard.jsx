import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function UserDashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.get('/bookings');
                setBookings(response.data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const approvedBookings = bookings.filter(b => b.status === 'approved').length;

    // Find the next upcoming approved booking
    const upcomingBooking = bookings
        .filter(b => b.status === 'approved' && new Date(b.start_time) > new Date())
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Resident Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Hello, {user?.name}. Welcome back to your Bloomfield Subdivision portal.</p>
            </div>

            {loading ? (
                <div className="text-gray-500 font-medium py-4">Loading stats...</div>
            ) : (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</h3>
                            <p className="mt-2 text-3xl font-extrabold text-gray-900">{totalBookings}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Approved Bookings</h3>
                            <p className="mt-2 text-3xl font-extrabold text-green-700">{approvedBookings}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Bookings</h3>
                            <p className="mt-2 text-3xl font-extrabold text-yellow-600">{pendingBookings}</p>
                        </div>
                    </div>

                    {/* Upcoming Booking Callout */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Schedule</h2>
                        {upcomingBooking ? (
                            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-green-900 text-lg">{upcomingBooking.amenity?.name}</h3>
                                    <p className="text-sm text-green-800">
                                        From: <span className="font-semibold">{formatDate(upcomingBooking.start_time)}</span>
                                    </p>
                                    <p className="text-sm text-green-800">
                                        To: <span className="font-semibold">{formatDate(upcomingBooking.end_time)}</span>
                                    </p>
                                    {upcomingBooking.purpose && (
                                        <p className="text-xs text-green-700 mt-2">
                                            Purpose: <span className="italic">{upcomingBooking.purpose}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <Link
                                        to="/bookings"
                                        className="inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded text-green-800 bg-white hover:bg-green-50"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic py-2">
                                No upcoming approved bookings scheduled.
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                to="/amenities"
                                className="block p-4 border border-gray-200 rounded-md hover:border-green-600 hover:bg-gray-50 transition-colors"
                            >
                                <h3 className="font-semibold text-slate-800">Reserve an Amenity</h3>
                                <p className="text-xs text-slate-500 mt-1">Browse available courts, clubhouse, or pools and secure a booking slot.</p>
                            </Link>
                            <Link
                                to="/bookings"
                                className="block p-4 border border-gray-200 rounded-md hover:border-green-600 hover:bg-gray-50 transition-colors"
                            >
                                <h3 className="font-semibold text-slate-800">View Booking History</h3>
                                <p className="text-xs text-slate-500 mt-1">Review requests, modify pending bookings, or cancel scheduled slots.</p>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
