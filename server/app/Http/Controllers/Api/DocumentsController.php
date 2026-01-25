<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DocumentsController extends Controller
{
    /**
     * Récupère tous les documents de l'utilisateur
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        try {
            $query = Document::where('user_id', $user->id);

            // Filtrage par type
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            // Filtrage par catégorie
            if ($request->has('category_id')) {
                $query->whereHas('categories', function ($q) use ($request) {
                    $q->where('category_id', $request->category_id);
                });
            }

            // Recherche textuelle
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%")
                        ->orWhere('author', 'LIKE', "%{$search}%");
                });
            }

            // Tri
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 20);
            $documents = $query->paginate($perPage);

            // Ajoute des informations supplémentaires
            $documents->getCollection()->transform(function ($document) {
                $document->formatted_file_size = $document->getFormattedFileSize();
                $document->icon = $document->getIcon();
                $document->color = $document->getColor();
                $document->download_url = $document->getDownloadUrl();
                return $document;
            });

            return response()->json([
                'success' => true,
                'data' => $documents,
                'message' => 'Documents retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching documents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère un document spécifique
     */
    public function show($id)
    {
        $user = Auth::user();

        try {
            $document = Document::where('user_id', $user->id)->find($id);

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found or access denied'
                ], 404);
            }

            // Incrémente le compteur de vues
            $document->incrementViewCount();

            // Charge les relations
            $document->load(['categories', 'tags']);

            // Formate les données supplémentaires
            $document->formatted_file_size = $document->getFormattedFileSize();
            $document->icon = $document->getIcon();
            $document->color = $document->getColor();
            $document->download_url = $document->getDownloadUrl();

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch document'
            ], 500);
        }
    }

    /**
     * Crée un nouveau document
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|in:pdf,video,article_link,website,image,presentation',
            'url' => 'nullable|url',
            'description' => 'nullable|string',
            'author' => 'nullable|string|max:255',
            'file' => 'nullable|file|max:10240', // 10MB max
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'source_metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $documentData = $request->only([
                'title',
                'type',
                'url',
                'description',
                'author',
                'publication_year',
                'publisher',
                'isbn',
                'doi',
                'page_count',
                'duration',
                'thumbnail',
                'license',
                'is_public',
                'source_metadata'
            ]);

            $documentData['user_id'] = $user->id;

            // Gestion du fichier uploadé
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
                    . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('documents/' . $user->id, $filename, 'public');

                $documentData['file_path'] = $path;
                $documentData['file_size'] = $file->getSize();
                $documentData['file_type'] = $file->getMimeType();

                // Détermine le type si c'est un fichier
                if (empty($documentData['type'])) {
                    $documentData['type'] = $this->getTypeFromMime($file->getMimeType());
                }
            }

            // Crée le document
            $document = Document::create($documentData);

            // Attache les catégories
            if ($request->has('categories')) {
                $document->categories()->sync($request->categories);
            }

            // Crée un enregistrement d'historique
            DB::table('history')->insert([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'action' => 'created',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            // Formate la réponse
            $document->formatted_file_size = $document->getFormattedFileSize();
            $document->icon = $document->getIcon();
            $document->color = $document->getColor();

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating document: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save a search result as a document
     * This handles videos, PDFs, and articles from search results
     */
    public function saveFromSearch(Request $request)
    {
        $user = Auth::user();
        
        // Step 1: Validate incoming data
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:video,pdf,article',
            'data' => 'required|array',
            'categories' => 'nullable|array',
            'categories.*' => 'nullable|exists:categories,id',
        ]);

        if ($validator->fails()) {
            Log::error('❌ Validation failed', [
                'errors' => $validator->errors()->toArray(),
                'request' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        
        try {
            $type = $request->input('type');
            $data = $request->input('data');
            
            // Step 2: Map search data to document structure
            $documentData = $this->mapSearchDataToDocument($type, $data);
            $documentData['user_id'] = $user->id;
            
            // Step 3: Create the document
            $document = Document::create($documentData);
            
            // Step 4: Attach categories if provided
            if ($request->has('categories') && !empty($request->categories)) {
                $validCategories = array_filter($request->categories);
                if (!empty($validCategories)) {
                    $document->categories()->sync($validCategories);
                }
            }
            
            // Step 5: Create history record
            DB::table('history')->insert([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'action' => 'created',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            DB::commit();
            
            // Step 6: Format response
            $document->formatted_file_size = $document->getFormattedFileSize();
            $document->icon = $document->getIcon();
            $document->color = $document->getColor();
            
            Log::info('✅ Document saved from search', [
                'document_id' => $document->id,
                'type' => $type,
                'title' => $document->title
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document saved successfully'
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Error saving document from search', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to save document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Met à jour un document
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $document = Document::where('user_id', $user->id)->find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found or access denied'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'author' => 'nullable|string|max:255',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'is_public' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->only([
                'title',
                'description',
                'author',
                'publication_year',
                'publisher',
                'isbn',
                'doi',
                'is_public'
            ]);

            $document->update($updateData);

            // Met à jour les catégories
            if ($request->has('categories')) {
                $document->categories()->sync($request->categories);
            }

            // Historique de mise à jour
            DB::table('history')->insert([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'action' => 'updated',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update document'
            ], 500);
        }
    }

    /**
     * Supprime un document
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $document = Document::where('user_id', $user->id)->find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found or access denied'
            ], 404);
        }

        try {
            // Supprime le fichier physique s'il existe
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document'
            ], 500);
        }
    }

    /**
     * Télécharge un document
     */
    public function download($id)
    {
        $user = Auth::user();
        $document = Document::where('user_id', $user->id)->find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found or access denied'
            ], 404);
        }

        try {
            // Incrémente le compteur de téléchargements
            $document->incrementDownloadCount();

            // Historique de téléchargement
            DB::table('history')->insert([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'action' => 'downloaded',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Retourne l'URL de téléchargement
            return response()->json([
                'success' => true,
                'data' => [
                    'download_url' => $document->getDownloadUrl(),
                    'filename' => $document->title . '.' . pathinfo($document->file_path, PATHINFO_EXTENSION)
                ],
                'message' => 'Download ready'
            ]);
        } catch (\Exception $e) {
            Log::error('Error downloading document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to prepare download'
            ], 500);
        }
    }

    /**
     * Récupère les statistiques des documents
     */
    public function stats()
    {
        $user = Auth::user();

        try {
            $stats = DB::table('documents')
                ->where('user_id', $user->id)
                ->selectRaw('COUNT(*) as total')
                ->selectRaw('SUM(CASE WHEN type = "pdf" THEN 1 ELSE 0 END) as pdf_count')
                ->selectRaw('SUM(CASE WHEN type = "video" THEN 1 ELSE 0 END) as video_count')
                ->selectRaw('SUM(CASE WHEN type = "article_link" THEN 1 ELSE 0 END) as article_count')
                ->selectRaw('SUM(view_count) as total_views')
                ->selectRaw('SUM(download_count) as total_downloads')
                ->first();

            // Calcul de l'espace utilisé
            $storageUsed = DB::table('documents')
                ->where('user_id', $user->id)
                ->whereNotNull('file_size')
                ->sum('file_size');

            $storageUsed = $this->formatBytes($storageUsed);

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $stats->total ?? 0,
                    'by_type' => [
                        'pdf' => $stats->pdf_count ?? 0,
                        'video' => $stats->video_count ?? 0,
                        'article' => $stats->article_count ?? 0,
                    ],
                    'views' => $stats->total_views ?? 0,
                    'downloads' => $stats->total_downloads ?? 0,
                    'storage_used' => $storageUsed,
                ],
                'message' => 'Document statistics retrieved'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching document stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    /**
     * Attach categories to a document
     */
    public function attachCategories(Request $request, $id)
    {
        $user = Auth::user();
        $document = Document::where('user_id', $user->id)->find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found or access denied'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'categories' => 'required|array',
            'categories.*' => 'exists:categories,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $document->categories()->sync($request->categories);

        return response()->json([
            'success' => true,
            'message' => 'Categories attached successfully'
        ]);
    }

    /**
     * Detach a category from a document
     */
    public function detachCategory($id, $categoryId)
    {
        $user = Auth::user();
        $document = Document::where('user_id', $user->id)->find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found or access denied'
            ], 404);
        }

        $document->categories()->detach($categoryId);

        return response()->json([
            'success' => true,
            'message' => 'Category detached successfully'
        ]);
    }

    /**
     * Map search result data to document structure
     */
    private function mapSearchDataToDocument($type, $data)
    {
        $mapping = [
            'video' => [
                'type' => 'video',
                'title' => $data['title'] ?? 'Untitled Video',
                'description' => $data['description'] ?? null,
                'author' => $data['channel'] ?? null,
                'url' => $data['url'] ?? null,
                'thumbnail' => $data['thumbnail'] ?? null,
                'duration' => $data['duration'] ?? null,
                'source_metadata' => [
                    'source' => $data['source'] ?? 'youtube',
                    'video_id' => $data['id'] ?? null,
                    'views' => $data['views'] ?? null,
                    'published_at' => $data['published_at'] ?? null,
                    'embed_url' => $data['embed_url'] ?? null,
                    'is_real' => $data['is_real'] ?? false,
                ]
            ],
            'pdf' => [
                'type' => 'pdf',
                'title' => $data['title'] ?? 'Untitled PDF',
                'description' => $data['description'] ?? $data['abstract'] ?? null,
                'author' => !empty($data['authors']) 
                    ? (is_array($data['authors']) ? implode(', ', array_slice($data['authors'], 0, 3)) : $data['authors'])
                    : null,
                'url' => $data['pdf_url'] ?? $data['url'] ?? null,
                'page_count' => $data['page_count'] ?? null,
                'publication_year' => isset($data['published_at']) 
                    ? (int)date('Y', strtotime($data['published_at'])) 
                    : null,
                'source_metadata' => [
                    'source' => $data['source'] ?? 'arxiv',
                    'citation_count' => $data['citation_count'] ?? null,
                    'doi' => $data['doi'] ?? null,
                    'categories' => $data['categories'] ?? [],
                    'keywords' => $data['keywords'] ?? [],
                    'is_real' => $data['is_real'] ?? false,
                ]
            ],
            'article' => [
                'type' => 'article_link',
                'title' => $data['title'] ?? 'Untitled Article',
                'description' => $data['snippet'] ?? $data['description'] ?? null,
                'url' => $data['url'] ?? null,
                'author' => $data['author'] ?? null,
                'thumbnail' => $data['thumbnail'] ?? null,
                'source_metadata' => [
                    'source' => 'web',
                    'domain' => $data['domain'] ?? null,
                    'reading_time' => $data['reading_time'] ?? null,
                    'published_at' => $data['published_at'] ?? null,
                    'tags' => $data['tags'] ?? [],
                    'is_real' => $data['is_real'] ?? false,
                ]
            ],
        ];

        return $mapping[$type] ?? [];
    }

    /**
     * Get document type from MIME type
     */
    private function getTypeFromMime($mimeType)
    {
        $mimeMap = [
            'application/pdf' => 'pdf',
            'video/' => 'video',
            'image/' => 'image',
            'application/vnd.ms-powerpoint' => 'presentation',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'presentation',
        ];

        foreach ($mimeMap as $key => $type) {
            if (strpos($mimeType, $key) === 0) {
                return $type;
            }
        }

        return 'website';
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
}