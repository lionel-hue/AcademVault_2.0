<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('documents', function (Blueprint ) {
            ->id();
            ->string('title');
            ->text('description')->nullable();
            ->enum('type', ['pdf', 'video', 'article_link']);
            ->string('file_path')->nullable();
            ->string('url')->nullable();
            ->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            ->boolean('is_downloadable')->default(true);
            ->string('signature')->nullable(); 
            ->integer('view_count')->default(0);
            ->timestamps();
            ->softDeletes();
        });
    }
    public function down(): void { Schema::dropIfExists('documents'); }
};
