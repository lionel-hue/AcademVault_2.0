<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SearchSessionsController extends Controller
{
    /**
     * Get all search sessions for the authenticated user
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        try {
            $sessions = DB::table('search_sessions')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Properly decode JSON fields
            $sessions = $sessions->map(function ($session) {
                // Check if results is already an array (might be if using json_decode in database driver)
                if (is_string($session->results)) {
                    $session->results = json_decode($session->results, true) ?? [];
                }

                if ($session->filters && is_string($session->filters)) {
                    $session->filters = json_decode($session->filters, true);
                }

                return $session;
            });

            return response()->json([
                'success' => true,
                'data' => $sessions,
                'message' => 'Search sessions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching search sessions: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch search sessions'
            ], 500);
        }
    }

    /**
     * Create a new search session
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|max:500',
            'results' => 'required|array',
            'filters' => 'nullable|array',
            'total_results' => 'nullable|integer|min:0',
            'title' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();

        // Generate a title if not provided
        $title = $request->title;
        if (!$title) {
            $query = $request->input('query');
            $title = 'Search: ' . substr($query, 0, 30);
            if (strlen($query) > 30) {
                $title .= '...';
            }
        }

        try {
            // Convert InputBag objects to arrays for JSON encoding
            $results = $request->input('results'); // This gets the array from the InputBag
            $filters = $request->input('filters'); // This gets the array from the InputBag

            Log::info('Saving search session:', [
                'user_id' => $user->id,
                'query' => $request->input('query'),
                'results_count' => is_array($results) ? count($results) : 0,
                'filters' => $filters
            ]);

            $sessionId = DB::table('search_sessions')->insertGetId([
                'user_id' => $user->id,
                'query' => $request->input('query'),
                'title' => $title,
                'results' => json_encode($results), // Encode the array to JSON
                'filters' => $filters ? json_encode($filters) : null, // Encode if exists
                'total_results' => $request->input('total_results', 0),
                'last_accessed_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            $session = DB::table('search_sessions')->find($sessionId);
            $session->results = json_decode($session->results, true);
            $session->filters = $session->filters ? json_decode($session->filters, true) : null;

            return response()->json([
                'success' => true,
                'data' => $session,
                'message' => 'Search session saved successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating search session: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save search session: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a search session (e.g., rename)
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'query' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();

        try {
            // Check if session exists and belongs to user
            $session = DB::table('search_sessions')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search session not found'
                ], 404);
            }

            $updateData = [
                'title' => $request->title,
                'updated_at' => Carbon::now()
            ];

            if ($request->has('query')) {
                $updateData['query'] = $request->query;
            }

            DB::table('search_sessions')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->update($updateData);

            $updatedSession = DB::table('search_sessions')->find($id);
            $updatedSession->results = json_decode($updatedSession->results, true);
            $updatedSession->filters = json_decode($updatedSession->filters, true);

            return response()->json([
                'success' => true,
                'data' => $updatedSession,
                'message' => 'Search session updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating search session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update search session'
            ], 500);
        }
    }

    /**
     * Delete a search session
     */
    public function destroy($id)
    {
        $user = Auth::user();

        try {
            // Check if session exists and belongs to user
            $session = DB::table('search_sessions')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search session not found'
                ], 404);
            }

            DB::table('search_sessions')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Search session deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting search session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete search session'
            ], 500);
        }
    }

    /**
     * Get a single search session by ID
     */
    public function show($id)
    {
        $user = Auth::user();

        try {
            $session = DB::table('search_sessions')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search session not found'
                ], 404);
            }

            $session->results = json_decode($session->results, true);
            $session->filters = json_decode($session->filters, true);

            return response()->json([
                'success' => true,
                'data' => $session,
                'message' => 'Search session retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching search session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch search session'
            ], 500);
        }
    }

    /**
     * Get recent search sessions (last 7 days)
     */
    public function recent(Request $request)
    {
        $user = Auth::user();
        $days = $request->get('days', 7);

        try {
            $sessions = DB::table('search_sessions')
                ->where('user_id', $user->id)
                ->where('created_at', '>=', Carbon::now()->subDays($days))
                ->orderBy('created_at', 'desc')
                ->get();

            $sessions = $sessions->map(function ($session) {
                $session->results = json_decode($session->results, true);
                $session->filters = json_decode($session->filters, true);
                return $session;
            });

            return response()->json([
                'success' => true,
                'data' => $sessions,
                'message' => 'Recent search sessions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching recent search sessions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent search sessions'
            ], 500);
        }
    }
}
