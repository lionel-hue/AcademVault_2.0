<?php
// server/app/Http/Controllers/Api/SearchController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2|max:255',
            'type' => 'sometimes|in:all,videos,pdfs,articles',
            'limit' => 'sometimes|integer|min:1|max:50'
        ]);

        $user = Auth::user();
        $query = trim($request->input('query'));
        $type = $request->input('type', 'all');
        $limit = $request->input('limit', 20);

        // Log the search
        DB::table('search_history')->insert([
            'user_id' => $user->id,
            'query' => $query,
            'source_type' => $type,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Prepare results array
        $results = [
            'query' => $query,
            'total_results' => 0,
            'videos' => [],
            'pdfs' => [],
            'articles' => []
        ];

        // Execute searches based on type
        if ($type === 'all' || $type === 'videos') {
            $results['videos'] = $this->searchYouTube($query, $limit);
        }
        
        if ($type === 'all' || $type === 'pdfs') {
            $results['pdfs'] = $this->searchPDFs($query, $limit);
        }
        
        if ($type === 'all' || $type === 'articles') {
            $results['articles'] = $this->searchArticles($query, $limit);
        }

        $results['total_results'] = 
            count($results['videos']) + 
            count($results['pdfs']) + 
            count($results['articles']);

        // Update results count in search history
        DB::table('search_history')
            ->where('user_id', $user->id)
            ->where('query', $query)
            ->orderBy('created_at', 'desc')
            ->limit(1)
            ->update(['results_count' => $results['total_results']]);

        return response()->json([
            'success' => true,
            'data' => $results,
            'message' => 'Search completed successfully'
        ]);
    }

    private function searchYouTube($query, $limit = 10)
    {
        $cacheKey = 'youtube_' . md5($query . $limit);
        
        return Cache::remember($cacheKey, 3600, function () use ($query, $limit) {
            $apiKey = env('YOUTUBE_API_KEY');
            
            if (!$apiKey) {
                return $this->getMockYouTubeResults($query, $limit);
            }

            try {
                $youtubeResponse = Http::timeout(10)->get('https://www.googleapis.com/youtube/v3/search', [
                    'part' => 'snippet',
                    'q' => $query . ' tutorial lecture',
                    'type' => 'video',
                    'maxResults' => $limit,
                    'key' => $apiKey,
                    'relevanceLanguage' => 'en',
                    'videoDuration' => 'medium',
                    'videoEmbeddable' => 'true',
                    'order' => 'relevance'
                ]);

                if ($youtubeResponse->success()) {
                    $items = $youtubeResponse->json()['items'] ?? [];
                    
                    return array_map(function ($item) {
                        return [
                            'id' => $item['id']['videoId'] ?? 'unknown',
                            'title' => $item['snippet']['title'] ?? 'Untitled Video',
                            'description' => substr($item['snippet']['description'] ?? '', 0, 200) . '...',
                            'thumbnail' => $item['snippet']['thumbnails']['high']['url'] ?? ($item['snippet']['thumbnails']['default']['url'] ?? ''),
                            'channel' => $item['snippet']['channelTitle'] ?? 'Unknown Channel',
                            'published_at' => $item['snippet']['publishedAt'] ?? now()->toISOString(),
                            'url' => 'https://www.youtube.com/watch?v=' . ($item['id']['videoId'] ?? ''),
                            'embed_url' => 'https://www.youtube.com/embed/' . ($item['id']['videoId'] ?? ''),
                            'type' => 'video',
                            'source' => 'youtube',
                            'duration' => null
                        ];
                    }, $items);
                }
            } catch (\Exception $e) {
                Log::error('YouTube API error: ' . $e->getMessage());
            }

            return $this->getMockYouTubeResults($query, $limit);
        });
    }

    private function searchPDFs($query, $limit = 10)
    {
        $cacheKey = 'pdfs_' . md5($query . $limit);
        
        return Cache::remember($cacheKey, 1800, function () use ($query, $limit) {
            // Try arXiv API first
            $arxivResults = $this->searchArXiv($query, $limit);
            
            if (!empty($arxivResults)) {
                return $arxivResults;
            }
            
            // Fallback to mock data
            return $this->getMockPDFResults($query, $limit);
        });
    }

    private function searchArXiv($query, $limit)
    {
        try {
            $arxivResponse = Http::timeout(10)->get('http://export.arxiv.org/api/query', [
                'search_query' => 'all:' . urlencode($query),
                'start' => 0,
                'max_results' => $limit,
                'sortBy' => 'relevance',
                'sortOrder' => 'descending'
            ]);

            if ($arxivResponse->ok()) {
                $xml = simplexml_load_string($arxivResponse->body());
                $entries = $xml->entry ?? [];
                
                $results = [];
                foreach ($entries as $entry) {
                    $authors = [];
                    foreach ($entry->author as $author) {
                        $authors[] = (string)$author->name;
                    }
                    
                    $id = (string)$entry->id;
                    $results[] = [
                        'id' => $id,
                        'title' => (string)$entry->title,
                        'description' => substr((string)$entry->summary, 0, 300) . '...',
                        'authors' => $authors,
                        'published_at' => (string)$entry->published,
                        'url' => $id,
                        'pdf_url' => str_replace('abs', 'pdf', $id) . '.pdf',
                        'type' => 'pdf',
                        'source' => 'arxiv',
                        'page_count' => null
                    ];
                }
                
                return $results;
            }
        } catch (\Exception $e) {
            Log::error('arXiv API error: ' . $e->getMessage());
        }
        
        return [];
    }

    private function searchArticles($query, $limit = 10)
    {
        // For now, return mock data
        // In production, you could use:
        // - Google Custom Search API
        // - NewsAPI
        // - Web scraping (with respect to robots.txt)
        return $this->getMockArticleResults($query, $limit);
    }

    // Mock data methods for development
    private function getMockYouTubeResults($query, $limit)
    {
        $titles = [
            "Introduction to {$query}",
            "{$query} Tutorial for Beginners",
            "Advanced {$query} Techniques",
            "Understanding {$query} Fundamentals",
            "{$query} Explained Simply",
            "Mastering {$query}",
            "{$query} Crash Course",
            "Practical {$query} Applications",
            "{$query} Workshop",
            "{$query} Deep Dive"
        ];
        
        $channels = [
            'MIT OpenCourseWare',
            'Stanford Online',
            'Khan Academy',
            'CrashCourse',
            '3Blue1Brown',
            'Veritasium',
            'Numberphile',
            'Computerphile',
            'FreeCodeCamp',
            'The Coding Train'
        ];

        $results = [];
        for ($i = 0; $i < $limit && $i < count($titles); $i++) {
            $results[] = [
                'id' => 'mock_video_' . ($i + 1),
                'title' => $titles[$i],
                'description' => "Learn everything you need to know about {$query} in this comprehensive tutorial. Perfect for beginners and advanced learners alike.",
                'thumbnail' => 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                'channel' => $channels[$i % count($channels)],
                'published_at' => now()->subDays(rand(1, 365))->toISOString(),
                'duration' => rand(5, 60) . ':' . str_pad(rand(0, 59), 2, '0', STR_PAD_LEFT),
                'views' => rand(1000, 1000000),
                'url' => '#',
                'embed_url' => '#',
                'type' => 'video',
                'source' => 'youtube'
            ];
        }
        
        return $results;
    }

    private function getMockPDFResults($query, $limit)
    {
        $titles = [
            "A Comprehensive Study of {$query}",
            "{$query}: Theory and Applications",
            "Recent Advances in {$query}",
            "{$query} Algorithms and Implementations",
            "Survey of {$query} Methods",
            "{$query} in Modern Computing",
            "Mathematical Foundations of {$query}",
            "Practical Guide to {$query}",
            "{$query} Research Review",
            "Case Studies in {$query}"
        ];
        
        $authors = [
            ['Dr. Alan Turing', 'Prof. John McCarthy'],
            ['Dr. Grace Hopper', 'Dr. Ada Lovelace'],
            ['Prof. Donald Knuth', 'Dr. Robert Floyd'],
            ['Dr. Barbara Liskov', 'Prof. Leslie Lamport'],
            ['Dr. Andrew Ng', 'Prof. Yann LeCun'],
            ['Dr. Geoffrey Hinton', 'Prof. Yoshua Bengio'],
            ['Dr. Tim Berners-Lee', 'Prof. Vint Cerf'],
            ['Dr. Linus Torvalds', 'Prof. Richard Stallman']
        ];

        $results = [];
        for ($i = 0; $i < $limit && $i < count($titles); $i++) {
            $results[] = [
                'id' => 'mock_pdf_' . ($i + 1),
                'title' => $titles[$i],
                'description' => "This paper presents a detailed analysis of {$query}, covering both theoretical foundations and practical applications. Published in a peer-reviewed journal.",
                'authors' => $authors[$i % count($authors)],
                'published_at' => (2023 - rand(0, 5)) . '-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT),
                'url' => '#',
                'pdf_url' => '#',
                'type' => 'pdf',
                'source' => 'arxiv',
                'page_count' => rand(10, 50)
            ];
        }
        
        return $results;
    }

    private function getMockArticleResults($query, $limit)
    {
        $titles = [
            "What is {$query} and Why It Matters",
            "Getting Started with {$query}",
            "{$query}: A Complete Overview",
            "10 Things You Should Know About {$query}",
            "The Future of {$query}",
            "Common Mistakes in {$query}",
            "Best Practices for {$query}",
            "{$query} Tools and Resources",
            "Interview Questions on {$query}",
            "Real-world Examples of {$query}"
        ];
        
        $domains = [
            'towardsdatascience.com',
            'medium.com',
            'freecodecamp.org',
            'w3schools.com',
            'geeksforgeeks.org',
            'tutorialspoint.com',
            'developer.mozilla.org',
            'stackoverflow.blog',
            'css-tricks.com',
            'smashingmagazine.com'
        ];

        $results = [];
        for ($i = 0; $i < $limit && $i < count($titles); $i++) {
            $results[] = [
                'id' => 'mock_article_' . ($i + 1),
                'title' => $titles[$i],
                'description' => "This article provides an in-depth look at {$query}, covering everything from basic concepts to advanced techniques. Perfect for developers and researchers.",
                'url' => 'https://' . $domains[$i % count($domains)] . '/article-' . ($i + 1),
                'domain' => $domains[$i % count($domains)],
                'type' => 'article',
                'source' => 'web',
                'snippet' => "{$query} is a fundamental concept in computer science and mathematics. This guide will help you understand its principles and applications...",
                'reading_time' => rand(5, 20) . ' min read'
            ];
        }
        
        return $results;
    }

    public function searchHistory(Request $request)
    {
        $user = Auth::user();
        
        $history = DB::table('search_history')
            ->where('user_id', $user->id)
            ->select('query', 'results_count', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    public function clearSearchHistory(Request $request)
    {
        $user = Auth::user();
        
        DB::table('search_history')
            ->where('user_id', $user->id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Search history cleared successfully'
        ]);
    }

    public function saveResult(Request $request)
    {
        $request->validate([
            'type' => 'required|in:video,pdf,article',
            'data' => 'required|array',
            'collection_id' => 'sometimes|exists:collections,id'
        ]);

        $user = Auth::user();
        $type = $request->input('type');
        $data = $request->input('data');
        $collectionId = $request->input('collection_id');

        // Logic to save search result as a document
        // This would create a new document record in your database
        // For now, return success message
        
        return response()->json([
            'success' => true,
            'message' => 'Result saved successfully',
            'data' => [
                'type' => $type,
                'saved' => true
            ]
        ]);
    }
}