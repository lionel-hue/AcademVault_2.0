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
    public function build()
    {
        return $this->subject('AcademVault - Email Verification Code')
                    ->view('emails.verification')
                    ->with([
                        'code' => $this->code,
                        'email' => $this->email,
                    ]);
    }
}