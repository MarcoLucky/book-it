<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Amenity extends Model
{
    protected $fillable = [
        'name',
        'description',
        'location',
        'capacity',
        'status',
        'image',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Get the bookings for the amenity.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        return asset('storage/' . $this->image);
    }
}
