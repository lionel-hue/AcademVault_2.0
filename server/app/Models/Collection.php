<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Collection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'user_id',
        'visibility',
        'cover_image',
        'color_scheme',
        'document_count',
        'follower_count',
        'is_featured',
        'is_curated',
        'settings'
    ];

    protected $casts = [
        'settings' => 'array',
        'is_featured' => 'boolean',
        'is_curated' => 'boolean',
        'document_count' => 'integer',
        'follower_count' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents()
    {
        return $this->belongsToMany(Document::class, 'collection_document')
                    ->withPivot(['notes', 'order'])
                    ->withTimestamps();
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'collection_category');
    }
}