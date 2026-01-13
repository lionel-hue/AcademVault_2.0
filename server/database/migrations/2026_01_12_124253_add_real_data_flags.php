<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add is_real column to search_history if not exists
        if (!Schema::hasColumn('search_history', 'is_real')) {
            Schema::table('search_history', function (Blueprint $table) {
                $table->boolean('is_real')->default(false)->after('results_count');
                $table->json('api_metadata')->nullable()->after('filters');
            });
        }

        // Create bookmarks table for external resources if not exists
        if (!Schema::hasTable('external_bookmarks')) {
            Schema::create('external_bookmarks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('title');
                $table->string('url');
                $table->enum('type', ['video', 'pdf', 'article', 'website']);
                $table->json('data');
                $table->boolean('is_favorite')->default(false);
                $table->string('folder')->nullable();
                $table->text('notes')->nullable();
                $table->json('tags')->nullable();
                $table->timestamps();
                $table->softDeletes();
                
                $table->index(['user_id', 'type']);
                $table->index(['user_id', 'is_favorite']);
            });
        }

        // Add search statistics table
        Schema::create('search_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('query');
            $table->integer('results_count')->default(0);
            $table->integer('click_count')->default(0);
            $table->integer('save_count')->default(0);
            $table->json('source_breakdown')->nullable();
            $table->date('search_date');
            $table->timestamps();
            
            $table->index(['user_id', 'search_date']);
            $table->index('query');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_statistics');
        Schema::dropIfExists('external_bookmarks');
        
        Schema::table('search_history', function (Blueprint $table) {
            $table->dropColumn(['is_real', 'api_metadata']);
        });
    }
};