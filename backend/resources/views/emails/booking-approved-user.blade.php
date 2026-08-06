<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your booking request was approved</title>
</head>
<body>
    <h2>Your booking request was approved</h2>
    <p>Hi {{ $user->name ?? 'there' }},</p>
    <p>Your booking for {{ $amenity->name }} has been approved.</p>
    <p><strong>Scheduled period:</strong> {{ $booking->start_time->format('Y-m-d H:i') }} to {{ $booking->end_time->format('Y-m-d H:i') }}</p>
    <p>Thank you for using the amenities booking system.</p>
</body>
</html>
