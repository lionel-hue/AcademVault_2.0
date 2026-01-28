<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'author',
        'publication_year',
        'publisher',
        'isbn',
        'doi',
        'url',
        'file_path',
        'file_size',
        'file_type',
        'page_count',
        'duration',
        'thumbnail',
        'view_count',
        'download_count',
        'rating',
        'is_public',
        'license',
        'metadata',
        'source_metadata',
        'generated_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'source_metadata' => 'array',
        'generated_at' => 'datetime',
        'is_public' => 'boolean',
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec les catégories
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'document_category')
            ->withTimestamps();
    }

    /**
     * Relation avec les collections
     */
    public function collections()
    {
        return $this->belongsToMany(Collection::class, 'collection_document')
            ->withTimestamps()
            ->withPivot(['notes', 'order']);
    }

    /**
     * Relation avec les tags
     */
    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    /**
     * Relation avec les bookmarks
     */
    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    /**
     * Relation avec l'historique
     */
    public function history()
    {
        return $this->hasMany(History::class);
    }

    /**
     * Incrémente le compteur de vues
     */
    public function incrementViewCount()
    {
        $this->increment('view_count');
        return $this;
    }

    /**
     * Incrémente le compteur de téléchargements
     */
    public function incrementDownloadCount()
    {
        $this->increment('download_count');
        return $this;
    }

    /**
     * Vérifie si le document appartient à l'utilisateur
     */
    public function belongsToUser($userId): bool
    {
        return $this->user_id == $userId;
    }

    /**
     * Obtient l'URL de téléchargement sécurisée
     */
    public function getDownloadUrl(): ?string
    {
        if (!$this->file_path) {
            return $this->url;
        }

        // Pour les fichiers stockés localement
        if (filter_var($this->file_path, FILTER_VALIDATE_URL)) {
            return $this->file_path;
        }

        return asset('storage/' . $this->file_path);
    }

    /**
     * Formate la taille du fichier
     */
    public function getFormattedFileSize(): string
    {
        if (!$this->file_size) {
            return 'N/A';
        }

        $bytes = (int) $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Obtient le type d'icône basé sur le type de document
     */
    public function getIcon(): string
    {
        return match($this->type) {
            'pdf' => 'fas fa-file-pdf',
            'video' => 'fas fa-video',
            'article_link', 'website' => 'fas fa-newspaper',
            'image' => 'fas fa-image',
            'presentation' => 'fas fa-presentation',
            default => 'fas fa-file',
        };
    }

    /**
     * Obtient la couleur basée sur le type de document
     */
    public function getColor(): string
    {
        return match($this->type) {
            'pdf' => 'text-red-400',
            'video' => 'text-blue-400',
            'article_link', 'website' => 'text-green-400',
            'image' => 'text-pink-400',
            'presentation' => 'text-purple-400',
            default => 'text-gray-400',
        };
    }
}