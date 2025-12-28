// database/migrations/xxxx_create_search_history_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('query');
            $table->integer('results_count')->default(0);
            $table->string('source_type')->nullable(); // 'youtube', 'pdf', 'article', 'all'
            $table->json('filters')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
            $table->index('query');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_history');
    }
};