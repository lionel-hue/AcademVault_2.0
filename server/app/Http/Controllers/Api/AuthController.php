<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmailVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Mail\VerificationEmail;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Generate a 6-digit verification code
     */
    private function generateVerificationCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Send verification code to email
     */
    public function sendVerificationCode(Request $request)
    {
        // Validate email
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $email = $request->email;
            
            // Check if email already exists
            $existingUser = User::where('email', $email)->first();
            if ($existingUser) {
                if ($existingUser->isEmailVerified()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email is already registered and verified'
                    ], 400);
                }
                // If user exists but not verified, we can still send a new code
            }

            // Clean up expired codes
            EmailVerification::cleanExpired();

            // Generate new code
            $code = $this->generateVerificationCode();

            // Store in database
            EmailVerification::create([
                'email' => $email,
                'code' => $code,
                'type' => 'signup',
                'expires_at' => Carbon::now()->addHours(24) // 24 hours expiration
            ]);

            // Try to send email
            try {
                Mail::to($email)->send(new VerificationEmail($code, $email));
                
                if (app()->environment('local', 'development')) {
                    // In development, return the code for testing
                    return response()->json([
                        'success' => true,
                        'message' => 'Verification code sent to your email',
                        'data' => [
                            'code' => $code, // Only in development for testing
                            'expires_at' => Carbon::now()->addHours(24)->toISOString()
                        ]
                    ]);
                }
                
                return response()->json([
                    'success' => true,
                    'message' => 'Verification code sent to your email'
                ]);
                
            } catch (\Exception $mailException) {
                // If email fails, return code in development for testing
                if (app()->environment('local', 'development')) {
                    Log::error('Email sending failed: ' . $mailException->getMessage());
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Verification code generated (email sending failed in development)',
                        'data' => [
                            'code' => $code,
                            'email_error' => $mailException->getMessage(),
                            'expires_at' => Carbon::now()->addHours(24)->toISOString()
                        ]
                    ]);
                }
                
                throw $mailException;
            }

        } catch (\Exception $e) {
            Log::error('Send verification code error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code',
                'error' => app()->environment('local') ? $e->getMessage() : 'Please try again later'
            ], 500);
        }
    }

    /**
     * Verify email with code
     */
    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
            'code' => 'required|string|size:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $email = $request->email;
            $code = $request->code;

            // Find valid verification code
            $verification = EmailVerification::forEmailAndCode($email, $code)
                ->forSignup()
                ->valid()
                ->first();

            if (!$verification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired verification code'
                ], 400);
            }

            // Mark as verified
            $verification->markAsVerified();

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Verify email error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Verification failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:teacher,student',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'registration_date' => 'required|date|date_format:Y-m-d',
            'institution' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if email is verified
            $verification = EmailVerification::where('email', $request->email)
                ->forSignup()
                ->whereNotNull('verified_at')
                ->latest()
                ->first();

            if (!$verification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email must be verified before registration'
                ], 400);
            }

            // Create user
            $user = User::create([
                'name' => $request->name,
                'type' => $request->type,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'registration_date' => $request->registration_date,
                'institution' => $request->institution,
                'department' => $request->department,
                'phone' => $request->phone,
                'bio' => $request->bio,
                'email_verified_at' => now(),
                'is_active' => true,
                'role' => 'user'
            ]);

            // Generate JWT token
            $token = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'type' => $user->type,
                        'institution' => $user->institution,
                        'role' => $user->role
                    ],
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Please try again'
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $credentials = $request->only('email', 'password');

            // Attempt to authenticate
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            // Get authenticated user
            $user = JWTAuth::user();

            // Check if user is active
            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is deactivated'
                ], 403);
            }

            // Check if email is verified
            if (!$user->isEmailVerified()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please verify your email first'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'type' => $user->type,
                        'institution' => $user->institution,
                        'role' => $user->role
                    ],
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function me()
    {
        try {
            $user = JWTAuth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $user
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user data'
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout()
    {
        try {
            JWTAuth::logout();

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed'
            ], 500);
        }
    }

    /**
     * Refresh token
     */
    public function refresh()
    {
        try {
            $token = JWTAuth::refresh();

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token refresh failed'
            ], 401);
        }
    }

    /**
     * Check if email exists
     */
    public function checkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email'
            ], 422);
        }

        $exists = User::where('email', $request->email)->exists();

        return response()->json([
            'success' => true,
            'data' => [
                'exists' => $exists,
                'email' => $request->email
            ]
        ]);
    }

    /**
     * Resend verification code
     */
    public function resendVerificationCode(Request $request)
    {
        return $this->sendVerificationCode($request);
    }
}