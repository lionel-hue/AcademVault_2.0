// database/migrations/xxxx_create_user_preferences_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('theme')->default('light'); // light, dark, auto
            $table->string('language')->default('fr');
            $table->string('timezone')->nullable();
            $table->json('notification_settings')->nullable();
            $table->json('privacy_settings')->nullable();
            $table->json('document_settings')->nullable();
            $table->json('ui_settings')->nullable();
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};