import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import api from '../../services/api';

export default function BookingForm() {
    const { id } = useParams(); // populated if editing
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const isEditMode = !!id;
    const urlAmenityId = searchParams.get('amenity_id');

    const [amenities, setAmenities] = useState([]);
    const [formData, setFormData] = useState({
        amenity_id: urlAmenityId || '',
        start_time: '',
        end_time: '',
        purpose: '',
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const response = await api.get('/amenities');
                setAmenities(response.data);
                if (!isEditMode && !formData.amenity_id && response.data.length > 0) {
                    setFormData(prev => ({ ...prev, amenity_id: response.data[0].id }));
                }
            } catch (err) {
                console.error('Error fetching amenities:', err);
            }
        };

        const fetchBookingForEdit = async () => {
            if (!isEditMode) return;
            setFetching(true);
            try {
                // Fetch all bookings and find the one we are editing
                const response = await api.get('/bookings');
                const booking = response.data.find(b => b.id.toString() === id);
                if (booking) {
                    if (booking.status !== 'pending') {
                        setError('Only pending bookings can be edited.');
                        return;
                    }
                    
                    // Format datetime-local value (YYYY-MM-DDTHH:MM)
                    const formatDateTime = (dateStr) => {
                        const date = new Date(dateStr);
                        const pad = (n) => n.toString().padStart(2, '0');
                        const yyyy = date.getFullYear();
                        const mm = pad(date.getMonth() + 1);
                        const dd = pad(date.getDate());
                        const hh = pad(date.getHours());
                        const min = pad(date.getMinutes());
                        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
                    };

                    setFormData({
                        amenity_id: booking.amenity_id,
                        start_time: formatDateTime(booking.start_time),
                        end_time: formatDateTime(booking.end_time),
                        purpose: booking.purpose || '',
                    });
                } else {
                    setError('Booking record not found.');
                }
            } catch (err) {
                setError('Failed to retrieve booking information.');
            } finally {
                setFetching(false);
            }
        };

        fetchAmenities().then(() => fetchBookingForEdit());
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Client-side quick check
        const start = new Date(formData.start_time);
        const end = new Date(formData.end_time);

        if (start < new Date() && !isEditMode) {
            setError('Start time must be in the future.');
            setLoading(false);
            return;
        }

        if (end <= start) {
            setError('End time must be after the start time.');
            setLoading(false);
            return;
        }

        try {
            if (isEditMode) {
                await api.put(`/bookings/${id}`, {
                    start_time: formData.start_time,
                    end_time: formData.end_time,
                    purpose: formData.purpose
                });
            } else {
                await api.post('/bookings', {
                    amenity_id: formData.amenity_id,
                    start_time: formData.start_time,
                    end_time: formData.end_time,
                    purpose: formData.purpose
                });
            }
            navigate('/bookings');
        } catch (err) {
            console.error('Submit booking error:', err);
            setError(err.response?.data?.message || 'Failed to submit booking. Check timeslot conflicts.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="text-gray-500 py-6 font-medium">Loading booking data...</div>;
    }

    return (
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-950 mb-1">
                {isEditMode ? 'Modify Reservation Slot' : 'Request Amenity Reservation'}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
                Fill in the details below. Bookings are subject to administrative approval.
            </p>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="amenity_id" className="block text-sm font-semibold text-slate-700">
                        Selected Amenity
                    </label>
                    <select
                        name="amenity_id"
                        id="amenity_id"
                        disabled={isEditMode || !!urlAmenityId}
                        value={formData.amenity_id}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-slate-400"
                    >
                        <option value="" disabled>Select facility...</option>
                        {amenities.map((amenity) => (
                            <option key={amenity.id} value={amenity.id}>
                                {amenity.name} ({amenity.location})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start_time" className="block text-sm font-semibold text-slate-700">
                            Start Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            name="start_time"
                            id="start_time"
                            required
                            value={formData.start_time}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="end_time" className="block text-sm font-semibold text-slate-700">
                            End Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            name="end_time"
                            id="end_time"
                            required
                            value={formData.end_time}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="purpose" className="block text-sm font-semibold text-slate-700">
                        Purpose of Reservation
                    </label>
                    <textarea
                        name="purpose"
                        id="purpose"
                        rows="3"
                        placeholder="e.g. Birthday Party, Basketball match, Resident Meeting..."
                        value={formData.purpose}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                    <Link
                        to="/bookings"
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || (isEditMode && error.includes('pending'))}
                        className="px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : isEditMode ? 'Save Changes' : 'Request Booking'}
                    </button>
                </div>
            </form>
        </div>
    );
}
