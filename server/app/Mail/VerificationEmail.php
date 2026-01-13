<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;
    public $email;

    /**
     * Create a new message instance.
     */
    public function __construct($code, $email)
    {
        $this->code = $code;
        $this->email = $email;
    }

    /**
     * Build the message.
     */
    // In ./server/app/Mail/VerificationEmail.php
    public function build()
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $verificationUrl = $frontendUrl . '/signup?verify=1&email=' . urlencode($this->email) . '&code=' . $this->code;

        return $this->subject('AcademVault - Email Verification Code')
            ->view('emails.verification')
            ->with([
                'code' => $this->code,
                'email' => $this->email,
                'verificationUrl' => $verificationUrl, // Pass URL to view
            ]);
    }
}
