import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Resident Pages
import UserDashboard from './pages/user/Dashboard';
import AmenitiesList from './pages/user/AmenitiesList';
import BookingForm from './pages/user/BookingForm';
import BookingsList from './pages/user/BookingsList';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AmenitiesCrud from './pages/admin/AmenitiesCrud';
import BookingsCrud from './pages/admin/BookingsCrud';
import AddAdmin from './pages/admin/AddAdmin';
import Profile from './pages/Profile';

// Wrapper for Resident Layout
const UserLayoutWrapper = () => {
    return (
        <UserLayout>
            <Outlet />
        </UserLayout>
    );
};

// Wrapper for Admin Layout
const AdminLayoutWrapper = () => {
    return (
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Resident Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<UserLayoutWrapper />}>
                            <Route path="/dashboard" element={<UserDashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/amenities" element={<AmenitiesList />} />
                            <Route path="/bookings" element={<BookingsList />} />
                            <Route path="/bookings/new" element={<BookingForm />} />
                            <Route path="/bookings/edit/:id" element={<BookingForm />} />
                        </Route>
                    </Route>

                    {/* Admin Protected Routes */}
                    <Route element={<AdminRoute />}>
                        <Route element={<AdminLayoutWrapper />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/profile" element={<Profile />} />
                            <Route path="/admin/amenities" element={<AmenitiesCrud />} />
                            <Route path="/admin/bookings" element={<BookingsCrud />} />
                            <Route path="/admin/add-admin" element={<AddAdmin />} />
                        </Route>
                    </Route>

                    {/* Catch All Redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}