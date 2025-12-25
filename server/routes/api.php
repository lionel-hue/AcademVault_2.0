<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('send-verification', [AuthController::class, 'sendVerificationCode']);
    Route::post('verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('check-email', [AuthController::class, 'checkEmail']);
    Route::post('resend-verification', [AuthController::class, 'resendVerificationCode']);
    
    // Protected routes
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'AcademVault API',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});

// API documentation route
Route::get('/', function () {
    return response()->json([
        'message' => 'AcademVault API',
        'version' => '1.0.0',
        'endpoints' => [
            'auth' => [
                'POST /api/auth/send-verification' => 'Send verification code to email',
                'POST /api/auth/verify-email' => 'Verify email with code',
                'POST /api/auth/register' => 'Register new user',
                'POST /api/auth/login' => 'Login user',
                'POST /api/auth/check-email' => 'Check if email exists',
                'POST /api/auth/resend-verification' => 'Resend verification code',
                'POST /api/auth/logout' => 'Logout user (protected)',
                'POST /api/auth/refresh' => 'Refresh token (protected)',
                'GET /api/auth/me' => 'Get current user (protected)'
            ]
        ]
    ]);
});