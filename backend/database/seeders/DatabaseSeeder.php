<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Amenity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Admin Account
        User::updateOrCreate(
            ['email' => 'admin@bloomfield.com'],
            [
                'name' => 'Bloomfield Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // Seed second Admin Account
        User::updateOrCreate(
            ['email' => 'admin2@bloomfield.com'],
            [
                'name' => 'Bloomfield Admin 2',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // Seed Regular User Account
        User::updateOrCreate(
            ['email' => 'user@bloomfield.com'],
            [
                'name' => 'Bloomfield Resident',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        // Seed Subdivision Amenities
        $amenities = [
            [
                'name' => 'Covered Court',
                'description' => 'A standard covered court suitable for basketball, badminton, and community gatherings.',
                'location' => 'Block 4, Phase 1',
                'capacity' => 100,
                'status' => 'active',
            ],
            [
                'name' => 'Swimming Pool',
                'description' => 'Subdivision outdoor swimming pool. Proper swimming attire is required.',
                'location' => 'Main Clubhouse Area',
                'capacity' => 50,
                'status' => 'active',
            ],
            [
                'name' => 'Clubhouse',
                'description' => 'Indoor air-conditioned clubhouse hall, perfect for birthday parties and private events.',
                'location' => 'Main Clubhouse Area, 2nd Floor',
                'capacity' => 150,
                'status' => 'active',
            ],
            [
                'name' => 'Tennis Court',
                'description' => 'Outdoor concrete tennis court. Available for daytime and night play.',
                'location' => 'Sports Complex, near Phase 2 Gate',
                'capacity' => 4,
                'status' => 'active',
            ]
        ];

        foreach ($amenities as $amenity) {
            Amenity::updateOrCreate(
                ['name' => $amenity['name']],
                $amenity
            );
        }
    }
}
