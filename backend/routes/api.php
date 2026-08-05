<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AmenityController;
use App\Http\Controllers\BookingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication & Amenities
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/amenities', [AmenityController::class, 'index']);

// Protected Resident Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    
    // User Booking Actions
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::put('/bookings/{booking}', [BookingController::class, 'update']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
});

// Protected Admin Routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Stats & Management
    Route::get('/stats', [BookingController::class, 'adminStats']);
    Route::get('/users', [BookingController::class, 'adminUsersList']);
    Route::post('/admins', [AuthController::class, 'registerAdmin']);
    
    // Amenity CRUD (Full listing and modifications)
    Route::get('/amenities', [AmenityController::class, 'adminIndex']);
    Route::post('/amenities', [AmenityController::class, 'store']);
    Route::put('/amenities/{amenity}', [AmenityController::class, 'update']);
    Route::delete('/amenities/{amenity}', [AmenityController::class, 'destroy']);
    
    // Booking CRUD
    Route::get('/bookings', [BookingController::class, 'adminIndex']);
    Route::post('/bookings', [BookingController::class, 'adminStore']);
    Route::put('/bookings/{booking}', [BookingController::class, 'adminUpdate']);
    Route::delete('/bookings/{booking}', [BookingController::class, 'adminDestroy']);
});