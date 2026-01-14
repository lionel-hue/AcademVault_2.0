<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

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
    
    // Create proper verification URL
    $verificationUrl = $frontendUrl . '/signup?verify=1&email=' . urlencode($this->email) . '&code=' . $this->code;
    
    // Also log for debugging
    Log::info('Verification email sent', [
        'email' => $this->email,
        'code' => $this->code,
        'url' => $verificationUrl
    ]);

    return $this->subject('AcademVault - Complete Your Registration')
        ->view('emails.verification')
        ->with([
            'code' => $this->code,
            'email' => $this->email,
            'verificationUrl' => $verificationUrl,
        ]);
}
}
