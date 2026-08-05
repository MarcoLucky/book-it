import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
    const { user, updateUser, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        profile_image: null,
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            name: user?.name || '',
            email: user?.email || '',
        }));
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value, files, type } = e.target;
        if (type === 'file') {
            setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setSavingProfile(true);

        const payload = new FormData();
        payload.append('name', formData.name);
        payload.append('email', formData.email);
        payload.append('_method', 'PUT');
        if (formData.profile_image) {
            payload.append('profile_image', formData.profile_image);
        }

        try {
            const response = await api.post('/user/profile', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(response.data.user);
            setProfileSuccess('Profile updated successfully.');
        } catch (error) {
            console.error('Profile update error:', error);
            setProfileError(error.response?.data?.message || 'Unable to update profile.');
        } finally {
            setSavingProfile(false);
            await refreshUser();
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        setSavingPassword(true);

        try {
            await api.put('/user/password', {
                current_password: formData.current_password,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            });
            setPasswordSuccess('Password changed successfully.');
            setFormData((prev) => ({
                ...prev,
                current_password: '',
                password: '',
                password_confirmation: '',
            }));
        } catch (error) {
            console.error('Password update error:', error);
            setPasswordError(error.response?.data?.message || 'Unable to change password.');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
                <p className="text-sm text-slate-600">Update your account details, upload a profile photo, or change your password.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h2>

                    {profileError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {profileError}
                        </div>
                    )}
                    {profileSuccess && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {profileSuccess}
                        </div>
                    )}

                    <form onSubmit={handleProfileSave} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="profile_image" className="block text-sm font-medium text-slate-700">Profile Photo</label>
                            <input
                                id="profile_image"
                                name="profile_image"
                                type="file"
                                accept="image/*"
                                onChange={handleInputChange}
                                className="mt-1 block w-full text-sm text-slate-600"
                            />
                        </div>

                        {user?.profile_image_url && (
                            <div className="rounded-2xl border border-gray-200 overflow-hidden w-48">
                                <img src={user.profile_image_url} alt={user.name} className="h-48 w-full object-cover" />
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-slate-200">
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                                {savingProfile ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h2>

                    {passwordError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {passwordError}
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {passwordSuccess}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSave} className="space-y-4">
                        <div>
                            <label htmlFor="current_password" className="block text-sm font-medium text-slate-700">Current Password</label>
                            <input
                                id="current_password"
                                name="current_password"
                                type="password"
                                required
                                value={formData.current_password}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">New Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                            <input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                required
                                value={formData.password_confirmation}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-200">
                            <button
                                type="submit"
                                disabled={savingPassword}
                                className="inline-flex justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                            >
                                {savingPassword ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
