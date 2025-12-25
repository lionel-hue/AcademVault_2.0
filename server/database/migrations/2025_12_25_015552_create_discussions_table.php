// database/migrations/xxxx_create_discussions_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discussions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['document', 'general', 'group', 'project'])->default('general');
            $table->foreignId('document_id')->nullable()->constrained('documents')->onDelete('set null');
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('collection_id')->nullable()->constrained('collections')->onDelete('set null');
            $table->enum('privacy', ['public', 'private', 'invite_only'])->default('private');
            $table->integer('member_count')->default(1);
            $table->integer('message_count')->default(0);
            $table->timestamp('last_message_at')->nullable();
            $table->string('cover_image')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->json('settings')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Table pour les messages dans les discussions
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discussion_id')->constrained('discussions')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('content');
            $table->string('message_type')->default('text'); // 'text', 'document', 'image', 'system'
            $table->foreignId('document_id')->nullable()->constrained('documents')->onDelete('set null');
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('attachment_size')->nullable();
            $table->json('reactions')->nullable();
            $table->foreignId('reply_to')->nullable()->constrained('messages')->onDelete('set null');
            $table->boolean('is_edited')->default(false);
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->timestamp('pinned_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            $table->index(['discussion_id', 'created_at']);
        });

        // Table pour les mentions dans les messages
        Schema::create('mentions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->unique(['message_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentions');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('discussions');
    }
};