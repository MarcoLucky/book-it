<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingApprovedUserMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your booking request has been approved',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-approved-user',
            with: [
                'booking' => $this->booking,
                'user' => $this->booking->user,
                'amenity' => $this->booking->amenity,
            ],
        );
    }
}
