<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class EmailVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'code',
        'type',
        'expires_at',
        'verified_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime'
    ];

    /**
     * Check if the verification code is valid
     */
    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isVerified();
    }

    /**
     * Check if the code is expired
     */
    public function isExpired(): bool
    {
        return Carbon::now()->greaterThan($this->expires_at);
    }

    /**
     * Check if the code is verified
     */
    public function isVerified(): bool
    {
        return !is_null($this->verified_at);
    }

    /**
     * Mark as verified
     */
    public function markAsVerified(): bool
    {
        return $this->update(['verified_at' => now()]);
    }

    /**
     * Scope for valid verification codes
     */
    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', now())
                    ->whereNull('verified_at');
    }

    /**
     * Scope for specific email and code
     */
    public function scopeForEmailAndCode($query, $email, $code)
    {
        return $query->where('email', $email)
                    ->where('code', $code);
    }

    /**
     * Scope for signup type
     */
    public function scopeForSignup($query)
    {
        return $query->where('type', 'signup');
    }

    /**
     * Clean up expired verification codes
     */
    public static function cleanExpired(): void
    {
        self::where('expires_at', '<', now())->delete();
    }

    /**
     * Get verification by email for signup
     */
    public static function getValidSignupVerification($email)
    {
        return self::where('email', $email)
            ->where('type', 'signup')
            ->valid()
            ->latest()
            ->first();
    }
}