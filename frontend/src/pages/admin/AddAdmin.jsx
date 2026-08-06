import React, { useState } from 'react';
import api from '../../services/api';

export default function AddAdmin() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrors(null);

        if (password !== passwordConfirmation) {
            setErrors({ password: ['Passwords do not match.'] });
            return;
        }

        setLoading(true);
        try {
            await api.post('/admin/admins', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation
            });

            setSuccessMessage(`Admin account for "${name}" created successfully.`);
            setName('');
            setEmail('');
            setPassword('');
            setPasswordConfirmation('');
        } catch (error) {
            console.error('Error creating admin:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: [error.response?.data?.message || 'Failed to create admin account.'] });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-950 mb-1">Create Administrative Account</h2>
            <p className="text-xs text-gray-500 mb-6">
                Register a new administrator with credentials to access all CRUD features.
            </p>

            {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-700 font-semibold">
                    {successMessage}
                </div>
            )}

            {errors?.general && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700 font-semibold">
                    {errors.general[0]}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700">Full Name *</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                    />
                    {errors?.name && (
                        <p className="mt-1 text-xs text-red-700">{errors.name[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700">Email Address *</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                    />
                    {errors?.email && (
                        <p className="mt-1 text-xs text-red-700">{errors.email[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700">Password *</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                    />
                    {errors?.password && (
                        <p className="mt-1 text-xs text-red-700">{errors.password[0]}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700">Confirm Password *</label>
                    <input
                        type="password"
                        required
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                    />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Admin'}
                    </button>
                </div>
            </form>
        </div>
    );
}
