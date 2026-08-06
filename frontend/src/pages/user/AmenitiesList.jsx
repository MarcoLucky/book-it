import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AmenitiesList() {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const response = await api.get('/amenities');
                setAmenities(response.data);
            } catch (error) {
                console.error('Error fetching amenities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAmenities();
    }, []);

    const handleBook = (amenityId) => {
        navigate(`/bookings/new?amenity_id=${amenityId}`);
    };

    const filteredAmenities = amenities.filter((amenity) => {
        const query = searchTerm.toLowerCase();
        return !query || [amenity.name, amenity.description, amenity.location]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query));
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Amenities & Facilities</h1>
                <p className="text-sm text-gray-600 mt-1">Select an amenity below to schedule your reservation slot.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <label htmlFor="amenity-search" className="block text-sm font-semibold text-slate-700 mb-2">
                    Search amenities
                </label>
                <input
                    id="amenity-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, location, or description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                />
            </div>

            {loading ? (
                <div className="text-gray-500 font-medium py-4">Loading amenities...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAmenities.map((amenity) => (
                        <div
                            key={amenity.id}
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col justify-between"
                        >
                            {amenity.image_url ? (
                                <img
                                    src={amenity.image_url}
                                    alt={amenity.name}
                                    className="h-44 w-full object-cover"
                                />
                            ) : (
                                <div className="h-44 w-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                                    Amenity image not available
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-semibold">
                                        Available
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{amenity.name}</h3>
                                <p className="text-sm text-slate-600 mb-4 line-clamp-3">{amenity.description}</p>
                            </div>

                            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 space-y-3">
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 flex justify-between">
                                        <span>Location:</span>
                                        <span className="font-semibold text-slate-700">{amenity.location || 'N/A'}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 flex justify-between">
                                        <span>Capacity:</span>
                                        <span className="font-semibold text-slate-700">
                                            {amenity.capacity ? `${amenity.capacity} people` : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleBook(amenity.id)}
                                    className="w-full mt-2 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-semibold rounded text-white bg-green-700 hover:bg-green-800 transition-colors"
                                >
                                    Book This Facility
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredAmenities.length === 0 && (
                        <div className="col-span-full bg-white p-8 border border-gray-200 rounded-lg text-center text-slate-500">
                            {searchTerm ? 'No amenities matched your search.' : 'No amenities are currently active. Please contact administrator.'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
