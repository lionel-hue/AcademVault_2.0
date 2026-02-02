<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('categories', function (Blueprint ) {
            ->id();
            ->foreignId('user_id')->constrained('users')->onDelete('cascade');
            ->string('name');
            ->string('color')->nullable();
            ->string('icon')->nullable();
            ->timestamps();
        });

        Schema::create('tags', function (Blueprint ) {
            ->id();
            ->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            ->string('name');
            ->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('tags');
        Schema::dropIfExists('categories');
    }
};
