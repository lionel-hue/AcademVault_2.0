<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmailVerification;
use App\Mail\VerificationEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Send verification code to email
     */
    public function sendVerificationCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;

        // Check if email already registered
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            return response()->json([
                'success' => false,
                'message' => 'Email already registered. Please login instead.',
                'data' => ['exists' => true]
            ], 400);
        }

        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Delete any existing verification codes for this email
        EmailVerification::where('email', $email)->delete();

        // Create new verification record
        $verification = EmailVerification::create([
            'email' => $email,
            'code' => $code,
            'type' => 'signup',
            'expires_at' => Carbon::now()->addHours(24),
        ]);

        try {
            // Send verification email
            Mail::to($email)->send(new VerificationEmail($email, $code));
            
            // In development, return the code for testing
            if (app()->environment('local')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Verification code sent successfully',
                    'data' => [
                        'code' => $code, // Only in development
                        'expires_at' => $verification->expires_at
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent successfully'
            ]);

        } catch (\Exception $e) {
            // Log error but don't expose details to client
            Log::error('Email sending failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email. Please try again.'
            ], 500);
        }
    }

    /**
     * Verify email with code
     */
    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $verification = EmailVerification::where('email', $request->email)
            ->where('code', $request->code)
            ->where('type', 'signup')
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code'
            ], 400);
        }

        // Mark as used
        $verification->update(['used_at' => Carbon::now()]);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully'
        ]);
    }

    /**
     * Check if email exists
     */
    public function checkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
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
     * Register new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:teacher,student',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'registration_date' => 'required|date',
            'institution' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify that email was verified
        $verification = EmailVerification::where('email', $request->email)
            ->where('type', 'signup')
            ->whereNotNull('used_at')
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email first'
            ], 400);
        }

        // Create user
        $user = User::create([
            'name' => $request->name,
            'type' => $request->type,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'registration_date' => $request->registration_date,
            'email_verified_at' => now(), // Mark email as verified
            'institution' => $request->institution,
            'department' => $request->department,
            'phone' => $request->phone,
            'bio' => $request->bio,
        ]);

        // Generate JWT token
        $token = JWTAuth::fromUser($user);

        // Clean up verification records
        EmailVerification::where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => JWTAuth::factory()->getTTL() * 60,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'type' => $user->type,
                    'institution' => $user->institution,
                    'department' => $user->department,
                    'profile_image' => $user->profile_image,
                    'role' => $user->role,
                    'email_verified_at' => $user->email_verified_at
                ]
            ]
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        // Check if user exists
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }

        // Check if email is verified
        if (!$user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email before logging in'
            ], 403);
        }

        // Check if account is active
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is deactivated. Please contact support.'
            ], 403);
        }

        // Attempt login with JWT
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => JWTAuth::factory()->getTTL() * 60,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'type' => $user->type,
                    'institution' => $user->institution,
                    'department' => $user->department,
                    'profile_image' => $user->profile_image,
                    'role' => $user->role,
                    'email_verified_at' => $user->email_verified_at
                ]
            ]
        ]);
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
                'message' => 'Failed to logout'
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
                    'message' => 'User not authenticated'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'type' => $user->type,
                    'institution' => $user->institution,
                    'department' => $user->department,
                    'profile_image' => $user->profile_image,
                    'role' => $user->role,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'bio' => $user->bio,
                    'phone' => $user->phone
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user data'
            ], 500);
        }
    }

    /**
     * Refresh JWT token
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
                    'expires_in' => JWTAuth::factory()->getTTL() * 60
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh token'
            ], 401);
        }
    }

    /**
     * Resend verification code
     */
    public function resendVerificationCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user already exists
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            return response()->json([
                'success' => false,
                'message' => 'Email already registered. Please login instead.'
            ], 400);
        }

        // Call the same logic as sendVerificationCode
        return $this->sendVerificationCode($request);
    }
}