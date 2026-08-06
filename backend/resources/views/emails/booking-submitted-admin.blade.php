<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New amenity booking request</title>
</head>
<body>
    <h2>New amenity booking request</h2>
    <p>A new booking request has been submitted by {{ $user->name ?? 'a resident' }}.</p>
    <p><strong>Amenity:</strong> {{ $amenity->name }}</p>
    <p><strong>Purpose:</strong> {{ $booking->purpose ?: 'Not provided' }}</p>
    <p><strong>Requested period:</strong> {{ $booking->start_time->format('Y-m-d H:i') }} to {{ $booking->end_time->format('Y-m-d H:i') }}</p>
    <p>Please review and approve or reject the request from the admin booking management page.</p>
</body>
</html>
