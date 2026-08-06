<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\User;
use App\Services\PhpMailerService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingMailTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_creation_and_approval_send_notification_emails(): void
    {
        $service = $this->createMock(PhpMailerService::class);
        $service->expects($this->exactly(2))
            ->method('send')
            ->willReturn(true);

        $this->app->instance(PhpMailerService::class, $service);

        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        $resident = User::factory()->create([
            'name' => 'Resident User',
            'email' => 'resident@example.com',
            'role' => 'user',
        ]);

        $amenity = Amenity::create([
            'name' => 'Community Hall',
            'description' => 'A lively place for events',
            'location' => 'Block A',
            'capacity' => 40,
            'status' => 'active',
        ]);

        $payload = [
            'amenity_id' => $amenity->id,
            'start_time' => Carbon::now()->addDay()->setTime(10, 0)->toDateTimeString(),
            'end_time' => Carbon::now()->addDay()->setTime(12, 0)->toDateTimeString(),
            'purpose' => 'Neighborhood gathering',
        ];

        $response = $this->actingAs($resident, 'sanctum')->postJson('/api/bookings', $payload);
        $response->assertCreated();

        $booking = Booking::latest('id')->first();

        $approvalResponse = $this->actingAs($admin, 'sanctum')->putJson('/api/admin/bookings/' . $booking->id, [
            'user_id' => $resident->id,
            'amenity_id' => $amenity->id,
            'start_time' => $booking->start_time->toDateTimeString(),
            'end_time' => $booking->end_time->toDateTimeString(),
            'purpose' => $booking->purpose,
            'status' => 'approved',
        ]);

        $approvalResponse->assertOk();

    }
}
