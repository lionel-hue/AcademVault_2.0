<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('email_verifications', function (Blueprint ) {
            ->id();
            ->string('email')->index();
            ->string('code', 6);
            ->timestamp('expires_at');
            ->timestamp('verified_at')->nullable();
            ->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('email_verifications'); }
};
