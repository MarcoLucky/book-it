<?php

namespace App\Http\Controllers;

use App\Models\Amenity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AmenityController extends Controller
{
    /**
     * Display a listing of active amenities (for residents/public).
     */
    public function index()
    {
        $amenities = Amenity::where('status', 'active')->get();
        return response()->json($amenities);
    }

    /**
     * Display a listing of all amenities (for admins).
     */
    public function adminIndex()
    {
        $amenities = Amenity::all();
        return response()->json($amenities);
    }

    /**
     * Store a newly created amenity.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:amenities,name',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:4096',
        ]);

        $amenityData = $request->only(['name', 'description', 'location', 'capacity', 'status']);

        if ($request->hasFile('image')) {
            $amenityData['image'] = $request->file('image')->store('amenity_images', 'public');
        }

        $amenity = Amenity::create($amenityData);

        return response()->json([
            'message' => 'Amenity created successfully',
            'amenity' => $amenity
        ], 201);
    }

    /**
     * Display the specified amenity.
     */
    public function show($id)
    {
        $amenity = Amenity::findOrFail($id);
        return response()->json($amenity);
    }

    /**
     * Update the specified amenity.
     */
    public function update(Request $request, $id)
    {
        $amenity = Amenity::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:amenities,name,' . $id,
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:4096',
        ]);

        $amenityData = $request->only(['name', 'description', 'location', 'capacity', 'status']);

        if ($request->hasFile('image')) {
            if ($amenity->image) {
                Storage::disk('public')->delete($amenity->image);
            }
            $amenityData['image'] = $request->file('image')->store('amenity_images', 'public');
        }

        $amenity->update($amenityData);

        return response()->json([
            'message' => 'Amenity updated successfully',
            'amenity' => $amenity
        ]);
    }

    /**
     * Remove the specified amenity.
     */
    public function destroy($id)
    {
        $amenity = Amenity::findOrFail($id);
        $amenity->delete();

        return response()->json([
            'message' => 'Amenity deleted successfully'
        ]);
    }
}
