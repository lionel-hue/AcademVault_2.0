// database/migrations/xxxx_create_tags_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->string('name');
            $table->string('color')->default('#6B7280');
            $table->integer('usage_count')->default(1);
            $table->boolean('is_system')->default(false);
            $table->timestamps();
            
            $table->unique(['document_id', 'name']);
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};