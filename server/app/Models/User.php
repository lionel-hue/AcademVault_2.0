<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'email',
        'password',
        'registration_date',
        'is_active',
        'role',
        'profile_image',
        'bio',
        'institution',
        'department',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'deleted_at',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'registration_date' => 'date',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $attributes = [
        'is_active' => true,
        'role' => 'user',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        return [
            'type' => $this->type,
            'role' => $this->role,
            'institution' => $this->institution,
        ];
    }

    /**
     * Boot method for the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->registration_date)) {
                $user->registration_date = now();
            }
        });
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is moderator
     */
    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    /**
     * Check if user is teacher
     */
    public function isTeacher(): bool
    {
        return $this->type === 'teacher';
    }

    /**
     * Check if user is student
     */
    public function isStudent(): bool
    {
        return $this->type === 'student';
    }

    /**
     * Generate email verification token
     */
    public function generateVerificationToken(): string
    {
        return sha1($this->email . time() . config('app.key'));
    }
}