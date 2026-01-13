<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('video_download_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('video_id');
            $table->string('video_title');
            $table->string('quality')->nullable();
            $table->string('purpose')->default('educational'); // educational, research, personal
            $table->string('status')->default('requested'); // requested, completed, failed
            $table->json('download_options')->nullable();
            $table->text('educational_purpose')->nullable();
            $table->boolean('is_compliant')->default(true);
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
            $table->index('video_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_download_logs');
    }
};