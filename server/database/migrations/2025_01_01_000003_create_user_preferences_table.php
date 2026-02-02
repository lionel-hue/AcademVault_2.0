<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_preferences', function (Blueprint ) {
            ->id();
            ->foreignId('user_id')->constrained('users')->onDelete('cascade');
            ->string('theme')->default('dark');
            ->string('language')->default('fr');
            ->json('notification_settings')->nullable();
            ->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('user_preferences'); }
};
