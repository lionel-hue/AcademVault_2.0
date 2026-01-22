<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Get user profile
     */
    public function show()
    {
        try {
            $user = Auth::user();
            
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
                    'bio' => $user->bio,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'email_verified_at' => $user->email_verified_at,
                    'registration_date' => $user->registration_date,
                    'created_at' => $user->created_at,
                    'stats' => $this->getUserStats($user->id)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching profile: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile'
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'institution' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->only(['name', 'bio', 'institution', 'department', 'phone']);

            // Handle profile image upload
            if ($request->hasFile('profile_image')) {
                // Delete old profile image if exists
                if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                    Storage::disk('public')->delete($user->profile_image);
                }

                $file = $request->file('profile_image');
                $filename = 'profile_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('profile_images', $filename, 'public');
                $updateData['profile_image'] = $path;
            }

            $user->update($updateData);

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
                    'bio' => $user->bio,
                    'phone' => $user->phone
                ],
                'message' => 'Profile updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating profile: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile'
            ], 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Get user statistics
     */
    private function getUserStats($userId)
    {
        try {
            $stats = [
                'documents' => \DB::table('documents')->where('user_id', $userId)->count(),
                'categories' => \DB::table('categories')->where('user_id', $userId)->count(),
                'collections' => \DB::table('collections')->where('user_id', $userId)->count(),
                'bookmarks' => \DB::table('bookmarks')->where('user_id', $userId)->count(),
                'friends' => \DB::table('friendships')
                    ->where('user_id', $userId)
                    ->where('status', 'accepted')
                    ->count(),
                'discussions' => \DB::table('discussions')->where('admin_id', $userId)->count(),
                'storage_used' => $this->calculateStorageUsed($userId)
            ];

            return $stats;
        } catch (\Exception $e) {
            Log::error('Error calculating user stats: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Calculate storage used by user
     */
    private function calculateStorageUsed($userId)
    {
        try {
            $documents = \DB::table('documents')
                ->where('user_id', $userId)
                ->whereNotNull('file_size')
                ->select('file_size')
                ->get();

            $totalBytes = $documents->sum('file_size');
            
            return $this->formatBytes($totalBytes);
        } catch (\Exception $e) {
            return '0 MB';
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Get user activity history
     */
    public function getActivityHistory(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'limit' => 'sometimes|integer|min:1|max:100',
            'type' => 'sometimes|in:all,documents,searches,bookmarks'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $limit = $request->input('limit', 20);
            $type = $request->input('type', 'all');

            $activities = [];

            // Get document activities
            if ($type === 'all' || $type === 'documents') {
                $documentActivities = \DB::table('history')
                    ->where('user_id', $user->id)
                    ->leftJoin('documents', 'history.document_id', '=', 'documents.id')
                    ->select(
                        'history.id',
                        'history.action',
                        'history.created_at',
                        'documents.title',
                        'documents.type',
                        \DB::raw("'document' as activity_type")
                    )
                    ->orderBy('history.created_at', 'desc')
                    ->limit($limit)
                    ->get();

                foreach ($documentActivities as $activity) {
                    $activities[] = [
                        'id' => $activity->id,
                        'type' => $activity->activity_type,
                        'action' => $activity->action,
                        'title' => $activity->title,
                        'description' => ucfirst($activity->action) . ' ' . $activity->title,
                        'created_at' => $activity->created_at,
                        'icon' => $this->getActivityIcon($activity->action, $activity->type)
                    ];
                }
            }

            // Get search activities
            if ($type === 'all' || $type === 'searches') {
                $searchActivities = \DB::table('search_history')
                    ->where('user_id', $user->id)
                    ->select(
                        'id',
                        'query as title',
                        'created_at',
                        \DB::raw("'search' as activity_type"),
                        \DB::raw("'searched' as action")
                    )
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get();

                foreach ($searchActivities as $activity) {
                    $activities[] = [
                        'id' => $activity->id,
                        'type' => $activity->activity_type,
                        'action' => $activity->action,
                        'title' => $activity->title,
                        'description' => 'Searched for: ' . $activity->title,
                        'created_at' => $activity->created_at,
                        'icon' => 'fas fa-search'
                    ];
                }
            }

            // Sort all activities by date
            usort($activities, function($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });

            // Limit activities
            $activities = array_slice($activities, 0, $limit);

            return response()->json([
                'success' => true,
                'data' => $activities,
                'message' => 'Activity history retrieved'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching activity history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity history'
            ], 500);
        }
    }

    /**
     * Get activity icon based on action and type
     */
    private function getActivityIcon($action, $type = null)
    {
        switch ($action) {
            case 'viewed':
                return 'fas fa-eye';
            case 'downloaded':
                return 'fas fa-download';
            case 'created':
                return 'fas fa-plus';
            case 'updated':
                return 'fas fa-edit';
            case 'searched':
                return 'fas fa-search';
            case 'bookmarked':
                return 'fas fa-bookmark';
            default:
                return 'fas fa-history';
        }
    }

    /**
     * Get user preferences
     */
    public function getPreferences()
    {
        try {
            $user = Auth::user();
            
            $preferences = \DB::table('user_preferences')
                ->where('user_id', $user->id)
                ->first();

            if (!$preferences) {
                // Create default preferences if not exist
                $preferences = [
                    'theme' => 'dark',
                    'language' => 'en',
                    'timezone' => 'UTC',
                    'notification_settings' => [
                        'email_notifications' => true,
                        'push_notifications' => true,
                        'document_updates' => true,
                        'friend_requests' => true,
                        'discussion_replies' => true
                    ],
                    'privacy_settings' => [
                        'profile_visibility' => 'public',
                        'document_visibility' => 'private',
                        'show_email' => false,
                        'show_phone' => false
                    ],
                    'document_settings' => [
                        'default_visibility' => 'private',
                        'auto_categorize' => true,
                        'thumbnail_generation' => true
                    ],
                    'ui_settings' => [
                        'compact_view' => false,
                        'show_animations' => true,
                        'font_size' => 'medium'
                    ]
                ];

                \DB::table('user_preferences')->insert([
                    'user_id' => $user->id,
                    'theme' => $preferences['theme'],
                    'language' => $preferences['language'],
                    'timezone' => $preferences['timezone'],
                    'notification_settings' => json_encode($preferences['notification_settings']),
                    'privacy_settings' => json_encode($preferences['privacy_settings']),
                    'document_settings' => json_encode($preferences['document_settings']),
                    'ui_settings' => json_encode($preferences['ui_settings']),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $preferences['id'] = \DB::getPdo()->lastInsertId();
            } else {
                $preferences = (array) $preferences;
                $preferences['notification_settings'] = json_decode($preferences['notification_settings'], true);
                $preferences['privacy_settings'] = json_decode($preferences['privacy_settings'], true);
                $preferences['document_settings'] = json_decode($preferences['document_settings'], true);
                $preferences['ui_settings'] = json_decode($preferences['ui_settings'], true);
            }

            return response()->json([
                'success' => true,
                'data' => $preferences,
                'message' => 'Preferences retrieved'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching preferences: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch preferences'
            ], 500);
        }
    }

    /**
     * Update user preferences
     */
    public function updatePreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'theme' => 'sometimes|in:light,dark,auto',
            'language' => 'sometimes|string|max:10',
            'timezone' => 'sometimes|string|max:50',
            'notification_settings' => 'sometimes|array',
            'privacy_settings' => 'sometimes|array',
            'document_settings' => 'sometimes|array',
            'ui_settings' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $updateData = [];

            // Add each field to update data if present
            $fields = ['theme', 'language', 'timezone'];
            foreach ($fields as $field) {
                if ($request->has($field)) {
                    $updateData[$field] = $request->input($field);
                }
            }

            // Handle JSON fields
            $jsonFields = ['notification_settings', 'privacy_settings', 'document_settings', 'ui_settings'];
            foreach ($jsonFields as $field) {
                if ($request->has($field)) {
                    $updateData[$field] = json_encode($request->input($field));
                }
            }

            $updateData['updated_at'] = now();

            // Check if preferences exist
            $exists = \DB::table('user_preferences')->where('user_id', $user->id)->exists();

            if ($exists) {
                \DB::table('user_preferences')
                    ->where('user_id', $user->id)
                    ->update($updateData);
            } else {
                $updateData['user_id'] = $user->id;
                $updateData['created_at'] = now();
                \DB::table('user_preferences')->insert($updateData);
            }

            return response()->json([
                'success' => true,
                'message' => 'Preferences updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating preferences: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update preferences'
            ], 500);
        }
    }

    /**
     * Delete user account
     */
    public function deleteAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'confirmation' => 'required|string|in:DELETE MY ACCOUNT'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please type "DELETE MY ACCOUNT" to confirm'
            ], 422);
        }

        try {
            $user = Auth::user();

            // Log the user out
            Auth::logout();

            // Soft delete the user
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting account: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete account'
            ], 500);
        }
    }
}