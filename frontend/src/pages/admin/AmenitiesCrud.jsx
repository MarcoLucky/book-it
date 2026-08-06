import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AmenitiesCrud() {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        capacity: '',
        status: 'active',
        image: null,
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchAmenities = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/amenities');
            setAmenities(response.data);
        } catch (err) {
            console.error('Error fetching admin amenities:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAmenities();
    }, []);

    const handleOpenCreate = () => {
        setEditingAmenity(null);
        setFormData({
            name: '',
            description: '',
            location: '',
            capacity: '',
            status: 'active',
            image: null,
        });
        setError('');
        setShowModal(true);
    };

    const handleOpenEdit = (amenity) => {
        setEditingAmenity(amenity);
        setFormData({
            name: amenity.name,
            description: amenity.description || '',
            location: amenity.location || '',
            capacity: amenity.capacity || '',
            status: amenity.status,
            image: null,
        });
        setError('');
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, files, type } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] || null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const formPayload = new FormData();
        formPayload.append('name', formData.name);
        formPayload.append('description', formData.description);
        formPayload.append('location', formData.location);
        formPayload.append('capacity', formData.capacity ? parseInt(formData.capacity, 10) : '');
        formPayload.append('status', formData.status);
        if (formData.image) {
            formPayload.append('image', formData.image);
        }

        try {
            if (editingAmenity) {
                formPayload.append('_method', 'PUT');
                await api.post(`/admin/amenities/${editingAmenity.id}`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/amenities', formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowModal(false);
            await fetchAmenities();
        } catch (err) {
            console.error('Save amenity error:', err);
            setError(err.response?.data?.message || 'Failed to save amenity details.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (amenityId) => {
        if (!window.confirm('Are you sure you want to delete this amenity? This will delete all associated bookings.')) {
            return;
        }

        try {
            await api.delete(`/admin/amenities/${amenityId}`);
            await fetchAmenities();
        } catch (err) {
            console.error('Delete amenity error:', err);
            alert('Failed to delete amenity.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Amenities</h1>
                    <p className="text-sm text-gray-600 mt-1">Configure and CRUD subdivision amenities, halls, pools, and sports facilities.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-green-700 hover:bg-green-800 transition-colors"
                >
                    Add New Amenity
                </button>
            </div>

            {loading ? (
                <div className="text-gray-500 font-medium py-4">Loading amenities...</div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Amenity Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Capacity
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
                                {amenities.map((amenity) => (
                                    <tr key={amenity.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-slate-900">{amenity.name}</div>
                                            <div className="text-xs text-slate-500 max-w-sm truncate">{amenity.description || 'No description'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {amenity.location || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {amenity.capacity ? `${amenity.capacity} people` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-0.5 text-xs rounded font-semibold uppercase ${
                                                amenity.status === 'active'
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}>
                                                {amenity.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-3 text-sm font-semibold">
                                            <button
                                                onClick={() => handleOpenEdit(amenity)}
                                                className="text-green-700 hover:text-green-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(amenity.id)}
                                                className="text-red-700 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {amenities.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic">
                                            No amenities configured. Get started by clicking "Add New Amenity".
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
                                {editingAmenity ? `Edit ${editingAmenity.name}` : 'Create New Amenity'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-semibold">&times;</button>
                        </div>

                        {error && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Amenity Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Amenity Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="mt-1 block w-full text-sm text-slate-600"
                                />
                                {editingAmenity?.image_url && (
                                    <img
                                        src={editingAmenity.image_url}
                                        alt={editingAmenity.name}
                                        className="mt-3 h-24 w-full object-cover rounded-md border border-gray-200"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Capacity (People)</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        min="1"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Description</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
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
                                    {saving ? 'Saving...' : 'Save Facility'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
