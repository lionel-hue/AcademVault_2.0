<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // New migration: create_search_sessions_table.php
        Schema::create('search_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('query');
            $table->string('title')->nullable(); // Auto-generated title for the chat/session
            $table->json('results'); // Store all search results (videos, pdfs, articles)
            $table->json('filters')->nullable();
            $table->integer('total_results')->default(0);
            $table->timestamp('last_accessed_at')->useCurrent();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('query');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_sessions');
    }
};
