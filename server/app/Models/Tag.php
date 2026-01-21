<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'name',
        'color',
        'usage_count',
        'is_system'
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'usage_count' => 'integer'
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}