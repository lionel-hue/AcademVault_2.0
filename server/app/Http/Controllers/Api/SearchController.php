<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class SearchController extends Controller
{
    private $youtubeApiKey;
    private $googleSearchApiKey;
    private $googleSearchEngineId;
    private $arxivBaseUrl = 'http://export.arxiv.org/api/query';
    private $semanticScholarApi = 'https://api.semanticscholar.org/graph/v1';

    public function __construct()
    {
        $this->youtubeApiKey = env('YOUTUBE_API_KEY', 'YOUR_YOUTUBE_API_KEY');
        $this->googleSearchApiKey = env('GOOGLE_SEARCH_API_KEY', 'YOUR_GOOGLE_API_KEY');
        $this->googleSearchEngineId = env('GOOGLE_SEARCH_ENGINE_ID', 'YOUR_SEARCH_ENGINE_ID');
    }

    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2|max:255',
            'type' => 'sometimes|in:all,videos,pdfs,articles',
            'limit' => 'sometimes|integer|min:1|max:50',
            'page' => 'sometimes|integer|min:1'
        ]);

        $user = Auth::user();
        $query = trim($request->input('query'));
        $type = $request->input('type', 'all');
        $limit = $request->input('limit', 20);
        $page = $request->input('page', 1);
        $offset = ($page - 1) * $limit;

        // Log the search with more details
        DB::table('search_history')->insert([
            'user_id' => $user->id,
            'query' => $query,
            'source_type' => $type,
            'filters' => json_encode([
                'limit' => $limit,
                'page' => $page
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Prepare results array
        $results = [
            'query' => $query,
            'type' => $type,
            'page' => $page,
            'limit' => $limit,
            'total_results' => 0,
            'videos' => [],
            'pdfs' => [],
            'articles' => [],
            'sources' => []
        ];

        $promises = [];

        // Execute parallel searches based on type
        if ($type === 'all' || $type === 'videos') {
            $results['videos'] = $this->searchYouTube($query, $limit);
            $results['sources'][] = 'youtube';
        }

        if ($type === 'all' || $type === 'pdfs') {
            $pdfResults = $this->searchPDFs($query, $limit);
            $results['pdfs'] = $pdfResults['results'];
            $results['sources'] = array_merge($results['sources'], $pdfResults['sources']);
        }

        if ($type === 'all' || $type === 'articles') {
            $articleResults = $this->searchArticles($query, $limit);
            $results['articles'] = $articleResults['results'];
            $results['sources'] = array_merge($results['sources'], $articleResults['sources']);
        }

        // Calculate total results
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

        // Add metadata
        $results['metadata'] = [
            'timestamp' => now()->toISOString(),
            'sources_used' => array_unique($results['sources']),
            'has_real_data' => $this->hasRealApiKeys(),
            'cache_status' => 'mixed'
        ];

        return response()->json([
            'success' => true,
            'data' => $results,
            'message' => 'Search completed successfully'
        ]);
    }

    private function searchYouTube($query, $limit = 10)
    {
        $cacheKey = 'youtube_' . md5($query . $limit . '_v2');
        
        return Cache::remember($cacheKey, 1800, function () use ($query, $limit) {
            // Try real YouTube API first
            if ($this->youtubeApiKey && $this->youtubeApiKey !== 'YOUR_YOUTUBE_API_KEY') {
                try {
                    $client = new Client(['timeout' => 10]);
                    
                    $response = $client->get('https://www.googleapis.com/youtube/v3/search', [
                        'query' => [
                            'part' => 'snippet',
                            'q' => $query . ' tutorial education lecture',
                            'type' => 'video',
                            'maxResults' => min($limit, 50),
                            'key' => $this->youtubeApiKey,
                            'relevanceLanguage' => 'en',
                            'videoDuration' => 'medium',
                            'videoEmbeddable' => 'true',
                            'order' => 'relevance',
                            'safeSearch' => 'moderate'
                        ]
                    ]);

                    if ($response->getStatusCode() === 200) {
                        $data = json_decode($response->getBody(), true);
                        $items = $data['items'] ?? [];
                        
                        $videos = [];
                        foreach ($items as $item) {
                            // Get video details for duration
                            $videoId = $item['id']['videoId'] ?? null;
                            $duration = null;
                            
                            if ($videoId) {
                                $duration = $this->getYouTubeVideoDuration($videoId);
                            }
                            
                            $videos[] = [
                                'id' => $videoId,
                                'title' => $this->cleanTitle($item['snippet']['title'] ?? 'Untitled Video'),
                                'description' => substr($item['snippet']['description'] ?? '', 0, 200) . '...',
                                'thumbnail' => $item['snippet']['thumbnails']['high']['url'] ?? 
                                             ($item['snippet']['thumbnails']['medium']['url'] ?? 
                                              $item['snippet']['thumbnails']['default']['url'] ?? ''),
                                'channel' => $item['snippet']['channelTitle'] ?? 'Unknown Channel',
                                'published_at' => $item['snippet']['publishedAt'] ?? now()->toISOString(),
                                'duration' => $duration,
                                'views' => null, // Would require additional API call
                                'url' => 'https://www.youtube.com/watch?v=' . $videoId,
                                'embed_url' => 'https://www.youtube.com/embed/' . $videoId,
                                'type' => 'video',
                                'source' => 'youtube',
                                'is_real' => true
                            ];
                        }
                        
                        if (!empty($videos)) {
                            Log::info('YouTube API returned ' . count($videos) . ' results');
                            return $videos;
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('YouTube API error: ' . $e->getMessage());
                }
            }

            // Fallback to intelligent mock data
            return $this->getIntelligentYouTubeResults($query, $limit);
        });
    }

    private function getYouTubeVideoDuration($videoId)
    {
        try {
            $cacheKey = 'youtube_duration_' . $videoId;
            
            return Cache::remember($cacheKey, 86400, function () use ($videoId) {
                $client = new Client(['timeout' => 5]);
                
                $response = $client->get('https://www.googleapis.com/youtube/v3/videos', [
                    'query' => [
                        'part' => 'contentDetails',
                        'id' => $videoId,
                        'key' => $this->youtubeApiKey
                    ]
                ]);
                
                if ($response->getStatusCode() === 200) {
                    $data = json_decode($response->getBody(), true);
                    $duration = $data['items'][0]['contentDetails']['duration'] ?? null;
                    
                    // Convert ISO 8601 duration to readable format
                    if ($duration) {
                        return $this->formatYouTubeDuration($duration);
                    }
                }
                
                return null;
            });
        } catch (\Exception $e) {
            Log::error('YouTube duration error: ' . $e->getMessage());
            return null;
        }
    }

    private function searchPDFs($query, $limit = 10)
    {
        $cacheKey = 'pdfs_' . md5($query . $limit . '_v2');
        
        return Cache::remember($cacheKey, 3600, function () use ($query, $limit) {
            $results = [];
            $sources = [];
            
            // 1. Try arXiv API
            $arxivResults = $this->searchArXiv($query, ceil($limit / 2));
            if (!empty($arxivResults)) {
                $results = array_merge($results, $arxivResults);
                $sources[] = 'arxiv';
            }
            
            // 2. Try Semantic Scholar API
            $semanticResults = $this->searchSemanticScholar($query, ceil($limit / 2));
            if (!empty($semanticResults)) {
                $results = array_merge($results, $semanticResults);
                $sources[] = 'semantic_scholar';
            }
            
            // 3. If no real results, use intelligent mock data
            if (empty($results)) {
                $results = $this->getIntelligentPDFResults($query, $limit);
                $sources[] = 'mock';
            }
            
            // Limit results
            $results = array_slice($results, 0, $limit);
            
            return [
                'results' => $results,
                'sources' => $sources
            ];
        });
    }

    private function searchArXiv($query, $limit = 5)
    {
        try {
            $client = new Client(['timeout' => 15]);
            
            $response = $client->get($this->arxivBaseUrl, [
                'query' => [
                    'search_query' => 'all:' . urlencode($query),
                    'start' => 0,
                    'max_results' => $limit,
                    'sortBy' => 'relevance',
                    'sortOrder' => 'descending'
                ]
            ]);

            if ($response->getStatusCode() === 200) {
                $xml = simplexml_load_string($response->getBody());
                $entries = $xml->entry ?? [];
                
                $results = [];
                foreach ($entries as $entry) {
                    $authors = [];
                    foreach ($entry->author as $author) {
                        $authors[] = (string)$author->name;
                    }
                    
                    $id = (string)$entry->id;
                    $pdfUrl = str_replace('abs', 'pdf', $id) . '.pdf';
                    
                    // Get categories
                    $categories = [];
                    foreach ($entry->category as $category) {
                        $categories[] = (string)$category['term'];
                    }
                    
                    $results[] = [
                        'id' => $id,
                        'title' => $this->cleanTitle((string)$entry->title),
                        'description' => substr(strip_tags((string)$entry->summary), 0, 300) . '...',
                        'authors' => $authors,
                        'published_at' => (string)$entry->published,
                        'updated_at' => (string)$entry->updated,
                        'url' => $id,
                        'pdf_url' => $pdfUrl,
                        'categories' => array_slice($categories, 0, 3),
                        'type' => 'pdf',
                        'source' => 'arxiv',
                        'page_count' => null,
                        'citation_count' => null,
                        'is_real' => true
                    ];
                }
                
                Log::info('arXiv API returned ' . count($results) . ' results');
                return $results;
            }
        } catch (\Exception $e) {
            Log::error('arXiv API error: ' . $e->getMessage());
        }
        
        return [];
    }

    private function searchSemanticScholar($query, $limit = 5)
    {
        try {
            $client = new Client(['timeout' => 10]);
            
            $response = $client->get($this->semanticScholarApi . '/paper/search', [
                'query' => [
                    'query' => $query,
                    'limit' => $limit,
                    'fields' => 'title,authors,abstract,url,year,citationCount,openAccessPdf'
                ],
                'headers' => [
                    'User-Agent' => 'AcademVault/1.0 (contact@academvault.com)'
                ]
            ]);

            if ($response->getStatusCode() === 200) {
                $data = json_decode($response->getBody(), true);
                $papers = $data['data'] ?? [];
                
                $results = [];
                foreach ($papers as $paper) {
                    $authors = [];
                    foreach ($paper['authors'] ?? [] as $author) {
                        $authors[] = $author['name'] ?? 'Unknown';
                    }
                    
                    $results[] = [
                        'id' => $paper['paperId'] ?? uniqid('ss_'),
                        'title' => $this->cleanTitle($paper['title'] ?? 'Untitled Paper'),
                        'description' => substr($paper['abstract'] ?? '', 0, 300) . '...',
                        'authors' => $authors,
                        'published_at' => isset($paper['year']) ? $paper['year'] . '-01-01' : null,
                        'url' => $paper['url'] ?? '#',
                        'pdf_url' => $paper['openAccessPdf']['url'] ?? null,
                        'type' => 'pdf',
                        'source' => 'semantic_scholar',
                        'page_count' => null,
                        'citation_count' => $paper['citationCount'] ?? null,
                        'is_real' => true
                    ];
                }
                
                Log::info('Semantic Scholar API returned ' . count($results) . ' results');
                return $results;
            }
        } catch (\Exception $e) {
            Log::error('Semantic Scholar API error: ' . $e->getMessage());
        }
        
        return [];
    }

    private function searchArticles($query, $limit = 10)
    {
        $cacheKey = 'articles_' . md5($query . $limit . '_v2');
        
        return Cache::remember($cacheKey, 1800, function () use ($query, $limit) {
            $results = [];
            $sources = [];
            
            // Try Google Custom Search API if configured
            if ($this->googleSearchApiKey && $this->googleSearchEngineId && 
                $this->googleSearchApiKey !== 'YOUR_GOOGLE_API_KEY') {
                
                $googleResults = $this->searchGoogleCustomSearch($query, $limit);
                if (!empty($googleResults)) {
                    $results = $googleResults;
                    $sources[] = 'google_custom_search';
                }
            }
            
            // Fallback to intelligent mock data
            if (empty($results)) {
                $results = $this->getIntelligentArticleResults($query, $limit);
                $sources[] = 'mock';
            }
            
            return [
                'results' => $results,
                'sources' => $sources
            ];
        });
    }

    private function searchGoogleCustomSearch($query, $limit = 10)
    {
        try {
            $client = new Client(['timeout' => 10]);
            
            $response = $client->get('https://www.googleapis.com/customsearch/v1', [
                'query' => [
                    'key' => $this->googleSearchApiKey,
                    'cx' => $this->googleSearchEngineId,
                    'q' => $query . ' site:.edu OR site:.org OR site:.gov',
                    'num' => min($limit, 10),
                    'lr' => 'lang_en',
                    'gl' => 'us',
                    'safe' => 'active',
                    'dateRestrict' => 'y[2]' // Last 2 years
                ]
            ]);

            if ($response->getStatusCode() === 200) {
                $data = json_decode($response->getBody(), true);
                $items = $data['items'] ?? [];
                
                $results = [];
                foreach ($items as $item) {
                    $domain = parse_url($item['link'], PHP_URL_HOST);
                    $domain = str_replace('www.', '', $domain);
                    
                    $results[] = [
                        'id' => md5($item['link']),
                        'title' => $this->cleanTitle($item['title'] ?? 'Untitled Article'),
                        'description' => $item['snippet'] ?? '',
                        'url' => $item['link'],
                        'domain' => $domain,
                        'type' => 'article',
                        'source' => 'web',
                        'snippet' => $item['snippet'] ?? '',
                        'reading_time' => $this->estimateReadingTime($item['snippet'] ?? ''),
                        'is_real' => true,
                        'published_at' => $item['pagemap']['metatags'][0]['article:published_time'] ?? null,
                        'thumbnail' => $item['pagemap']['cse_image'][0]['src'] ?? null
                    ];
                }
                
                Log::info('Google Custom Search returned ' . count($results) . ' results');
                return $results;
            }
        } catch (\Exception $e) {
            Log::error('Google Custom Search error: ' . $e->getMessage());
        }
        
        return [];
    }

    // Intelligent mock data generators with better quality
    private function getIntelligentYouTubeResults($query, $limit)
    {
        $topics = $this->extractTopics($query);
        $primaryTopic = $topics[0] ?? 'topic';
        
        $channels = [
            'MIT OpenCourseWare', 'Stanford Online', 'Khan Academy', 'CrashCourse',
            '3Blue1Brown', 'Veritasium', 'Numberphile', 'Computerphile',
            'FreeCodeCamp', 'The Coding Train', 'Harvard University', 'Coursera',
            'edX', 'Google Developers', 'Microsoft Research', 'DeepLearningAI'
        ];
        
        $videoTemplates = [
            "Introduction to {$primaryTopic}",
            "{$primaryTopic} Explained Simply",
            "Complete {$primaryTopic} Tutorial",
            "Advanced {$primaryTopic} Techniques",
            "{$primaryTopic} Crash Course",
            "Understanding {$primaryTopic} Fundamentals",
            "Practical {$primaryTopic} Applications",
            "{$primaryTopic} Workshop for Beginners",
            "Mastering {$primaryTopic}",
            "{$primaryTopic} Deep Dive"
        ];
        
        $results = [];
        for ($i = 0; $i < $limit && $i < count($videoTemplates); $i++) {
            $duration = rand(5, 60);
            $views = rand(1000, 10000000);
            
            $results[] = [
                'id' => 'mock_yt_' . md5($query . $i),
                'title' => $videoTemplates[$i],
                'description' => "This comprehensive video covers everything you need to know about {$primaryTopic}. Perfect for students, researchers, and professionals interested in " . implode(', ', array_slice($topics, 0, 3)) . ".",
                'thumbnail' => 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                'channel' => $channels[$i % count($channels)],
                'published_at' => now()->subDays(rand(1, 730))->toISOString(),
                'duration' => $duration . ':' . str_pad(rand(0, 59), 2, '0', STR_PAD_LEFT),
                'views' => $views,
                'url' => 'https://www.youtube.com/watch?v=' . substr(md5($query . $i), 0, 11),
                'embed_url' => 'https://www.youtube.com/embed/' . substr(md5($query . $i), 0, 11),
                'type' => 'video',
                'source' => 'youtube',
                'is_real' => false,
                'tags' => $topics
            ];
        }
        
        return $results;
    }

    private function getIntelligentPDFResults($query, $limit)
    {
        $topics = $this->extractTopics($query);
        
        $universities = [
            'MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge',
            'UC Berkeley', 'Carnegie Mellon', 'ETH Zurich', 'University of Tokyo'
        ];
        
        $journals = [
            'Nature', 'Science', 'IEEE', 'ACM', 'Springer',
            'Elsevier', 'arXiv', 'PLOS One', 'PNAS'
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
        
        $paperTemplates = [
            "A Comprehensive Study of {topic}",
            "{topic}: Theory and Applications",
            "Recent Advances in {topic}",
            "{topic} Algorithms and Implementations",
            "Survey of {topic} Methods",
            "{topic} in Modern Computing",
            "Mathematical Foundations of {topic}",
            "Practical Guide to {topic}",
            "{topic} Research Review",
            "Case Studies in {topic}"
        ];
        
        $results = [];
        for ($i = 0; $i < $limit && $i < count($paperTemplates); $i++) {
            $template = $paperTemplates[$i];
            $topicIndex = $i % count($topics);
            $title = str_replace('{topic}', $topics[$topicIndex], $template);
            
            $results[] = [
                'id' => 'mock_pdf_' . md5($query . $i),
                'title' => $title,
                'description' => "This paper presents a detailed analysis of {$topics[$topicIndex]}, covering both theoretical foundations and practical applications. Published in " . $journals[$i % count($journals)] . " by researchers from " . $universities[$i % count($universities)] . ".",
                'authors' => $authors[$i % count($authors)],
                'published_at' => (2020 + ($i % 4)) . '-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT),
                'url' => 'https://arxiv.org/abs/' . substr(md5($query . $i), 0, 10),
                'pdf_url' => 'https://arxiv.org/pdf/' . substr(md5($query . $i), 0, 10) . '.pdf',
                'type' => 'pdf',
                'source' => 'arxiv',
                'page_count' => rand(10, 50),
                'citation_count' => rand(10, 500),
                'is_real' => false,
                'keywords' => array_slice($topics, 0, 5),
                'abstract' => "Abstract: This research investigates {$topics[$topicIndex]} through a multi-faceted approach. We propose novel methodologies and demonstrate their effectiveness through extensive experiments. Our findings contribute to the growing body of knowledge in this field."
            ];
        }
        
        return $results;
    }

    private function getIntelligentArticleResults($query, $limit)
    {
        $topics = $this->extractTopics($query);
        $primaryTopic = $topics[0] ?? 'topic';
        
        // Use actual working educational websites
        $domains = [
            'wikipedia.org',
            'wikimedia.org',
            'archive.org',
            'arxiv.org',
            'plos.org',
            'nih.gov',
            'science.gov',
            'researchgate.net',
            'academia.edu',
            'scholar.google.com',
            'eric.ed.gov',
            'doaj.org',
            'jstor.org',
            'springer.com',
            'ieee.org',
            'acm.org'
        ];
        
        $articleTemplates = [
            "What is {$primaryTopic} and Why It Matters",
            "Getting Started with {$primaryTopic}",
            "{$primaryTopic}: A Complete Overview",
            "10 Things You Should Know About {$primaryTopic}",
            "The Future of {$primaryTopic}",
            "Common Mistakes in {$primaryTopic}",
            "Best Practices for {$primaryTopic}",
            "{$primaryTopic} Tools and Resources",
            "Interview Questions on {$primaryTopic}",
            "Real-world Examples of {$primaryTopic}"
        ];
        
        $results = [];
        for ($i = 0; $i < $limit && $i < count($articleTemplates); $i++) {
            $domain = $domains[$i % count($domains)];
            
            // Create working URLs that won't 404
            if ($domain === 'wikipedia.org') {
                $url = 'https://en.wikipedia.org/wiki/' . urlencode(str_replace(' ', '_', $primaryTopic));
            } elseif ($domain === 'arxiv.org') {
                $url = 'https://arxiv.org/search/?query=' . urlencode($query) . '&searchtype=all';
            } elseif ($domain === 'archive.org') {
                $url = 'https://archive.org/search.php?query=' . urlencode($query);
            } elseif ($domain === 'scholar.google.com') {
                $url = 'https://scholar.google.com/scholar?q=' . urlencode($query);
            } else {
                // Create a search URL for the domain
                $url = 'https://' . $domain . '/search?q=' . urlencode($query);
            }
            
            $results[] = [
                'id' => 'article_' . md5($query . $i . $domain),
                'title' => $articleTemplates[$i],
                'description' => "This educational article provides an in-depth look at {$primaryTopic}, covering everything from basic concepts to advanced techniques. Perfect for students and researchers interested in " . implode(', ', array_slice($topics, 0, 3)) . ".",
                'url' => $url,
                'domain' => $domain,
                'type' => 'article',
                'source' => 'web',
                'snippet' => "{$primaryTopic} is a fundamental concept in computer science and mathematics. This guide will help you understand its principles and applications through practical examples and clear explanations...",
                'reading_time' => rand(5, 20) . ' min read',
                'is_real' => false,
                'published_at' => now()->subDays(rand(1, 365))->toISOString(),
                'author' => 'Academic Researcher',
                'tags' => array_slice($topics, 0, 5),
                'educational_level' => ['beginner', 'intermediate', 'advanced'][$i % 3],
                'citation_count' => rand(5, 500)
            ];
        }
        
        return $results;
    }

    // Helper methods
    private function extractTopics($query)
    {
        $commonTopics = [
            'machine learning', 'artificial intelligence', 'deep learning',
            'neural networks', 'data science', 'computer vision',
            'natural language processing', 'reinforcement learning',
            'quantum computing', 'cybersecurity', 'blockchain',
            'web development', 'mobile development', 'cloud computing',
            'big data', 'iot', 'robotics', 'algorithms', 'data structures'
        ];
        
        $foundTopics = [];
        foreach ($commonTopics as $topic) {
            if (stripos($query, $topic) !== false) {
                $foundTopics[] = $topic;
            }
        }
        
        if (empty($foundTopics)) {
            // Extract keywords from query
            $words = explode(' ', strtolower($query));
            $filteredWords = array_filter($words, function($word) {
                return strlen($word) > 3 && !in_array($word, ['what', 'how', 'why', 'when', 'where', 'which']);
            });
            
            $foundTopics = array_slice($filteredWords, 0, 3);
            if (empty($foundTopics)) {
                $foundTopics = [trim($query)];
            }
        }
        
        return array_unique($foundTopics);
    }

    private function cleanTitle($title)
    {
        // Remove extra whitespace and newlines
        $title = trim(preg_replace('/\s+/', ' ', $title));
        
        // Remove special characters but keep basic punctuation
        $title = preg_replace('/[^\x20-\x7E]/', '', $title);
        
        // Capitalize first letter of each word (for titles)
        $title = ucwords(strtolower($title));
        
        return $title;
    }

    private function formatYouTubeDuration($duration)
    {
        $interval = new \DateInterval($duration);
        $seconds = $interval->h * 3600 + $interval->i * 60 + $interval->s;
        
        if ($seconds < 60) {
            return $seconds . 's';
        } elseif ($seconds < 3600) {
            $minutes = floor($seconds / 60);
            $remainingSeconds = $seconds % 60;
            return $minutes . ':' . str_pad($remainingSeconds, 2, '0', STR_PAD_LEFT);
        } else {
            $hours = floor($seconds / 3600);
            $minutes = floor(($seconds % 3600) / 60);
            return $hours . ':' . str_pad($minutes, 2, '0', STR_PAD_LEFT);
        }
    }

    private function estimateReadingTime($text)
    {
        $wordCount = str_word_count(strip_tags($text));
        $minutes = ceil($wordCount / 200); // 200 words per minute
        return max(1, $minutes) . ' min read';
    }

    private function hasRealApiKeys()
    {
        return ($this->youtubeApiKey && $this->youtubeApiKey !== 'YOUR_YOUTUBE_API_KEY') ||
               ($this->googleSearchApiKey && $this->googleSearchApiKey !== 'YOUR_GOOGLE_API_KEY');
    }

    public function searchHistory(Request $request)
    {
        $user = Auth::user();
        $history = DB::table('search_history')
            ->where('user_id', $user->id)
            ->select('id', 'query', 'results_count', 'source_type', 'created_at')
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

        // Save to bookmarks or collections
        try {
            DB::table('bookmarks')->insert([
                'user_id' => $user->id,
                'document_id' => null, // For external resources
                'title' => $data['title'] ?? 'Untitled',
                'url' => $data['url'] ?? '#',
                'type' => $type,
                'data' => json_encode($data),
                'is_favorite' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Result saved successfully',
                'data' => [
                    'type' => $type,
                    'saved' => true,
                    'id' => DB::getPdo()->lastInsertId()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Save search result error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save result'
            ], 500);
        }
    }

    public function advancedSearch(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2',
            'filters' => 'sometimes|array',
            'date_range' => 'sometimes|array',
            'sources' => 'sometimes|array',
            'sort_by' => 'sometimes|in:relevance,date,popularity'
        ]);

        // This would implement more advanced search with filters
        // For now, we'll use the basic search
        return $this->search($request);
    }
}