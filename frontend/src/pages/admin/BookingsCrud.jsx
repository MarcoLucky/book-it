import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function BookingsCrud() {
    const [bookings, setBookings] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);

    const [formData, setFormData] = useState({
        user_id: '',
        amenity_id: '',
        start_time: '',
        end_time: '',
        purpose: '',
        status: 'approved'
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const bookingsResponse = await api.get('/admin/bookings');
            setBookings(bookingsResponse.data);

            const amenitiesResponse = await api.get('/admin/amenities');
            setAmenities(amenitiesResponse.data.filter(a => a.status === 'active'));

            const usersResponse = await api.get('/admin/users');
            setUsers(usersResponse.data.filter(u => u.role === 'user')); // only residents
        } catch (err) {
            console.error('Error fetching admin bookings data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleOpenCreate = () => {
        setEditingBooking(null);
        setFormData({
            user_id: users.length > 0 ? users[0].id : '',
            amenity_id: amenities.length > 0 ? amenities[0].id : '',
            start_time: '',
            end_time: '',
            purpose: '',
            status: 'approved'
        });
        setError('');
        setShowModal(true);
    };

    const handleOpenEdit = (booking) => {
        setEditingBooking(booking);

        const formatDateTime = (dateStr) => {
            const date = new Date(dateStr);
            const pad = (n) => n.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        };

        setFormData({
            user_id: booking.user_id,
            amenity_id: booking.amenity_id,
            start_time: formatDateTime(booking.start_time),
            end_time: formatDateTime(booking.end_time),
            purpose: booking.purpose || '',
            status: booking.status
        });
        setError('');
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const start = new Date(formData.start_time);
        const end = new Date(formData.end_time);

        if (end <= start) {
            setError('End time must be after the start time.');
            setSaving(false);
            return;
        }

        try {
            if (editingBooking) {
                await api.put(`/admin/bookings/${editingBooking.id}`, formData);
            } else {
                await api.post('/admin/bookings', formData);
            }
            setShowModal(false);
            await fetchAllData();
        } catch (err) {
            console.error('Submit admin booking error:', err);
            setError(err.response?.data?.message || 'Failed to save booking. Double-booking conflict detected.');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusUpdate = async (booking, newStatus) => {
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
            await fetchAllData();
        } catch (err) {
            console.error('Admin status update error:', err);
            alert(err.response?.data?.message || 'Failed to update booking status.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm('Are you sure you want to permanently delete this booking record?')) {
            return;
        }

        try {
            await api.delete(`/admin/bookings/${bookingId}`);
            await fetchAllData();
        } catch (err) {
            console.error('Delete booking error:', err);
            alert('Failed to delete booking.');
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
                return 'bg-slate-100 text-gray-700 border border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
                    <p className="text-sm text-gray-600 mt-1">Review, approve, modify, or cancel reservation slots across all subdivision amenities.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-green-700 hover:bg-green-800 transition-colors"
                >
                    Book for Resident
                </button>
            </div>

            {loading ? (
                <div className="text-gray-500 font-medium py-4">Loading bookings data...</div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                                        Start Time
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        End Time
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {booking.user?.profile_image_url ? (
                                                    <img
                                                        src={booking.user.profile_image_url}
                                                        alt={booking.user.name}
                                                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
                                                        N/A
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-gray-900">{booking.user?.name}</div>
                                                    <div className="text-xs text-gray-500">{booking.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                                            {booking.amenity?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {formatDate(booking.start_time)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {formatDate(booking.end_time)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-0.5 text-xs rounded font-semibold uppercase ${getStatusStyle(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-3 text-sm font-semibold">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking, 'approved')}
                                                        disabled={actionLoading}
                                                        className="text-green-700 hover:text-green-900"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking, 'rejected')}
                                                        disabled={actionLoading}
                                                        className="text-yellow-700 hover:text-yellow-900"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'approved' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking, 'cancelled')}
                                                    disabled={actionLoading}
                                                    className="text-slate-600 hover:text-slate-900"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleOpenEdit(booking)}
                                                disabled={actionLoading}
                                                className="text-green-700 hover:text-green-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(booking.id)}
                                                disabled={actionLoading}
                                                className="text-red-700 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">
                                            No bookings found in the database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Simple Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-200 rounded-lg max-w-md w-full p-6 space-y-6">
                        <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingBooking ? 'Edit Booking details' : 'Book on behalf of Resident'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-650 text-xl font-semibold">&times;</button>
                        </div>

                        {error && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Select Resident *</label>
                                <select
                                    name="user_id"
                                    required
                                    disabled={!!editingBooking}
                                    value={formData.user_id}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm disabled:bg-gray-100"
                                >
                                    <option value="" disabled>Select resident...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Select Amenity *</label>
                                <select
                                    name="amenity_id"
                                    required
                                    disabled={!!editingBooking}
                                    value={formData.amenity_id}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm disabled:bg-gray-100"
                                >
                                    <option value="" disabled>Select facility...</option>
                                    {amenities.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.location})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Start Time *</label>
                                    <input
                                        type="datetime-local"
                                        name="start_time"
                                        required
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">End Time *</label>
                                    <input
                                        type="datetime-local"
                                        name="end_time"
                                        required
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Purpose</label>
                                <textarea
                                    name="purpose"
                                    rows="2"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
