// database/migrations/xxxx_create_collections_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('visibility', ['private', 'public', 'shared'])->default('private');
            $table->string('cover_image')->nullable();
            $table->string('color_scheme')->default('blue');
            $table->integer('document_count')->default(0);
            $table->integer('follower_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_curated')->default(false);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'visibility']);
        });

        // Table pivot pour documents dans les collections
        Schema::create('collection_document', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_id')->constrained('collections')->onDelete('cascade');
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->integer('priority')->default(0);
            $table->integer('order')->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('added_at')->useCurrent();
            $table->json('custom_fields')->nullable();
            $table->timestamps();
            
            $table->unique(['collection_id', 'document_id']);
            $table->index(['collection_id', 'priority']);
            $table->index(['collection_id', 'order']);
        });

        // Table pour les catégories dans les collections
        Schema::create('collection_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_id')->constrained('collections')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->integer('document_count')->default(0);
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->unique(['collection_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_category');
        Schema::dropIfExists('collection_document');
        Schema::dropIfExists('collections');
    }
};