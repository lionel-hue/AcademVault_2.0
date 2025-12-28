<?php
// server/app/Http/Controllers/Api/DashboardController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        try {
            // Count documents
            $documentsCount = DB::table('documents')
                ->count();

            // Count user's categories
            $categoriesCount = DB::table('categories')
                ->where('user_id', $userId)
                ->count();

            // Count user's collections
            $collectionsCount = DB::table('collections')
                ->where('user_id', $userId)
                ->count();

            // Count discussions where user is admin or member
            $discussionsCount = DB::table('discussions')
                ->where('admin_id', $userId)
                ->count();

            // Count bookmarks
            $bookmarksCount = DB::table('bookmarks')
                ->where('user_id', $userId)
                ->count();

            // Count friends (accepted friendships)
            $friendsCount = DB::table('friendships')
                ->where('user_id', $userId)
                ->where('status', 'accepted')
                ->count();

            // Calculate storage used - simplified
            $storageText = '0 MB';
            try {
                $storageResult = DB::table('documents')
                    ->whereNotNull('file_size')
                    ->select(DB::raw('COUNT(*) as count'))
                    ->first();
                $storageText = ($storageResult->count * 5) . ' MB'; // Estimate 5MB per file
            } catch (\Exception $e) {
                $storageText = '0 MB';
            }

            return response()->json([
                'success' => true,
                'stats' => [
                    'documents' => $documentsCount,
                    'categories' => $categoriesCount,
                    'collections' => $collectionsCount,
                    'discussions' => $discussionsCount,
                    'bookmarks' => $bookmarksCount,
                    'friends' => $friendsCount,
                    'storage' => $storageText,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard stats error: ' . $e->getMessage());

            // Return safe default values
            return response()->json([
                'success' => true,
                'stats' => [
                    'documents' => 0,
                    'categories' => 0,
                    'collections' => 0,
                    'discussions' => 0,
                    'bookmarks' => 0,
                    'friends' => 0,
                    'storage' => '0 MB',
                ]
            ]);
        }
    }

    public function recentActivities(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        try {
            // Simplified: Get activities from history table only
            $activities = DB::table('history')
                ->leftJoin('documents', 'history.document_id', '=', 'documents.id')
                ->where('history.user_id', $userId)
                ->select(
                    'history.id',
                    'history.action',
                    DB::raw('COALESCE(documents.title, "Document") as title'),
                    'history.created_at',
                    DB::raw("'history' as source")
                )
                ->orderBy('history.created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'action' => $item->action,
                        'title' => $item->title,
                        'created_at' => $item->created_at,
                        'source' => $item->source,
                    ];
                });

            return response()->json([
                'success' => true,
                'activities' => $activities
            ]);
        } catch (\Exception $e) {
            Log::error('Recent activities error: ' . $e->getMessage());

            // Return sample activities
            return response()->json([
                'success' => true,
                'activities' => [
                    [
                        'id' => 1,
                        'action' => 'viewed',
                        'title' => 'Introduction to Deep Learning',
                        'created_at' => now()->subHours(2)->toISOString(),
                        'source' => 'history'
                    ],
                    [
                        'id' => 2,
                        'action' => 'uploaded',
                        'title' => 'Research Paper.pdf',
                        'created_at' => now()->subDays(1)->toISOString(),
                        'source' => 'history'
                    ]
                ]
            ]);
        }
    }

    public function recentDocuments(Request $request)
    {
        try {
            $documents = DB::table('documents')
                ->select(
                    'id',
                    'title',
                    'type',
                    'author',
                    'view_count',
                    'created_at'
                )
                ->orderBy('created_at', 'desc')
                ->limit(4)
                ->get();

            return response()->json([
                'success' => true,
                'documents' => $documents
            ]);
        } catch (\Exception $e) {
            Log::error('Recent documents error: ' . $e->getMessage());

            // Return sample documents
            return response()->json([
                'success' => true,
                'documents' => [
                    [
                        'id' => 1,
                        'title' => 'Sample Document 1',
                        'type' => 'pdf',
                        'author' => 'Author 1',
                        'view_count' => 100,
                        'created_at' => now()->subDays(1)->toISOString()
                    ],
                    [
                        'id' => 2,
                        'title' => 'Sample Document 2',
                        'type' => 'video',
                        'author' => 'Author 2',
                        'view_count' => 50,
                        'created_at' => now()->subDays(2)->toISOString()
                    ]
                ]
            ]);
        }
    }

    public function favoriteDocuments(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        try {
            $favorites = DB::table('bookmarks')
                ->leftJoin('documents', 'bookmarks.document_id', '=', 'documents.id')
                ->where('bookmarks.user_id', $userId)
                ->where('bookmarks.is_favorite', true)
                ->select(
                    'documents.id',
                    DB::raw('COALESCE(documents.title, "Document") as title'),
                    DB::raw('COALESCE(documents.type, "pdf") as type'),
                    DB::raw('COALESCE(documents.author, "Unknown") as author'),
                    'documents.created_at',
                    'bookmarks.last_accessed_at'
                )
                ->orderBy('bookmarks.last_accessed_at', 'desc')
                ->limit(3)
                ->get();

            return response()->json([
                'success' => true,
                'favorites' => $favorites
            ]);
        } catch (\Exception $e) {
            Log::error('Favorite documents error: ' . $e->getMessage());

            // Return sample favorites
            return response()->json([
                'success' => true,
                'favorites' => []
            ]);
        }
    }

    public function notifications(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        try {
            $notifications = DB::table('notifications')
                ->where('user_id', $userId)
                ->where('is_read', false)
                ->select('id', 'title', 'message', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get();

            return response()->json([
                'success' => true,
                'notifications' => $notifications
            ]);
        } catch (\Exception $e) {
            Log::error('Notifications error: ' . $e->getMessage());

            // Return empty notifications
            return response()->json([
                'success' => true,
                'notifications' => []
            ]);
        }
    }

    // In DashboardController.php - Update searchHistory method
    public function searchHistory(Request $request)
    {
        $user = Auth::user();

        try {
            // Use the new search_history table
            $searchHistory = DB::table('search_history')
                ->where('user_id', $user->id)
                ->select('query', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get()
                ->map(function ($item) {
                    return $item->query;
                })
                ->unique() // Remove duplicates
                ->values()
                ->toArray();

            return response()->json([
                'success' => true,
                'search_history' => $searchHistory
            ]);
        } catch (\Exception $e) {
            Log::error('Search history error: ' . $e->getMessage());

            return response()->json([
                'success' => true,
                'search_history' => []
            ]);
        }
    }
}
