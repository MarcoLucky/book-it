import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function BookingsList() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this reservation slot?')) {
            return;
        }

        setActionLoading(true);
        try {
            await api.post(`/bookings/${bookingId}/cancel`);
            // Refresh list
            await fetchBookings();
        } catch (error) {
            console.error('Cancel booking error:', error);
            alert(error.response?.data?.message || 'Failed to cancel the booking.');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border border-red-200';
            case 'cancelled':
            default:
                return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    }; 

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
                    <p className="text-sm text-gray-600 mt-1">Review, modify, or cancel your scheduled subdivision amenities bookings.</p>
                </div>
                <Link
                    to="/amenities"
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-green-700 hover:bg-green-800 transition-colors"
                >
                    Book New Facility
                </Link>
            </div>

            {loading ? (
                <div className="text-gray-500 font-medium py-4">Loading your bookings...</div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Amenity
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Start Time
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        End Time
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Purpose
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="relative px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                                            {booking.amenity?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {formatDate(booking.start_time)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {formatDate(booking.end_time)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                                            {booking.purpose || <span className="text-gray-400 italic">No purpose stated</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-0.5 text-xs rounded font-semibold uppercase ${getStatusStyle(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                                            {booking.status === 'pending' && (
                                                <button
                                                    onClick={() => navigate(`/bookings/edit/${booking.id}`)}
                                                    disabled={actionLoading}
                                                    className="text-green-700 hover:text-green-900 font-semibold disabled:opacity-50"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {(booking.status === 'pending' || booking.status === 'approved') && (
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    disabled={actionLoading}
                                                    className="text-red-700 hover:text-red-900 font-semibold disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">
                                            You have not made any bookings yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
