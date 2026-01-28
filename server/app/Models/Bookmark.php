<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bookmark extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'document_id',
        'color',
        'icon',
        'folder',
        'order',
        'notes',
        'tags',
        'is_favorite',
        'last_accessed_at',
        'access_count',
        'custom_fields'
    ];

    protected $casts = [
        'tags' => 'array',
        'custom_fields' => 'array',
        'is_favorite' => 'boolean',
        'last_accessed_at' => 'datetime',
        'access_count' => 'integer',
        'order' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}