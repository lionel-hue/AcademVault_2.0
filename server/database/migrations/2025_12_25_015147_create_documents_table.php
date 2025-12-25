// database/migrations/xxxx_create_documents_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['pdf', 'video', 'article_link', 'website', 'image', 'presentation']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('author')->nullable();
            $table->year('publication_year')->nullable();
            $table->string('publisher')->nullable();
            $table->string('isbn')->nullable();
            $table->string('doi')->nullable();
            $table->string('url')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_size')->nullable();
            $table->string('file_type')->nullable();
            $table->integer('page_count')->nullable();
            $table->string('duration')->nullable(); // pour vidéos
            $table->string('thumbnail')->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('download_count')->default(0);
            $table->float('rating')->default(0);
            $table->boolean('is_public')->default(true);
            $table->enum('license', ['cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'copyright', 'public_domain'])->default('copyright');
            $table->json('metadata')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};