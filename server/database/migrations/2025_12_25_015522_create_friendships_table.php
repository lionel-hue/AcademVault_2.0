// database/migrations/xxxx_create_friendships_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('friendships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('friend_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'rejected', 'blocked'])->default('pending');
            $table->string('relationship_type')->nullable(); // 'colleague', 'student', 'mentor', 'friend'
            $table->text('message')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('blocked_at')->nullable();
            $table->integer('interaction_score')->default(0);
            $table->json('shared_interests')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['user_id', 'friend_id']);
            $table->index(['user_id', 'status']);
            $table->index(['friend_id', 'status']);
        });

        // Table pour les paramètres de confidentialité des amis
        Schema::create('friendship_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('friend_id')->constrained('users')->onDelete('cascade');
            $table->boolean('can_see_documents')->default(false);
            $table->boolean('can_see_collections')->default(false);
            $table->boolean('can_see_friends')->default(false);
            $table->boolean('can_send_messages')->default(true);
            $table->boolean('can_share_documents')->default(true);
            $table->json('notification_settings')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'friend_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friendship_settings');
        Schema::dropIfExists('friendships');
    }
};