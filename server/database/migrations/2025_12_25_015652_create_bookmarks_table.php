// database/migrations/xxxx_create_bookmarks_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->string('color')->default('#F59E0B');
            $table->string('icon')->default('star');
            $table->string('folder')->nullable();
            $table->integer('order')->default(0);
            $table->text('notes')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_favorite')->default(false);
            $table->timestamp('last_accessed_at')->useCurrent();
            $table->integer('access_count')->default(1);
            $table->json('custom_fields')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['user_id', 'document_id']);
            $table->index(['user_id', 'folder']);
            $table->index(['user_id', 'is_favorite']);
        });

        // Table pour les dossiers de signets
        Schema::create('bookmark_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('color')->default('#6B7280');
            $table->string('icon')->default('folder');
            $table->integer('order')->default(0);
            $table->integer('bookmark_count')->default(0);
            $table->enum('visibility', ['private', 'shared'])->default('private');
            $table->json('shared_with')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookmark_folders');
        Schema::dropIfExists('bookmarks');
    }
};