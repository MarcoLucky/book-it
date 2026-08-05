import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsResponse = await api.get('/admin/stats');
            setStats(statsResponse.data);

            const bookingsResponse = await api.get('/admin/bookings');
            // Filter only pending bookings for the dashboard
            const pendingOnly = bookingsResponse.data.filter(b => b.status === 'pending');
            setRecentBookings(pendingOnly.slice(0, 5)); // show top 5 pending
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (booking, newStatus) => {
        setActionLoading(true);
        try {
            await api.put(`/admin/bookings/${booking.id}`, {
                user_id: booking.user_id,
                amenity_id: booking.amenity_id,
                start_time: booking.start_time,
                end_time: booking.end_time,
                purpose: booking.purpose,
                status: newStatus
            });
            await fetchData();
        } catch (error) {
            console.error('Status update error:', error);
            alert(error.response?.data?.message || 'Failed to update booking status.');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Subdivision statistics overview and pending booking management.</p>
            </div>

            {loading ? (
                <div className="text-gray-500 font-medium py-4">Loading stats & requests...</div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</h3>
                            <p className="mt-2 text-3xl font-extrabold text-slate-900">{stats?.total_bookings}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Approvals</h3>
                            <p className="mt-2 text-3xl font-extrabold text-yellow-600">{stats?.pending_bookings}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Amenities</h3>
                            <p className="mt-2 text-3xl font-extrabold text-blue-600">{stats?.total_amenities}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Residents Registered</h3>
                            <p className="mt-2 text-3xl font-extrabold text-green-700">{stats?.total_users}</p>
                        </div>
                    </div>

                    {/* Pending Approvals Table */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Pending Approvals Queue</h2>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded font-semibold uppercase">
                                Action Needed
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Resident
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Amenity
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Timeslot
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Purpose
                                        </th>
                                        <th scope="col" className="relative px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900">{booking.user?.name}</div>
                                                <div className="text-xs text-gray-500">{booking.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                                                {booking.amenity?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                                                <div>{formatDate(booking.start_time)} to</div>
                                                <div>{formatDate(booking.end_time)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                                                {booking.purpose || <span className="text-gray-400 italic">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-3 text-sm font-semibold">
                                                <button
                                                    onClick={() => handleAction(booking, 'approved')}
                                                    disabled={actionLoading}
                                                    className="text-green-700 hover:text-green-900 disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(booking, 'rejected')}
                                                    disabled={actionLoading}
                                                    className="text-red-700 hover:text-red-900 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {recentBookings.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic">
                                                All bookings are currently processed. No pending requests.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
