<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('messages', function (Blueprint ) {
            ->id();
            ->foreignId('vault_id')->constrained('vaults')->onDelete('cascade');
            ->foreignId('user_id')->constrained('users')->onDelete('cascade');
            ->text('content');
            ->string('message_type')->default('text');
            ->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('messages'); }
};
