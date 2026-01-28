<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class FriendsController extends Controller
{
    // In the existing index() method, replace the query with:
    public function index(Request $request)
    {
        $user = Auth::user();

        try {
            // Get friends from both directions (user sent OR received request)
            $friends = DB::table('friendships as f')
                ->join('users as u', function ($join) use ($user) {
                    // When user sent request, friend is friend_id
                    $join->on('u.id', '=', 'f.friend_id')
                        ->where('f.user_id', $user->id);
                })
                ->where('f.status', 'accepted')
                ->select(
                    'u.id',
                    'u.name',
                    'u.email',
                    'u.type',
                    'u.institution',
                    'u.department',
                    'u.profile_image',
                    'f.relationship_type',
                    'f.shared_interests',
                    'f.interaction_score',
                    'f.accepted_at',
                    'f.created_at'
                )
                ->union(
                    // When user received request, friend is user_id
                    DB::table('friendships as f2')
                        ->join('users as u2', function ($join) use ($user) {
                            $join->on('u2.id', '=', 'f2.user_id')
                                ->where('f2.friend_id', $user->id);
                        })
                        ->where('f2.status', 'accepted')
                        ->select(
                            'u2.id',
                            'u2.name',
                            'u2.email',
                            'u2.type',
                            'u2.institution',
                            'u2.department',
                            'u2.profile_image',
                            'f2.relationship_type',
                            'f2.shared_interests',
                            'f2.interaction_score',
                            'f2.accepted_at',
                            'f2.created_at'
                        )
                )
                ->orderBy('accepted_at', 'desc')
                ->get();

            // Parse shared_interests JSON
            $friends->transform(function ($friend) {
                if ($friend->shared_interests) {
                    $friend->shared_interests = json_decode($friend->shared_interests, true);
                } else {
                    $friend->shared_interests = [];
                }
                return $friend;
            });

            return response()->json([
                'success' => true,
                'data' => $friends,
                'message' => 'Friends retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching friends: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch friends'
            ], 500);
        }
    }

    /**
     * Get friend requests (received)
     */
    public function getFriendRequests(Request $request)
    {
        $user = Auth::user();
        try {
            $requests = DB::table('friendships as f')
                ->join('users as u', 'u.id', '=', 'f.user_id')
                ->where('f.friend_id', $user->id)
                ->where('f.status', 'pending')
                ->select(
                    'f.id',
                    'u.id as user_id',
                    'u.name',
                    'u.email',
                    'u.type',
                    'u.institution',
                    'u.department',
                    'u.profile_image',
                    'f.message',
                    'f.created_at as sent_at'
                )
                ->orderBy('f.created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $requests,
                'message' => 'Friend requests retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching friend requests: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch friend requests'
            ], 500);
        }
    }

    /**
     * Send friend request
     */
    public function sendRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'friend_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $friendId = $request->input('friend_id');

        // Check if not sending to self
        if ($user->id == $friendId) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot send friend request to yourself'
            ], 400);
        }

        // Check if friendship already exists
        $existingFriendship = DB::table('friendships')
            ->where(function ($query) use ($user, $friendId) {
                $query->where('user_id', $user->id)
                    ->where('friend_id', $friendId);
            })
            ->orWhere(function ($query) use ($user, $friendId) {
                $query->where('user_id', $friendId)
                    ->where('friend_id', $user->id);
            })
            ->first();

        if ($existingFriendship) {
            $status = $existingFriendship->status;
            $message = $status === 'pending'
                ? 'Friend request already pending'
                : ($status === 'accepted'
                    ? 'Already friends'
                    : 'Friendship exists');

            return response()->json([
                'success' => false,
                'message' => $message
            ], 400);
        }

        try {
            DB::table('friendships')->insert([
                'user_id' => $user->id,
                'friend_id' => $friendId,
                'status' => 'pending',
                'message' => $request->input('message'),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Create notification for friend
            DB::table('notifications')->insert([
                'user_id' => $friendId,
                'type' => 'friend_request',
                'title' => 'New Friend Request',
                'message' => $user->name . ' sent you a friend request',
                'sender_id' => $user->id,
                'data' => json_encode([
                    'friendship_id' => DB::getPdo()->lastInsertId(),
                    'message' => $request->input('message')
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Friend request sent successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending friend request: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send friend request'
            ], 500);
        }
    }

    /**
     * Accept friend request
     */
    public function acceptRequest(Request $request, $requestId)
    {
        $user = Auth::user();
        try {
            $friendship = DB::table('friendships')
                ->where('id', $requestId)
                ->where('friend_id', $user->id)
                ->where('status', 'pending')
                ->first();

            if (!$friendship) {
                return response()->json([
                    'success' => false,
                    'message' => 'Friend request not found'
                ], 404);
            }

            DB::table('friendships')
                ->where('id', $requestId)
                ->update([
                    'status' => 'accepted',
                    'accepted_at' => now(),
                    'updated_at' => now()
                ]);

            // Create notification for sender
            DB::table('notifications')->insert([
                'user_id' => $friendship->user_id,
                'type' => 'friend_request_accepted',
                'title' => 'Friend Request Accepted',
                'message' => $user->name . ' accepted your friend request',
                'sender_id' => $user->id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Friend request accepted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error accepting friend request: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept friend request'
            ], 500);
        }
    }

    /**
     * Reject friend request
     */
    public function rejectRequest(Request $request, $requestId)
    {
        $user = Auth::user();
        try {
            $friendship = DB::table('friendships')
                ->where('id', $requestId)
                ->where('friend_id', $user->id)
                ->where('status', 'pending')
                ->first();

            if (!$friendship) {
                return response()->json([
                    'success' => false,
                    'message' => 'Friend request not found'
                ], 404);
            }

            DB::table('friendships')
                ->where('id', $requestId)
                ->update([
                    'status' => 'rejected',
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Friend request rejected successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error rejecting friend request: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject friend request'
            ], 500);
        }
    }

    /**
     * Remove friend
     */
    public function removeFriend(Request $request, $friendId)
    {
        $user = Auth::user();
        try {
            $deleted = DB::table('friendships')
                ->where(function ($query) use ($user, $friendId) {
                    $query->where('user_id', $user->id)
                        ->where('friend_id', $friendId)
                        ->where('status', 'accepted');
                })
                ->orWhere(function ($query) use ($user, $friendId) {
                    $query->where('user_id', $friendId)
                        ->where('friend_id', $user->id)
                        ->where('status', 'accepted');
                })
                ->delete();

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Friend removed successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Friend not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error removing friend: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove friend'
            ], 500);
        }
    }

    /**
     * Search users (for adding friends)
     */
    public function searchUsers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2|max:255',
            'exclude_friends' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $query = $request->input('query');
        $excludeFriends = $request->input('exclude_friends', false);

        try {
            $searchQuery = DB::table('users as u')
                ->where('u.id', '!=', $user->id)
                ->where(function ($q) use ($query) {
                    $q->where('u.name', 'LIKE', "%{$query}%")
                        ->orWhere('u.email', 'LIKE', "%{$query}%")
                        ->orWhere('u.institution', 'LIKE', "%{$query}%")
                        ->orWhere('u.department', 'LIKE', "%{$query}%");
                });

            // Exclude already friends
            if ($excludeFriends) {
                $friendsIds = DB::table('friendships')
                    ->where(function ($q) use ($user) {
                        $q->where('user_id', $user->id)
                            ->orWhere('friend_id', $user->id);
                    })
                    ->where('status', 'accepted')
                    ->pluck('user_id', 'friend_id')
                    ->flatMap(function ($value, $key) {
                        return [$value, $key];
                    })
                    ->unique()
                    ->filter(function ($id) use ($user) {
                        return $id != $user->id;
                    })
                    ->toArray();

                if (!empty($friendsIds)) {
                    $searchQuery->whereNotIn('u.id', $friendsIds);
                }
            }

            $users = $searchQuery
                ->select(
                    'u.id',
                    'u.name',
                    'u.email',
                    'u.type',
                    'u.institution',
                    'u.department',
                    'u.profile_image',
                    'u.created_at'
                )
                ->limit(20)
                ->get();

            // Add friend status and mutual friends
            $users->transform(function ($userItem) use ($user) {
                // Calculate mutual friends
                $mutualFriends = DB::table('friendships as f1')
                    ->join('friendships as f2', function ($join) use ($userItem) {
                        $join->on('f1.friend_id', '=', 'f2.friend_id')
                            ->where('f2.user_id', $userItem->id);
                    })
                    ->where('f1.user_id', $user->id)
                    ->where('f1.status', 'accepted')
                    ->where('f2.status', 'accepted')
                    ->count();

                $userItem->mutual_friends = $mutualFriends;

                // Check friendship status
                $friendship = DB::table('friendships')
                    ->where(function ($query) use ($user, $userItem) {
                        $query->where('user_id', $user->id)
                            ->where('friend_id', $userItem->id);
                    })
                    ->orWhere(function ($query) use ($user, $userItem) {
                        $query->where('friend_id', $user->id)
                            ->where('user_id', $userItem->id);
                    })
                    ->first();

                if ($friendship) {
                    if ($friendship->status === 'accepted') {
                        $userItem->is_friend = true;
                        $userItem->friendship_status = 'accepted';
                    } elseif ($friendship->status === 'pending') {
                        if ($friendship->user_id == $user->id) {
                            $userItem->is_friend = 'pending_sent';
                        } else {
                            $userItem->is_friend = 'pending_received';
                        }
                        $userItem->friendship_status = 'pending';
                    } else {
                        $userItem->is_friend = false;
                        $userItem->friendship_status = $friendship->status;
                    }
                } else {
                    $userItem->is_friend = false;
                    $userItem->friendship_status = null;
                }

                return $userItem;
            });

            return response()->json([
                'success' => true,
                'data' => $users,
                'message' => 'Users found successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error searching users: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to search users'
            ], 500);
        }
    }

    /**
     * Get friend stats
     */
    public function getStats()
    {
        $user = Auth::user();
        try {
            // 1. Count total accepted friendships (both directions)
            $totalFriends = DB::table('friendships')
                ->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->orWhere('friend_id', $user->id);
                })
                ->where('status', 'accepted')
                ->count();

            // 2. Count pending requests received by the user
            $pendingRequests = DB::table('friendships')
                ->where('friend_id', $user->id)
                ->where('status', 'pending')
                ->count();

            // 3. Count colleagues (No join needed, relationship_type is in the friendships table)
            $colleagues = DB::table('friendships')
                ->where('status', 'accepted')
                ->where('relationship_type', 'colleague')
                ->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->orWhere('friend_id', $user->id);
                })
                ->count();

            // 4. Count mentors (No join needed)
            $mentors = DB::table('friendships')
                ->where('status', 'accepted')
                ->where('relationship_type', 'mentor')
                ->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->orWhere('friend_id', $user->id);
                })
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_friends' => $totalFriends,
                    'pending_requests' => $pendingRequests,
                    'colleagues' => $colleagues,
                    'mentors' => $mentors
                ],
                'message' => 'Friend stats retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting friend stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get friend stats'
            ], 500);
        }
    }
}
