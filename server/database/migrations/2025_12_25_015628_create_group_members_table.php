// database/migrations/xxxx_create_group_members_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('discussion_id')->constrained('discussions')->onDelete('cascade');
            $table->enum('role', ['admin', 'moderator', 'member', 'guest'])->default('member');
            $table->enum('status', ['active', 'muted', 'banned', 'left'])->default('active');
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('left_at')->nullable();
            $table->timestamp('muted_until')->nullable();
            $table->integer('message_count')->default(0);
            $table->json('permissions')->nullable();
            $table->json('notification_settings')->nullable();
            $table->string('nickname')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'discussion_id']);
            $table->index(['discussion_id', 'role']);
            $table->index(['discussion_id', 'status']);
        });

        // Table pour les invitations aux groupes
        Schema::create('group_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discussion_id')->constrained('discussions')->onDelete('cascade');
            $table->foreignId('inviter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('invitee_id')->constrained('users')->onDelete('cascade');
            $table->string('email')->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected', 'expired'])->default('pending');
            $table->string('token');
            $table->text('message')->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
            
            $table->unique(['discussion_id', 'invitee_id', 'status']);
            $table->index('token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_invitations');
        Schema::dropIfExists('group_members');
    }
};