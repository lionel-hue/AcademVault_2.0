<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint ) {
            ->id();
            ->string('name');
            ->string('email')->unique();
            ->enum('type', ['teacher', 'student']);
            ->string('institution')->nullable();
            ->enum('role', ['admin', 'user'])->default('user');
            ->boolean('is_active')->default(false);
            ->timestamp('email_verified_at')->nullable();
            ->string('password');
            ->string('profile_image')->nullable();
            ->text('bio')->nullable();
            ->string('phone')->nullable();
            ->date('registration_date');
            ->rememberToken();
            ->timestamps();
            ->softDeletes();
        });
    }
    public function down(): void { Schema::dropIfExists('users'); }
};
