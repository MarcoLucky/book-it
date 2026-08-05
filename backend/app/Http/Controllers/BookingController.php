<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Amenity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class BookingController extends Controller
{
    /**
     * Display bookings for the logged-in resident.
     */
    public function index(Request $request)
    {
        $bookings = Booking::with('amenity')
            ->where('user_id', $request->user()->id)
            ->orderBy('start_time', 'desc')
            ->get();

        return response()->json($bookings);
    }

    /**
     * Store a booking request from a resident.
     */
    public function store(Request $request)
    {
        $request->validate([
            'amenity_id' => 'required|exists:amenities,id',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'purpose' => 'nullable|string|max:255',
        ]);

        $amenity = Amenity::findOrFail($request->amenity_id);
        if ($amenity->status !== 'active') {
            return response()->json([
                'message' => 'The selected amenity is currently unavailable.'
            ], 422);
        }

        $startTime = Carbon::parse($request->start_time);
        $endTime = Carbon::parse($request->end_time);

        // Check if there is an overlapping approved or pending booking
        $hasConflict = Booking::where('amenity_id', $request->amenity_id)
            ->whereIn('status', ['approved', 'pending'])
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
            })
            ->exists();

        if ($hasConflict) {
            return response()->json([
                'message' => 'The selected timeslot is already booked or pending approval.'
            ], 422);
        }

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'amenity_id' => $request->amenity_id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'purpose' => $request->purpose,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Booking request submitted successfully',
            'booking' => $booking->load('amenity')
        ], 201);
    }

    /**
     * Update a booking request (only allowed for pending bookings).
     */
    public function update(Request $request, $id)
    {
        $booking = Booking::where('user_id', $request->user()->id)->findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending bookings can be edited.'
            ], 422);
        }

        $request->validate([
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'purpose' => 'nullable|string|max:255',
        ]);

        $startTime = Carbon::parse($request->start_time);
        $endTime = Carbon::parse($request->end_time);

        // Check overlapping approved or pending bookings (excluding current booking)
        $hasConflict = Booking::where('amenity_id', $booking->amenity_id)
            ->where('id', '!=', $booking->id)
            ->whereIn('status', ['approved', 'pending'])
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
            })
            ->exists();

        if ($hasConflict) {
            return response()->json([
                'message' => 'The selected timeslot is already booked or pending approval.'
            ], 422);
        }

        $booking->update([
            'start_time' => $startTime,
            'end_time' => $endTime,
            'purpose' => $request->purpose,
        ]);

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking->load('amenity')
        ]);
    }

    /**
     * Cancel a booking by the resident.
     */
    public function cancel($id, Request $request)
    {
        $booking = Booking::where('user_id', $request->user()->id)->findOrFail($id);

        if (in_array($booking->status, ['cancelled', 'rejected'])) {
            return response()->json([
                'message' => 'Booking is already cancelled or rejected.'
            ], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'booking' => $booking->load('amenity')
        ]);
    }

    // ==========================================
    // ADMIN ACTIONS
    // ==========================================

    /**
     * Display all bookings in the system (for admins).
     */
    public function adminIndex()
    {
        $bookings = Booking::with(['user', 'amenity'])
            ->orderBy('start_time', 'desc')
            ->get();

        return response()->json($bookings);
    }

    /**
     * Store a booking directly (Admin can book for any resident).
     */
    public function adminStore(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amenity_id' => 'required|exists:amenities,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'purpose' => 'nullable|string|max:255',
            'status' => 'required|in:pending,approved,cancelled,rejected',
        ]);

        $startTime = Carbon::parse($request->start_time);
        $endTime = Carbon::parse($request->end_time);

        // Conflict check
        if (in_array($request->status, ['approved', 'pending'])) {
            $hasConflict = Booking::where('amenity_id', $request->amenity_id)
                ->whereIn('status', ['approved', 'pending'])
                ->where(function ($query) use ($startTime, $endTime) {
                    $query->where('start_time', '<', $endTime)
                          ->where('end_time', '>', $startTime);
                })
                ->exists();

            if ($hasConflict) {
                return response()->json([
                    'message' => 'Conflict detected: The selected timeslot is already booked.'
                ], 422);
            }
        }

        $booking = Booking::create([
            'user_id' => $request->user_id,
            'amenity_id' => $request->amenity_id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'purpose' => $request->purpose,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Booking created successfully by Admin',
            'booking' => $booking->load(['user', 'amenity'])
        ], 201);
    }

    /**
     * Update/Modify any booking by Admin (including status approval).
     */
    public function adminUpdate(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amenity_id' => 'required|exists:amenities,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'purpose' => 'nullable|string|max:255',
            'status' => 'required|in:pending,approved,cancelled,rejected',
        ]);

        $startTime = Carbon::parse($request->start_time);
        $endTime = Carbon::parse($request->end_time);

        // Check conflict if status is set to approved or pending
        if (in_array($request->status, ['approved', 'pending'])) {
            $hasConflict = Booking::where('amenity_id', $request->amenity_id)
                ->where('id', '!=', $booking->id)
                ->whereIn('status', ['approved', 'pending'])
                ->where(function ($query) use ($startTime, $endTime) {
                    $query->where('start_time', '<', $endTime)
                          ->where('end_time', '>', $startTime);
                })
                ->exists();

            if ($hasConflict) {
                return response()->json([
                    'message' => 'Conflict detected: The selected timeslot is already booked.'
                ], 422);
            }
        }

        $booking->update([
            'user_id' => $request->user_id,
            'amenity_id' => $request->amenity_id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'purpose' => $request->purpose,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Booking updated successfully by Admin',
            'booking' => $booking->load(['user', 'amenity'])
        ]);
    }

    /**
     * Delete booking record (Admin only).
     */
    public function adminDestroy($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();

        return response()->json([
            'message' => 'Booking deleted successfully'
        ]);
    }

    /**
     * Get system statistics (Admin Dashboard).
     */
    public function adminStats()
    {
        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $approvedBookings = Booking::where('status', 'approved')->count();
        $totalAmenities = Amenity::count();
        $totalUsers = User::where('role', 'user')->count();

        return response()->json([
            'total_bookings' => $totalBookings,
            'pending_bookings' => $pendingBookings,
            'approved_bookings' => $approvedBookings,
            'total_amenities' => $totalAmenities,
            'total_users' => $totalUsers
        ]);
    }

    /**
     * List all users for select dropdowns (Admin only).
     */
    public function adminUsersList()
    {
        $users = User::orderBy('name')->get(['id', 'name', 'email', 'role']);
        return response()->json($users);
    }
}
