<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmailVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'code',
        'type',
        'expires_at',
        'verified_at'  // NOT used_at
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime'  // NOT used_at
    ];

    /**
     * Scope for valid verification codes (not used/verified yet)
     */
    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', now())
                     ->whereNull('verified_at');
    }
}