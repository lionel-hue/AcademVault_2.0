<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DiscussionsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        try {
            $discussions = DB::table('discussions as d')
                ->leftJoin('users as u', 'u.id', '=', 'd.admin_id')
                ->leftJoin('documents as doc', 'doc.id', '=', 'd.document_id')
                // Join to check if the CURRENT user is a member
                ->leftJoin('group_members as gm_check', function ($join) use ($user) {
                    $join->on('gm_check.discussion_id', '=', 'd.id')
                        ->where('gm_check.user_id', '=', $user->id)
                        ->where('gm_check.status', '=', 'active');
                })
                ->select(
                    'd.id',
                    'd.title',
                    'd.description',
                    'd.type',
                    'd.privacy',
                    'd.member_count',
                    'd.message_count',
                    'd.last_message_at',
                    'd.cover_image',
                    'd.is_pinned',
                    'd.is_archived',
                    'd.tags',
                    'd.created_at',
                    'd.invite_code',
                    'u.name as admin_name',
                    'u.profile_image as admin_profile_image',
                    'doc.title as document_title',
                    // Returns 1 if member, 0 if not
                    DB::raw('CASE WHEN gm_check.id IS NOT NULL THEN 1 ELSE 0 END as is_member')
                )
                ->where(function ($query) use ($user) {
                    $query->where('d.admin_id', $user->id)       // I am the boss
                        ->orWhere('d.privacy', 'public')      // It is public
                        ->orWhereNotNull('gm_check.id');      // I am a member
                })
                ->whereNull('d.deleted_at')
                ->where('d.is_archived', false)
                ->orderBy('d.is_pinned', 'desc')
                ->orderBy('d.last_message_at', 'desc')
                ->get();

            // Safe JSON parsing for tags
            $discussions->transform(function ($discussion) {
                if (!empty($discussion->tags) && is_string($discussion->tags)) {
                    $discussion->tags = json_decode($discussion->tags, true);
                }
                $discussion->tags = $discussion->tags ?? [];
                return $discussion;
            });

            return response()->json([
                'success' => true,
                'data' => $discussions,
                'message' => 'Discussions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching discussions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch discussions'
            ], 500);
        }
    }

    /**
     * Get discussion details
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        try {
            $discussion = DB::table('discussions as d')
                ->leftJoin('users as u', 'u.id', '=', 'd.admin_id')
                ->leftJoin('documents as doc', 'doc.id', '=', 'd.document_id')
                ->select(
                    'd.id',
                    'd.title',
                    'd.description',
                    'd.type',
                    'd.document_id',
                    'd.privacy',
                    'd.member_count',
                    'd.message_count',
                    'd.last_message_at',
                    'd.cover_image',
                    'd.is_pinned',
                    'd.is_archived',
                    'd.tags',
                    'd.settings',
                    'd.invite_code',
                    'd.created_at',
                    'u.name as admin_name',
                    'u.email as admin_email',
                    'u.profile_image as admin_profile_image',
                    'doc.title as document_title',
                    'doc.type as document_type'
                )
                ->where('d.id', $id)
                ->first();

            if (!$discussion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Discussion not found'
                ], 404);
            }

            // Check if user can access this discussion
            $canAccess = $this->canAccessDiscussion($user->id, $id, $discussion->privacy);
            if (!$canAccess) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this discussion'
                ], 403);
            }

            // Get discussion members
            $members = DB::table('group_members as gm')
                ->join('users as u', 'u.id', '=', 'gm.user_id')
                ->where('gm.discussion_id', $id)
                ->where('gm.status', 'active')
                ->select(
                    'u.id',
                    'u.name',
                    'u.email',
                    'u.type',
                    'u.institution',
                    'u.profile_image',
                    'gm.role',
                    'gm.joined_at',
                    'gm.message_count'
                )
                ->orderBy('gm.role', 'desc')
                ->orderBy('gm.joined_at', 'asc')
                ->get();

            // Get recent messages
            $messages = DB::table('messages as m')
                ->join('users as u', 'u.id', '=', 'm.user_id')
                ->leftJoin('documents as doc', 'doc.id', '=', 'm.document_id')
                ->where('m.discussion_id', $id)
                ->whereNull('m.deleted_at')
                ->select(
                    'm.id',
                    'm.content',
                    'm.message_type',
                    'm.document_id',
                    'm.attachment_path',
                    'm.attachment_name',
                    'm.attachment_size',
                    'm.reactions',
                    'm.reply_to',
                    'm.is_edited',
                    'm.is_pinned',
                    'm.created_at',
                    'u.id as user_id',
                    'u.name as user_name',
                    'u.profile_image as user_profile_image',
                    'doc.title as document_title',
                    'doc.type as document_type'
                )
                ->orderBy('m.created_at', 'desc')
                ->limit(50)
                ->get();

            // Parse JSON fields
            if ($discussion->tags) {
                $discussion->tags = json_decode($discussion->tags, true);
            } else {
                $discussion->tags = [];
            }

            if ($discussion->settings) {
                $discussion->settings = json_decode($discussion->settings, true);
            }

            $messages->transform(function ($message) {
                if ($message->reactions) {
                    $message->reactions = json_decode($message->reactions, true);
                }
                return $message;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'discussion' => $discussion,
                    'members' => $members,
                    'messages' => $messages,
                    'is_admin' => $discussion->admin_name === $user->name
                ],
                'message' => 'Discussion retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching discussion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch discussion'
            ], 500);
        }
    }

    /**
     * Create new discussion with invite code
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:document,general,group,project',
            'privacy' => 'required|in:public,private,invite_only',
            'document_id' => 'nullable|exists:documents,id',
            'tags' => 'nullable|array',
            'initial_members' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        DB::beginTransaction();

        try {
            $inviteCode = Str::random(8);

            // 1. Create Discussion
            $discussionId = DB::table('discussions')->insertGetId([
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'privacy' => $request->privacy,
                'admin_id' => $user->id,
                'invite_code' => $inviteCode,
                'member_count' => 1,
                'tags' => $request->tags ? json_encode($request->tags) : null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // 2. Add Creator as Admin Member
            DB::table('group_members')->insert([
                'user_id' => $user->id,
                'discussion_id' => $discussionId,
                'role' => 'admin',
                'status' => 'active',
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // 3. Add Initial Members (The Friend)
            if ($request->has('initial_members')) {
                // Remove duplicates and self
                $memberIds = array_unique($request->input('initial_members'));
                $memberIds = array_filter($memberIds, fn($id) => $id != $user->id);

                if (!empty($memberIds)) {
                    $memberData = [];
                    foreach ($memberIds as $mId) {
                        $memberData[] = [
                            'user_id' => $mId,
                            'discussion_id' => $discussionId,
                            'role' => 'member',
                            'status' => 'active',
                            'joined_at' => now(),
                            'created_at' => now(),
                            'updated_at' => now()
                        ];

                        // Notification for the friend
                        DB::table('notifications')->insert([
                            'user_id' => $mId,
                            'type' => 'discussion_invite',
                            'title' => 'New Chat',
                            'message' => $user->name . ' started a chat with you',
                            'sender_id' => $user->id,
                            'discussion_id' => $discussionId,
                            'data' => json_encode(['invite_code' => $inviteCode]),
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                    DB::table('group_members')->insert($memberData);

                    // Update count
                    DB::table('discussions')->where('id', $discussionId)->update([
                        'member_count' => count($memberIds) + 1
                    ]);
                }
            }

            // 4. System Message
            DB::table('messages')->insert([
                'discussion_id' => $discussionId,
                'user_id' => $user->id,
                'content' => "Chat started.",
                'message_type' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => ['id' => $discussionId, 'invite_code' => $inviteCode],
                'message' => 'Chat started'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create Discussion Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to create discussion'], 500);
        }
    }

    /**
     * Join discussion by invite code
     */
    public function joinByInviteCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'invite_code' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Invite code is required'], 422);
        }

        $user = Auth::user();
        $inviteCode = trim($request->input('invite_code'));

        try {
            // 1. Find the discussion (case-insensitive for better mobile experience)
            $discussion = DB::table('discussions')
                ->where('invite_code', $inviteCode)
                ->whereNull('deleted_at')
                ->where('is_archived', false)
                ->first();

            if (!$discussion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid invite code or discussion no longer exists'
                ], 404);
            }

            // 2. Check if already a member
            $isMember = DB::table('group_members')
                ->where('discussion_id', $discussion->id)
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->exists();

            if ($isMember) {
                return response()->json([
                    'success' => true, // Return success so frontend can redirect
                    'data' => [
                        'discussion_id' => $discussion->id,
                        'title' => $discussion->title,
                        'already_member' => true
                    ],
                    'message' => 'You are already a member of this discussion'
                ], 200); // Changed from 400 to 200
            }

            // 3. Join the discussion
            DB::beginTransaction();

            DB::table('group_members')->insert([
                'user_id' => $user->id,
                'discussion_id' => $discussion->id,
                'role' => 'member',
                'status' => 'active',
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::table('discussions')
                ->where('id', $discussion->id)
                ->update([
                    'member_count' => DB::raw('member_count + 1'),
                    'updated_at' => now()
                ]);

            DB::table('messages')->insert([
                'discussion_id' => $discussion->id,
                'user_id' => $user->id,
                'content' => $user->name . ' joined the discussion.',
                'message_type' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'discussion_id' => $discussion->id,
                    'title' => $discussion->title
                ],
                'message' => 'Successfully joined!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Join Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error while joining'], 500);
        }
    }

    /**
     * Get discussion by invite code (public access)
     */
    public function getByInviteCode(Request $request, $inviteCode)
    {
        try {
            $discussion = DB::table('discussions as d')
                ->leftJoin('users as u', 'u.id', '=', 'd.admin_id')
                ->leftJoin('documents as doc', 'doc.id', '=', 'd.document_id')
                ->select(
                    'd.id',
                    'd.title',
                    'd.description',
                    'd.type',
                    'd.privacy',
                    'd.member_count',
                    'd.message_count',
                    'd.last_message_at',
                    'd.cover_image',
                    'd.is_pinned',
                    'd.is_archived',
                    'd.tags',
                    'd.invite_code',
                    'd.created_at',
                    'u.name as admin_name',
                    'u.profile_image as admin_profile_image',
                    'doc.title as document_title'
                )
                ->where('d.invite_code', $inviteCode)
                ->where('d.is_archived', false)
                ->first();

            if (!$discussion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Discussion not found or invite code is invalid'
                ], 404);
            }

            // Parse tags
            if ($discussion->tags) {
                $discussion->tags = json_decode($discussion->tags, true);
            } else {
                $discussion->tags = [];
            }

            // Check if user is authenticated and a member
            $isMember = false;
            $isAdmin = false;

            if (Auth::check()) {
                $user = Auth::user();
                $isMember = DB::table('group_members')
                    ->where('discussion_id', $discussion->id)
                    ->where('user_id', $user->id)
                    ->where('status', 'active')
                    ->exists();

                $isAdmin = $discussion->admin_name === $user->name;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'discussion' => $discussion,
                    'is_member' => $isMember,
                    'is_admin' => $isAdmin,
                    'can_join' => $discussion->privacy === 'public' || ($discussion->privacy === 'invite_only' && $inviteCode)
                ],
                'message' => 'Discussion retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching discussion by invite code: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch discussion'
            ], 500);
        }
    }

    /**
     * Send message in discussion
     */
    public function sendMessage(Request $request, $discussionId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required_without_all:document_id,attachment|string|max:2000',
            'document_id' => 'nullable|exists:documents,id',
            'attachment' => 'nullable|string',
            'reply_to' => 'nullable|exists:messages,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();

        // Check if user is a member of the discussion
        $isMember = DB::table('group_members')
            ->where('discussion_id', $discussionId)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->exists();

        $discussion = DB::table('discussions')
            ->where('id', $discussionId)
            ->first();

        if (!$discussion) {
            return response()->json([
                'success' => false,
                'message' => 'Discussion not found'
            ], 404);
        }

        // Check access
        $canAccess = $this->canAccessDiscussion($user->id, $discussionId, $discussion->privacy);
        if (!$canAccess && !$isMember && $user->id != $discussion->admin_id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this discussion'
            ], 403);
        }

        DB::beginTransaction();
        try {
            // Create message
            $messageId = DB::table('messages')->insertGetId([
                'discussion_id' => $discussionId,
                'user_id' => $user->id,
                'content' => $request->input('content', ''),
                'message_type' => $request->input('document_id') ? 'document' : ($request->input('attachment') ? 'attachment' : 'text'),
                'document_id' => $request->input('document_id'),
                'attachment_path' => $request->input('attachment'),
                'attachment_name' => $request->input('attachment_name'),
                'attachment_size' => $request->input('attachment_size'),
                'reply_to' => $request->input('reply_to'),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Update discussion last message time and message count
            DB::table('discussions')
                ->where('id', $discussionId)
                ->update([
                    'last_message_at' => now(),
                    'message_count' => DB::raw('message_count + 1'),
                    'updated_at' => now()
                ]);

            // Update user's message count in group members
            DB::table('group_members')
                ->where('discussion_id', $discussionId)
                ->where('user_id', $user->id)
                ->update([
                    'message_count' => DB::raw('message_count + 1'),
                    'updated_at' => now()
                ]);

            DB::commit();

            // Get the created message with user info
            $message = DB::table('messages as m')
                ->join('users as u', 'u.id', '=', 'm.user_id')
                ->leftJoin('documents as doc', 'doc.id', '=', 'm.document_id')
                ->where('m.id', $messageId)
                ->select(
                    'm.id',
                    'm.content',
                    'm.message_type',
                    'm.document_id',
                    'm.attachment_path',
                    'm.attachment_name',
                    'm.attachment_size',
                    'm.reply_to',
                    'm.is_edited',
                    'm.is_pinned',
                    'm.created_at',
                    'u.id as user_id',
                    'u.name as user_name',
                    'u.profile_image as user_profile_image',
                    'doc.title as document_title',
                    'doc.type as document_type'
                )
                ->first();

            return response()->json([
                'success' => true,
                'data' => $message,
                'message' => 'Message sent successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error sending message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message'
            ], 500);
        }
    }

    /**
     * Get recent messages for polling
     */
    public function getRecentMessages(Request $request, $discussionId)
    {
        $user = Auth::user();

        try {
            $lastMessageId = $request->input('last_message_id', 0);

            // Check if user is a member
            $isMember = DB::table('group_members')
                ->where('discussion_id', $discussionId)
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->exists();

            $discussion = DB::table('discussions')
                ->where('id', $discussionId)
                ->first();

            if (!$discussion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Discussion not found'
                ], 404);
            }

            // Check access
            $canAccess = $this->canAccessDiscussion($user->id, $discussionId, $discussion->privacy);
            if (!$canAccess && !$isMember && $user->id != $discussion->admin_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this discussion'
                ], 403);
            }

            // Get new messages since last_message_id
            $messages = DB::table('messages as m')
                ->join('users as u', 'u.id', '=', 'm.user_id')
                ->leftJoin('documents as doc', 'doc.id', '=', 'm.document_id')
                ->where('m.discussion_id', $discussionId)
                ->where('m.id', '>', $lastMessageId)
                ->whereNull('m.deleted_at')
                ->select(
                    'm.id',
                    'm.content',
                    'm.message_type',
                    'm.document_id',
                    'm.attachment_path',
                    'm.attachment_name',
                    'm.attachment_size',
                    'm.reply_to',
                    'm.is_edited',
                    'm.is_pinned',
                    'm.created_at',
                    'u.id as user_id',
                    'u.name as user_name',
                    'u.profile_image as user_profile_image',
                    'doc.title as document_title',
                    'doc.type as document_type'
                )
                ->orderBy('m.created_at', 'asc')
                ->get();

            // Get new members since last check
            $newMembers = DB::table('group_members as gm')
                ->join('users as u', 'u.id', '=', 'gm.user_id')
                ->where('gm.discussion_id', $discussionId)
                ->where('gm.status', 'active')
                ->where('gm.joined_at', '>', now()->subMinutes(5)) // Members who joined in last 5 minutes
                ->select(
                    'u.id',
                    'u.name',
                    'u.profile_image',
                    'gm.joined_at'
                )
                ->orderBy('gm.joined_at', 'desc')
                ->limit(10)
                ->get();

            $messages->transform(function ($message) {
                if ($message->reactions) {
                    $message->reactions = json_decode($message->reactions, true);
                }
                return $message;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'messages' => $messages,
                    'new_members' => $newMembers,
                    'last_message_id' => $messages->isNotEmpty() ? $messages->last()->id : $lastMessageId,
                    'member_count' => $discussion->member_count,
                    'message_count' => $discussion->message_count,
                    'last_message_at' => $discussion->last_message_at
                ],
                'message' => 'Recent messages retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching recent messages: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent messages'
            ], 500);
        }
    }

    /**
     * Update discussion
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'privacy' => 'sometimes|in:public,private,invite_only',
            'is_archived' => 'sometimes|boolean',
            'is_pinned' => 'sometimes|boolean',
            'tags' => 'nullable|array',
            'regenerate_invite_code' => 'sometimes|boolean',
            'invite_code' => 'sometimes|nullable|string|min:4|max:12'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = Auth::user();

        // 1. Fetch discussion and verify Admin
        $discussion = DB::table('discussions')->where('id', $id)->first();
        if (!$discussion || $discussion->admin_id != $user->id) {
            return response()->json(['success' => false, 'message' => 'Not authorized'], 403);
        }

        try {
            $updateData = ['updated_at' => now()];

            if ($request->has('title')) $updateData['title'] = $request->input('title');
            if ($request->has('description')) $updateData['description'] = $request->input('description');
            if ($request->has('privacy')) $updateData['privacy'] = $request->input('privacy');
            if ($request->has('is_archived')) $updateData['is_archived'] = $request->input('is_archived');
            if ($request->has('is_pinned')) $updateData['is_pinned'] = $request->input('is_pinned');

            if ($request->has('tags')) {
                $updateData['tags'] = json_encode($request->input('tags'));
            }

            // 2. Logic for regenerating the code
            if ($request->input('regenerate_invite_code')) {
                $newCode = trim($request->input('invite_code'));

                // Generate random if input was empty
                if (empty($newCode)) {
                    $newCode = Str::random(8);
                }

                // Check if code is already used by another chat
                $exists = DB::table('discussions')
                    ->where('invite_code', $newCode)
                    ->where('id', '!=', $id)
                    ->exists();

                if ($exists) {
                    return response()->json(['success' => false, 'message' => 'Code already taken'], 422);
                }

                $updateData['invite_code'] = $newCode;
            }

            DB::table('discussions')->where('id', $id)->update($updateData);

            return response()->json([
                'success' => true,
                'data' => ['invite_code' => $updateData['invite_code'] ?? $discussion->invite_code],
                'message' => 'Discussion updated'
            ]);
        } catch (\Exception $e) {
            Log::error('Update Discussion Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error'], 500);
        }
    }

    /**
     * Delete discussion
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();

        // Check if user is admin of the discussion
        $isAdmin = DB::table('discussions')
            ->where('id', $id)
            ->where('admin_id', $user->id)
            ->exists();

        if (!$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Only discussion admin can delete'
            ], 403);
        }

        DB::beginTransaction();
        try {
            // Soft delete discussion
            DB::table('discussions')
                ->where('id', $id)
                ->update(['deleted_at' => now()]);

            // Archive all messages
            DB::table('messages')
                ->where('discussion_id', $id)
                ->update(['deleted_at' => now()]);

            // Remove all members
            DB::table('group_members')
                ->where('discussion_id', $id)
                ->update(['status' => 'left', 'left_at' => now()]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Discussion deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting discussion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete discussion'
            ], 500);
        }
    }

    /**
     * Join discussion by ID
     */
    public function joinDiscussion(Request $request, $id)
    {
        $user = Auth::user();
        try {
            $discussion = DB::table('discussions')
                ->where('id', $id)
                ->first();

            if (!$discussion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Discussion not found'
                ], 404);
            }

            // Check if already a member
            $isMember = DB::table('group_members')
                ->where('discussion_id', $id)
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->exists();

            if ($isMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already a member of this discussion'
                ], 400);
            }

            // Check if can join based on privacy
            if ($discussion->privacy === 'private' || $discussion->privacy === 'invite_only') {
                return response()->json([
                    'success' => false,
                    'message' => 'This discussion is private or invite-only'
                ], 403);
            }

            // Add user as member
            DB::table('group_members')->insert([
                'user_id' => $user->id,
                'discussion_id' => $id,
                'role' => 'member',
                'status' => 'active',
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Update member count
            DB::table('discussions')
                ->where('id', $id)
                ->update([
                    'member_count' => DB::raw('member_count + 1'),
                    'updated_at' => now()
                ]);

            // Create system message
            DB::table('messages')->insert([
                'discussion_id' => $id,
                'user_id' => $user->id,
                'content' => $user->name . ' joined the discussion.',
                'message_type' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Send notification to admin
            DB::table('notifications')->insert([
                'user_id' => $discussion->admin_id,
                'type' => 'discussion_join',
                'title' => 'New Member Joined',
                'message' => $user->name . ' joined your discussion: ' . $discussion->title,
                'sender_id' => $user->id,
                'discussion_id' => $id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Joined discussion successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error joining discussion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to join discussion'
            ], 500);
        }
    }

    /**
     * Leave discussion
     */
    public function leaveDiscussion(Request $request, $id)
    {
        $user = Auth::user();
        try {
            // Check if user is a member
            $membership = DB::table('group_members')
                ->where('discussion_id', $id)
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            if (!$membership) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not a member of this discussion'
                ], 400);
            }

            // Check if user is admin
            $isAdmin = DB::table('discussions')
                ->where('id', $id)
                ->where('admin_id', $user->id)
                ->exists();

            if ($isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin cannot leave discussion. Transfer admin role first or delete discussion.'
                ], 400);
            }

            // Update membership status
            DB::table('group_members')
                ->where('discussion_id', $id)
                ->where('user_id', $user->id)
                ->update([
                    'status' => 'left',
                    'left_at' => now(),
                    'updated_at' => now()
                ]);

            // Update member count
            DB::table('discussions')
                ->where('id', $id)
                ->update([
                    'member_count' => DB::raw('GREATEST(member_count - 1, 0)'),
                    'updated_at' => now()
                ]);

            // Create system message
            DB::table('messages')->insert([
                'discussion_id' => $id,
                'user_id' => $user->id,
                'content' => $user->name . ' left the discussion.',
                'message_type' => 'system',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Left discussion successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error leaving discussion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to leave discussion'
            ], 500);
        }
    }

    /**
     * Get discussion stats
     */
    public function getStats()
    {
        $user = Auth::user();
        try {
            $totalDiscussions = DB::table('discussions')
                ->where('admin_id', $user->id)
                ->whereNull('deleted_at')
                ->count();

            $activeDiscussions = DB::table('discussions as d')
                ->join('group_members as gm', function ($join) use ($user) {
                    $join->on('d.id', '=', 'gm.discussion_id')
                        ->where('gm.user_id', $user->id)
                        ->where('gm.status', 'active');
                })
                ->whereNull('d.deleted_at')
                ->where('d.is_archived', false)
                ->count();

            $totalMessages = DB::table('messages as m')
                ->join('group_members as gm', function ($join) use ($user) {
                    $join->on('m.discussion_id', '=', 'gm.discussion_id')
                        ->where('gm.user_id', $user->id)
                        ->where('gm.status', 'active');
                })
                ->whereNull('m.deleted_at')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_discussions' => $totalDiscussions,
                    'active_discussions' => $activeDiscussions,
                    'total_messages' => $totalMessages,
                ],
                'message' => 'Discussion stats retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting discussion stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get discussion stats'
            ], 500);
        }
    }

    /**
     * Helper function to check if user can access discussion
     */
    private function canAccessDiscussion($userId, $discussionId, $privacy)
    {
        // Public discussions are accessible to everyone
        if ($privacy === 'public') {
            return true;
        }

        // Check if user is admin
        $isAdmin = DB::table('discussions')
            ->where('id', $discussionId)
            ->where('admin_id', $userId)
            ->exists();

        if ($isAdmin) {
            return true;
        }

        // Check if user is a member
        $isMember = DB::table('group_members')
            ->where('discussion_id', $discussionId)
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->exists();

        return $isMember;
    }

    /**
     * Generate unique invite code
     */
    private function generateInviteCode()
    {
        do {
            $code = Str::random(8); // 8-character alphanumeric code
            $exists = DB::table('discussions')->where('invite_code', $code)->exists();
        } while ($exists);

        return $code;
    }
}
