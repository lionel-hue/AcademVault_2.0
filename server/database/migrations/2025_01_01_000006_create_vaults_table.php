<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('vaults', function (Blueprint ) {
            ->id();
            ->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            ->string('title');
            ->text('description')->nullable();
            ->string('invite_code', 8)->unique();
            ->json('settings')->nullable();
            ->timestamps();
            ->softDeletes();
        });

        Schema::create('vault_members', function (Blueprint ) {
            ->id();
            ->foreignId('vault_id')->constrained('vaults')->onDelete('cascade');
            ->foreignId('user_id')->constrained('users')->onDelete('cascade');
            ->enum('role', ['admin', 'member'])->default('member');
            ->timestamp('joined_at')->useCurrent();
            ->enum('status', ['active', 'banned', 'left'])->default('active');
        });
    }
    public function down(): void {
        Schema::dropIfExists('vault_members');
        Schema::dropIfExists('vaults');
    }
};
