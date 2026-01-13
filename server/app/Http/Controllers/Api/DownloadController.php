<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DownloadController extends Controller
{
    private $youtubeApiKey;

    public function __construct()
    {
        $this->youtubeApiKey = env('YOUTUBE_API_KEY', 'YOUR_YOUTUBE_API_KEY');
    }

    /**
     * Get YouTube video information and download options
     */
    public function getVideoInfo(Request $request)
    {
        $request->validate([
            'video_id' => 'required|string',
            'quality' => 'sometimes|in:low,medium,high,hd'
        ]);

        $videoId = $request->input('video_id');
        $quality = $request->input('quality', 'medium');

        try {
            // Get video details from YouTube API
            $videoInfo = $this->fetchYouTubeVideoInfo($videoId);

            if (!$videoInfo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Video not found or API key missing'
                ], 404);
            }

            // Generate download links using external service (educational use only)
            $downloadOptions = $this->generateDownloadOptions($videoId, $quality, $videoInfo);

            // Log the download request
            $user = Auth::user();
            Log::info('Video download requested', [
                'user_id' => $user->id,
                'video_id' => $videoId,
                'video_title' => $videoInfo['title'],
                'quality' => $quality
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'video_info' => $videoInfo,
                    'download_options' => $downloadOptions,
                    'formats' => $this->getAvailableFormats($quality),
                    'disclaimer' => 'This service is for educational purposes only. Please ensure you have the right to download this content.',
                    'copyright_notice' => 'Respect copyright laws. Only download content you have permission to use.'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Video info error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch video information',
                'educational_note' => 'For academic research, consider using YouTube\'s built-in download feature or screen recording tools.'
            ], 500);
        }
    }

    /**
     * Generate download links using external services (educational/backup)
     */
    private function generateDownloadOptions($videoId, $quality, $videoInfo)
    {
        $baseUrl = 'https://www.youtube.com/watch?v=' . $videoId;

        // These are educational/research tools - not direct download endpoints
        $services = [
            'educational_tools' => [
                [
                    'name' => 'YouTube Studio (Official)',
                    'url' => 'https://studio.youtube.com/',
                    'description' => 'Official YouTube content management',
                    'type' => 'official'
                ],
                [
                    'name' => 'Internet Archive',
                    'url' => 'https://archive.org/',
                    'description' => 'Public domain and archived content',
                    'type' => 'archive'
                ]
            ],
            'research_methods' => [
                'screen_recording' => 'Use screen recording software for research purposes',
                'browser_extensions' => 'Educational browser extensions for content preservation',
                'citation_tools' => 'Use citation tools to reference videos properly'
            ]
        ];

        // For development/testing, provide mock download links
        if (app()->environment('local') || !$this->youtubeApiKey) {
            return [
                'direct_download' => null,
                'educational_alternatives' => $services['educational_tools'],
                'research_methods' => $services['research_methods'],
                'video_url' => $baseUrl,
                'embed_url' => 'https://www.youtube.com/embed/' . $videoId,
                'note' => 'In production with valid API key, direct download links would be generated here.'
            ];
        }

        // In production with API key, you could integrate with a download service
        // But for legal compliance, we'll only provide educational alternatives
        return [
            'direct_download' => null, // We don't provide direct downloads for legal reasons
            'educational_alternatives' => $services['educational_tools'],
            'research_methods' => $services['research_methods'],
            'video_url' => $baseUrl,
            'embed_url' => 'https://www.youtube.com/embed/' . $videoId,
            'legal_note' => 'Direct video downloading may violate YouTube Terms of Service. Use provided alternatives for educational purposes.'
        ];
    }

    /**
     * Fetch video info from YouTube API
     */
    private function fetchYouTubeVideoInfo($videoId)
    {
        if (!$this->youtubeApiKey || $this->youtubeApiKey === 'YOUR_YOUTUBE_API_KEY') {
            // Return mock data for development
            return [
                'id' => $videoId,
                'title' => 'Sample Educational Video',
                'description' => 'This is a sample video description for educational purposes.',
                'channel' => 'Educational Channel',
                'duration' => '10:30',
                'views' => '1000',
                'published_at' => now()->subDays(30)->toISOString(),
                'thumbnail' => 'https://img.youtube.com/vi/' . $videoId . '/maxresdefault.jpg',
                'is_educational' => true
            ];
        }

        try {
            $response = Http::timeout(10)->get('https://www.googleapis.com/youtube/v3/videos', [
                'part' => 'snippet,contentDetails,statistics',
                'id' => $videoId,
                'key' => $this->youtubeApiKey
            ]);
            /** @var \Illuminate\Http\Client\Response $response */
            if ($response->successful()) {
                $data = $response->json();
                $item = $data['items'][0] ?? null;

                if ($item) {
                    return [
                        'id' => $videoId,
                        'title' => $item['snippet']['title'] ?? 'Untitled Video',
                        'description' => $item['snippet']['description'] ?? '',
                        'channel' => $item['snippet']['channelTitle'] ?? 'Unknown Channel',
                        'duration' => $item['contentDetails']['duration'] ?? null,
                        'views' => $item['statistics']['viewCount'] ?? 0,
                        'published_at' => $item['snippet']['publishedAt'] ?? now()->toISOString(),
                        'thumbnail' => $item['snippet']['thumbnails']['high']['url'] ??
                            $item['snippet']['thumbnails']['default']['url'] ?? '',
                        'is_educational' => true
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error('YouTube API fetch error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Get available formats for educational purposes
     */
    private function getAvailableFormats($quality)
    {
        $formats = [
            'low' => [
                'resolution' => '360p',
                'bitrate' => '500kbps',
                'format' => 'MP4',
                'size' => '~50MB for 10min video',
                'suitable_for' => 'Mobile viewing, quick reference'
            ],
            'medium' => [
                'resolution' => '720p',
                'bitrate' => '1500kbps',
                'format' => 'MP4',
                'size' => '~150MB for 10min video',
                'suitable_for' => 'Standard research, presentations'
            ],
            'high' => [
                'resolution' => '1080p',
                'bitrate' => '3000kbps',
                'format' => 'MP4',
                'size' => '~300MB for 10min video',
                'suitable_for' => 'High-quality research, archival'
            ],
            'hd' => [
                'resolution' => '1440p/4K',
                'bitrate' => '8000kbps+',
                'format' => 'MP4',
                'size' => '~1GB+ for 10min video',
                'suitable_for' => 'Professional research, publication'
            ]
        ];

        return $formats[$quality] ?? $formats['medium'];
    }

    /**
     * Get educational download alternatives (for frontend display)
     */
    public function getEducationalAlternatives(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'alternatives' => [
                    [
                        'name' => 'OBS Studio',
                        'url' => 'https://obsproject.com/',
                        'description' => 'Free and open source screen recording software',
                        'type' => 'screen_recording',
                        'platform' => 'Windows, Mac, Linux'
                    ],
                    [
                        'name' => 'VLC Media Player',
                        'url' => 'https://www.videolan.org/vlc/',
                        'description' => 'Can save streams for offline viewing',
                        'type' => 'media_player',
                        'platform' => 'Cross-platform'
                    ],
                    [
                        'name' => 'Internet Archive',
                        'url' => 'https://archive.org/',
                        'description' => 'Digital library of free content',
                        'type' => 'archive',
                        'platform' => 'Web'
                    ],
                    [
                        'name' => 'Academic Torrents',
                        'url' => 'https://academictorrents.com/',
                        'description' => 'Distributed system for sharing research data',
                        'type' => 'research_data',
                        'platform' => 'Web'
                    ]
                ],
                'legal_considerations' => [
                    'Fair use for education and research',
                    'Proper citation required',
                    'Respect copyright and terms of service',
                    'Non-commercial use only'
                ]
            ]
        ]);
    }
}
