<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SearchSessionsController;
use App\Http\Controllers\Api\DocumentsController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\FriendsController;
use App\Http\Controllers\Api\DiscussionsController;


Route::prefix('auth')->group(function () {
    // Public routes
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

// Search routes (protected) - CORRECTED: Moved outside auth prefix
Route::middleware('auth:api')->prefix('search')->group(function () {
    Route::post('/', [SearchController::class, 'search']);
    Route::get('/history', [SearchController::class, 'searchHistory']);
    Route::delete('/history', [SearchController::class, 'clearSearchHistory']);
    Route::post('/save', [SearchController::class, 'saveResult']);
});


// Add to your existing routes
Route::middleware('auth:api')->prefix('search-sessions')->group(function () {
    Route::get('/', [SearchSessionsController::class, 'index']);
    Route::post('/', [SearchSessionsController::class, 'store']);
    Route::put('/{id}', [SearchSessionsController::class, 'update']);
    Route::delete('/{id}', [SearchSessionsController::class, 'destroy']);
});



// Documents routes (protected)
Route::middleware('auth:api')->prefix('documents')->group(function () {
    Route::get('/', [DocumentsController::class, 'index']);
    Route::get('/stats', [DocumentsController::class, 'stats']);
    Route::post('/', [DocumentsController::class, 'store']);
    Route::post('/save-from-search', [DocumentsController::class, 'saveFromSearch']);
    Route::get('/{id}', [DocumentsController::class, 'show']);
    Route::put('/{id}', [DocumentsController::class, 'update']);
    Route::delete('/{id}', [DocumentsController::class, 'destroy']);
    Route::get('/{id}/download', [DocumentsController::class, 'download']);
    Route::post('/{id}/categories', [DocumentsController::class, 'attachCategories']);
    Route::delete('/{id}/categories/{categoryId}', [DocumentsController::class, 'detachCategory']);
});



// Profile Routes
Route::middleware(['auth:api'])->group(function () {
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::post('/update', [ProfileController::class, 'update']);
        Route::post('/change-password', [ProfileController::class, 'changePassword']);
        Route::get('/activity', [ProfileController::class, 'getActivityHistory']);
        Route::get('/preferences', [ProfileController::class, 'getPreferences']);
        Route::post('/preferences', [ProfileController::class, 'updatePreferences']);
        Route::delete('/account', [ProfileController::class, 'deleteAccount']);
    });
});


//Friends Routes (Protected)
Route::middleware(['auth:api'])->group(function () {
    Route::prefix('friends')->group(function () {
        Route::get('/', [FriendsController::class, 'index']);
        Route::get('/requests', [FriendsController::class, 'getFriendRequests']);
        Route::post('/send', [FriendsController::class, 'sendRequest']);
        Route::post('/requests/{id}/accept', [FriendsController::class, 'acceptRequest']);
        Route::post('/requests/{id}/reject', [FriendsController::class, 'rejectRequest']);
        Route::delete('/{friendId}', [FriendsController::class, 'removeFriend']);
        Route::post('/search', [FriendsController::class, 'searchUsers']);
        Route::get('/stats', [FriendsController::class, 'getStats']);
    });
});


//Discussions Route (Protected)
Route::middleware(['auth:api'])->group(function () {
    Route::prefix('discussions')->group(function () {
        Route::get('/', [DiscussionsController::class, 'index']);
        Route::get('/stats', [DiscussionsController::class, 'getStats']);
        Route::post('/', [DiscussionsController::class, 'store']);
        Route::get('/{id}', [DiscussionsController::class, 'show']);
        Route::put('/{id}', [DiscussionsController::class, 'update']);
        Route::delete('/{id}', [DiscussionsController::class, 'destroy']);
        Route::post('/{id}/messages', [DiscussionsController::class, 'sendMessage']);
        Route::post('/{id}/join', [DiscussionsController::class, 'joinDiscussion']);
        Route::post('/{id}/leave', [DiscussionsController::class, 'leaveDiscussion']);
    });
});
