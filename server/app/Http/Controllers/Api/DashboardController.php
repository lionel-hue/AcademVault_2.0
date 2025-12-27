<?php
// server/app/Http/Controllers/Api/DashboardController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        // Count documents
        $documentsCount = DB::table('documents')
            ->where('is_public', true)
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
            ->leftJoin('group_members', 'discussions.id', '=', 'group_members.discussion_id')
            ->where(function($query) use ($userId) {
                $query->where('discussions.admin_id', $userId)
                      ->orWhere('group_members.user_id', $userId);
            })
            ->distinct('discussions.id')
            ->count();

        // Count bookmarks
        $bookmarksCount = DB::table('bookmarks')
            ->where('user_id', $userId)
            ->count();

        // Count friends (accepted friendships)
        $friendsCount = DB::table('friendships')
            ->where(function($query) use ($userId) {
                $query->where('user_id', $userId)
                      ->orWhere('friend_id', $userId);
            })
            ->where('status', 'accepted')
            ->count();

        // Calculate storage used (simplified - sum of file sizes)
        $storageUsed = DB::table('documents')
            ->whereNotNull('file_size')
            ->select(DB::raw('SUM(CASE 
                WHEN file_size LIKE "%MB" THEN CAST(REPLACE(file_size, "MB", "") AS DECIMAL(10,2))
                WHEN file_size LIKE "%KB" THEN CAST(REPLACE(file_size, "KB", "") AS DECIMAL(10,2)) / 1024
                WHEN file_size LIKE "%GB" THEN CAST(REPLACE(file_size, "GB", "") AS DECIMAL(10,2)) * 1024
                ELSE 0
            END) as total_mb'))
            ->first();

        $storageMB = round($storageUsed->total_mb ?? 0, 2);
        $storageText = $storageMB >= 1024 ? 
            round($storageMB / 1024, 2) . ' GB' : 
            $storageMB . ' MB';

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
    }

    public function recentActivities(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        // Get recent activities from multiple tables
        $activities = [];

        // From history table (document views/downloads)
        $historyActivities = DB::table('history')
            ->join('documents', 'history.document_id', '=', 'documents.id')
            ->where('history.user_id', $userId)
            ->select(
                'history.id',
                'history.action',
                'documents.title',
                'history.created_at',
                DB::raw("'history' as source")
            )
            ->orderBy('history.created_at', 'desc')
            ->limit(10)
            ->get();

        // From discussions (messages)
        $discussionActivities = DB::table('messages')
            ->join('discussions', 'messages.discussion_id', '=', 'discussions.id')
            ->where('messages.user_id', $userId)
            ->select(
                'messages.id',
                DB::raw("'message' as action"),
                'discussions.title',
                'messages.created_at',
                DB::raw("'discussion' as source")
            )
            ->orderBy('messages.created_at', 'desc')
            ->limit(10)
            ->get();

        // From bookmarks
        $bookmarkActivities = DB::table('bookmarks')
            ->join('documents', 'bookmarks.document_id', '=', 'documents.id')
            ->where('bookmarks.user_id', $userId)
            ->select(
                'bookmarks.id',
                DB::raw("'bookmark' as action"),
                'documents.title',
                'bookmarks.created_at',
                DB::raw("'bookmark' as source")
            )
            ->orderBy('bookmarks.created_at', 'desc')
            ->limit(10)
            ->get();

        // Merge all activities and sort by date
        $allActivities = collect()
            ->merge($historyActivities)
            ->merge($discussionActivities)
            ->merge($bookmarkActivities)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return response()->json([
            'success' => true,
            'activities' => $allActivities
        ]);
    }

    public function recentDocuments(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        // Get recently accessed documents (from history)
        $recentDocuments = DB::table('documents')
            ->leftJoin('history', function($join) use ($userId) {
                $join->on('documents.id', '=', 'history.document_id')
                     ->where('history.user_id', $userId);
            })
            ->select(
                'documents.id',
                'documents.title',
                'documents.type',
                'documents.author',
                'documents.view_count',
                'documents.created_at',
                DB::raw('MAX(history.created_at) as last_accessed')
            )
            ->where('documents.is_public', true)
            ->groupBy('documents.id', 'documents.title', 'documents.type', 
                     'documents.author', 'documents.view_count', 'documents.created_at')
            ->orderBy('last_accessed', 'desc')
            ->orderBy('documents.created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'documents' => $recentDocuments
        ]);
    }

    public function favoriteDocuments(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        $favorites = DB::table('bookmarks')
            ->join('documents', 'bookmarks.document_id', '=', 'documents.id')
            ->where('bookmarks.user_id', $userId)
            ->where('bookmarks.is_favorite', true)
            ->select(
                'documents.id',
                'documents.title',
                'documents.type',
                'documents.author',
                'documents.created_at',
                'bookmarks.last_accessed_at'
            )
            ->orderBy('bookmarks.last_accessed_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'favorites' => $favorites
        ]);
    }

    public function notifications(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        $notifications = DB::table('notifications')
            ->where('user_id', $userId)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'notifications' => $notifications
        ]);
    }

    public function searchHistory(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        // Get search history from history table
        $searchHistory = DB::table('history')
            ->where('user_id', $userId)
            ->where('action', 'like', '%search%')
            ->select('details')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($item) {
                $details = json_decode($item->details, true);
                return $details['query'] ?? null;
            })
            ->filter()
            ->unique()
            ->values();

        return response()->json([
            'success' => true,
            'search_history' => $searchHistory
        ]);
    }
}