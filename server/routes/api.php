<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SearchController;

Route::prefix('auth')->group(function () {
    // Public routes
    Route::post('send-verification', [AuthController::class, 'sendVerificationCode']);
    Route::post('verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('check-email', [AuthController::class, 'checkEmail']); // ← ADD THIS LINE
    Route::post('resend-verification', [AuthController::class, 'resendVerificationCode']);

    // Protected routes
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });


    // routes/api.php - Add these routes inside the auth:api middleware group
    Route::middleware('auth:api')->prefix('search')->group(function () {
        Route::post('/', [SearchController::class, 'search']);
        Route::get('/history', [SearchController::class, 'searchHistory']);
        Route::delete('/history', [SearchController::class, 'clearSearchHistory']);
        Route::post('/save', [SearchController::class, 'saveResult']);
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
                'POST /api/auth/check-email' => 'Check if email exists', // ← ADD THIS
                'POST /api/auth/resend-verification' => 'Resend verification code',
                'POST /api/auth/logout' => 'Logout user (protected)',
                'POST /api/auth/refresh' => 'Refresh token (protected)',
                'GET /api/auth/me' => 'Get current user (protected)'
            ]
        ]
    ]);
});


// Dashboard routes (protected)
Route::middleware('auth:api')->group(function () {
    Route::prefix('dashboard')->group(function () {
        Route::get('stats', [DashboardController::class, 'stats']);
        Route::get('activities', [DashboardController::class, 'recentActivities']);
        Route::get('recent-documents', [DashboardController::class, 'recentDocuments']);
        Route::get('favorites', [DashboardController::class, 'favoriteDocuments']);
        Route::get('notifications', [DashboardController::class, 'notifications']);
        Route::get('search-history', [DashboardController::class, 'searchHistory']);
    });
});
