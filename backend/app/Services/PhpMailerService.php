<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

class PhpMailerService
{
    public function send(string $to, string $subject, string $htmlBody, string $textBody = ''): bool
    {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = env('MAIL_HOST', '127.0.0.1');
            $mail->Port = (int) env('MAIL_PORT', 2525);
            $mail->SMTPAuth = false;
            $mail->SMTPAutoTLS = false;
            $mail->CharSet = 'UTF-8';

            if (env('MAIL_USERNAME')) {
                $mail->SMTPAuth = true;
                $mail->Username = env('MAIL_USERNAME');
                $mail->Password = env('MAIL_PASSWORD');
            }

            if (env('MAIL_ENCRYPTION') === 'tls') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } elseif (env('MAIL_ENCRYPTION') === 'ssl') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            }

            $mail->setFrom(env('MAIL_FROM_ADDRESS', 'hello@example.com'), env('MAIL_FROM_NAME', 'Laravel'));
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->isHTML(true);
            $mail->Body = $htmlBody;
            $mail->AltBody = $textBody ?: strip_tags($htmlBody);

            return $mail->send();
        } catch (\Throwable $e) {
            report($e);
            return false;
        }
    }
}
