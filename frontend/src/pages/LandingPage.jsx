import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function LandingPage() {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            {/* Navbar */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img
                            src="/bloomfield-logo.jpg"
                            alt="Bloomfield logo"
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                        <span className="font-bold text-xl text-slate-900 tracking-tight">Book It</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            to="/login"
                            className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="rounded-md bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Section */}
            <main className="w-full px-6 py-12 flex-grow">
                <div className="mx-auto mb-16 grid max-w-[1600px] gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
                    <div className="space-y-8">
                        <span className="inline-flex items-center rounded-md bg-green-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-green-800">
                            Bloomfield resident portal
                        </span>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                Book community amenities with less hassle.
                            </h1>
                            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                                Book function halls, sports courts, and shared spaces with a clean portal made for Bloomfield residents. Fast, modern, and community-centered.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 bg-white p-5 text-center">
                                <p className="text-3xl font-semibold text-slate-900">120+</p>
                                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Amenities</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-5 text-center">
                                <p className="text-3xl font-semibold text-slate-900">4.9</p>
                                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Resident rating</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-5 text-center">
                                <p className="text-3xl font-semibold text-slate-900">24/7</p>
                                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Support</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-5 text-center">
                                <p className="text-3xl font-semibold text-slate-900">100%</p>
                                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Verified bookings</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <img
                            src="/landing-hero.jfif"
                            alt="Bloomfield entrance"
                            className="w-full min-h-[520px] object-cover"
                        />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Amenities & Facilities</h2>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-slate-500 font-medium">Loading facilities...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {amenities.map((amenity) => (
                            <div
                                key={amenity.id}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col justify-between"
                            >
                                {amenity.image_url ? (
                                    <img
                                        src={amenity.image_url}
                                        alt={amenity.name}
                                        className="h-48 w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-48 w-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
                                        Amenity image not available
                                    </div>
                                )}
                                <div className="p-6">
                                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded font-semibold mb-3">
                                        {amenity.status === 'active' ? 'Available' : 'Unavailable'}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{amenity.name}</h3>
                                    <p className="text-sm text-slate-600 mb-4">{amenity.description}</p>
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <div className="text-xs text-slate-500 flex justify-between">
                                            <span>Location:</span>
                                            <span className="font-semibold text-slate-700">{amenity.location || 'N/A'}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 flex justify-between mt-1">
                                            <span>Capacity:</span>
                                            <span className="font-semibold text-slate-700">{amenity.capacity ? `${amenity.capacity} people` : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Bloomfield Subdivision. All rights reserved.</p>
            </footer>
        </div>
    );
}
