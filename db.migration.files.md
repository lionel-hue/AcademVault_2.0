// database/migrations/xxxx_create_users_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['teacher', 'student']);
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->date('registration_date');
            $table->boolean('is_active')->default(true);
            $table->enum('role', ['admin', 'moderator', 'user'])->default('user');
            $table->string('profile_image')->nullable();
            $table->text('bio')->nullable();
            $table->string('institution')->nullable();
            $table->string('department')->nullable();
            $table->string('phone')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};




// database/migrations/xxxx_create_categories_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color')->default('#3B82F6');
            $table->string('icon')->nullable();
            $table->boolean('is_public')->default(true);
            $table->integer('document_count')->default(0);
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['user_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};




// database/migrations/xxxx_create_documents_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['pdf', 'video', 'article_link', 'website', 'image', 'presentation']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('author')->nullable();
            $table->year('publication_year')->nullable();
            $table->string('publisher')->nullable();
            $table->string('isbn')->nullable();
            $table->string('doi')->nullable();
            $table->string('url')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_size')->nullable();
            $table->string('file_type')->nullable();
            $table->integer('page_count')->nullable();
            $table->string('duration')->nullable(); // pour vidéos
            $table->string('thumbnail')->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('download_count')->default(0);
            $table->float('rating')->default(0);
            $table->boolean('is_public')->default(true);
            $table->enum('license', ['cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'copyright', 'public_domain'])->default('copyright');
            $table->json('metadata')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};


// database/migrations/xxxx_create_history_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action'); // 'viewed', 'downloaded', 'shared', 'bookmarked'
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('history');
    }
};




// database/migrations/xxxx_create_tags_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->string('name');
            $table->string('color')->default('#6B7280');
            $table->integer('usage_count')->default(1);
            $table->boolean('is_system')->default(false);
            $table->timestamps();
            
            $table->unique(['document_id', 'name']);
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};




// database/migrations/xxxx_create_collections_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('visibility', ['private', 'public', 'shared'])->default('private');
            $table->string('cover_image')->nullable();
            $table->string('color_scheme')->default('blue');
            $table->integer('document_count')->default(0);
            $table->integer('follower_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_curated')->default(false);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'visibility']);
        });

        // Table pivot pour documents dans les collections
        Schema::create('collection_document', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_id')->constrained('collections')->onDelete('cascade');
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->integer('priority')->default(0);
            $table->integer('order')->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('added_at')->useCurrent();
            $table->json('custom_fields')->nullable();
            $table->timestamps();
            
            $table->unique(['collection_id', 'document_id']);
            $table->index(['collection_id', 'priority']);
            $table->index(['collection_id', 'order']);
        });

        // Table pour les catégories dans les collections
        Schema::create('collection_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_id')->constrained('collections')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->integer('document_count')->default(0);
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->unique(['collection_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_category');
        Schema::dropIfExists('collection_document');
        Schema::dropIfExists('collections');
    }
};



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




// database/migrations/xxxx_create_bookmarks_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->string('color')->default('#F59E0B');
            $table->string('icon')->default('star');
            $table->string('folder')->nullable();
            $table->integer('order')->default(0);
            $table->text('notes')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_favorite')->default(false);
            $table->timestamp('last_accessed_at')->useCurrent();
            $table->integer('access_count')->default(1);
            $table->json('custom_fields')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['user_id', 'document_id']);
            $table->index(['user_id', 'folder']);
            $table->index(['user_id', 'is_favorite']);
        });

        // Table pour les dossiers de signets
        Schema::create('bookmark_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('color')->default('#6B7280');
            $table->string('icon')->default('folder');
            $table->integer('order')->default(0);
            $table->integer('bookmark_count')->default(0);
            $table->enum('visibility', ['private', 'shared'])->default('private');
            $table->json('shared_with')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookmark_folders');
        Schema::dropIfExists('bookmarks');
    }
};



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



// database/migrations/xxxx_create_notifications_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type'); // friend_request, message, document_shared, etc.
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->foreignId('sender_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('document_id')->nullable()->constrained('documents')->onDelete('set null');
            $table->foreignId('discussion_id')->nullable()->constrained('discussions')->onDelete('set null');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_read']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};




<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_verifications', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('code', 6);
            $table->string('type', 50)->default('registration');
            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            $table->index(['email', 'code', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_verifications');
    }
};


// database/migrations/xxxx_create_search_history_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('query');
            $table->integer('results_count')->default(0);
            $table->string('source_type')->nullable(); // 'youtube', 'pdf', 'article', 'all'
            $table->json('filters')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
            $table->index('query');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_history');
    }
};



<?php
// server/database/seeders/DatabaseSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Clear tables
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('users')->truncate();
        DB::table('documents')->truncate();
        DB::table('categories')->truncate();
        DB::table('collections')->truncate();
        DB::table('bookmarks')->truncate();
        DB::table('history')->truncate();
        DB::table('notifications')->truncate();
        DB::table('friendships')->truncate();
        DB::table('discussions')->truncate();
        DB::table('collection_document')->truncate(); // Add this line
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Create main user
        $userId = DB::table('users')->insertGetId([
            'name' => 'Test User',
            'type' => 'student',
            'email' => 'test@academvault.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'registration_date' => now()->format('Y-m-d'),
            'institution' => 'MIT University',
            'department' => 'Computer Science',
            'bio' => 'AI and Machine Learning researcher',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create 5 other users
        $otherUserIds = [];
        for ($i = 1; $i <= 5; $i++) {
            $otherUserIds[] = DB::table('users')->insertGetId([
                'name' => "User {$i}",
                'type' => $i % 2 == 0 ? 'teacher' : 'student',
                'email' => "user{$i}@academvault.com",
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'registration_date' => now()->subDays($i * 10)->format('Y-m-d'),
                'institution' => ['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge'][$i - 1],
                'department' => ['CS', 'Physics', 'Mathematics', 'Biology', 'Engineering'][$i - 1],
                'created_at' => now()->subDays($i * 10),
                'updated_at' => now()->subDays($i * 10),
            ]);
        }

        // Create categories
        $categories = [
            ['name' => 'Artificial Intelligence', 'color' => '#3B82F6', 'icon' => 'fas fa-robot'],
            ['name' => 'Machine Learning', 'color' => '#10B981', 'icon' => 'fas fa-brain'],
            ['name' => 'Quantum Computing', 'color' => '#8B5CF6', 'icon' => 'fas fa-atom'],
            ['name' => 'Data Science', 'color' => '#F59E0B', 'icon' => 'fas fa-chart-bar'],
            ['name' => 'Cybersecurity', 'color' => '#EF4444', 'icon' => 'fas fa-shield-alt'],
        ];

        $categoryIds = [];
        foreach ($categories as $category) {
            $categoryIds[] = DB::table('categories')->insertGetId([
                'user_id' => $userId,
                'name' => $category['name'],
                'color' => $category['color'],
                'icon' => $category['icon'],
                'document_count' => rand(3, 8),
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(0, 10)),
            ]);
        }

        // Create documents
        $documentTypes = ['pdf', 'video', 'article_link', 'presentation'];
        $titles = [
            'Introduction to Deep Learning',
            'Quantum Algorithms Overview',
            'Neural Networks from Scratch',
            'Data Visualization Techniques',
            'Cybersecurity Best Practices',
            'Machine Learning Ethics',
            'Reinforcement Learning Guide',
            'Natural Language Processing',
            'Computer Vision Fundamentals',
            'Blockchain Technology Explained',
        ];

        $documentIds = [];
        foreach ($titles as $index => $title) {
            $documentIds[] = DB::table('documents')->insertGetId([
                'type' => $documentTypes[$index % count($documentTypes)],
                'title' => $title,
                'description' => "This is a comprehensive guide about {$title}.",
                'author' => ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown', 'Dr. Davis'][$index % 5],
                'publication_year' => 2023 + ($index % 2),
                'publisher' => ['Springer', 'IEEE', 'ACM', 'Elsevier', 'ArXiv'][$index % 5],
                'view_count' => rand(50, 500),
                'download_count' => rand(10, 100),
                'file_size' => rand(1, 50) . ' MB',
                'page_count' => $documentTypes[$index % count($documentTypes)] == 'pdf' ? rand(10, 100) : null,
                'duration' => $documentTypes[$index % count($documentTypes)] == 'video' ? rand(5, 60) . ':00' : null,
                'is_public' => true,
                'created_at' => now()->subDays(rand(0, 90)),
                'updated_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        // Create collections
        $collectionIds = [];
        $collectionNames = ['AI Research', 'ML Papers', 'Quantum Studies', 'Data Projects', 'Security Resources'];
        foreach ($collectionNames as $index => $name) {
            $collectionIds[] = DB::table('collections')->insertGetId([
                'name' => $name,
                'description' => "Collection of resources about {$name}",
                'user_id' => $userId,
                'visibility' => ['public', 'private', 'shared'][$index % 3],
                'document_count' => rand(2, 5),
                'color_scheme' => ['blue', 'green', 'purple', 'orange', 'red'][$index],
                'created_at' => now()->subDays(rand(5, 60)),
                'updated_at' => now()->subDays(rand(0, 15)),
            ]);
        }

        // Add documents to collections - FIXED: Use unique documents for each collection
        $usedDocumentPairs = []; // Track used (collection_id, document_id) pairs
        
        foreach ($collectionIds as $collectionId) {
            $docCount = rand(2, 5);
            $availableDocs = array_values(array_diff($documentIds, 
                array_keys(array_filter($usedDocumentPairs, function($docId) use ($collectionId) {
                    return $docId === $collectionId;
                }, ARRAY_FILTER_USE_KEY))
            ));
            
            $selectedDocs = [];
            if (count($availableDocs) > 0) {
                shuffle($availableDocs);
                $selectedDocs = array_slice($availableDocs, 0, min($docCount, count($availableDocs)));
                
                foreach ($selectedDocs as $docId) {
                    // Check if this pair already exists
                    $pairKey = "{$collectionId}-{$docId}";
                    if (!in_array($pairKey, $usedDocumentPairs)) {
                        DB::table('collection_document')->insert([
                            'collection_id' => $collectionId,
                            'document_id' => $docId,
                            'added_at' => now()->subDays(rand(0, 30)),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $usedDocumentPairs[] = $pairKey;
                    }
                }
            }
        }

        // Create bookmarks
        foreach (array_slice($documentIds, 0, 8) as $docId) {
            DB::table('bookmarks')->insert([
                'user_id' => $userId,
                'document_id' => $docId,
                'is_favorite' => $docId % 3 == 0,
                'last_accessed_at' => now()->subDays(rand(0, 7)),
                'access_count' => rand(1, 10),
                'created_at' => now()->subDays(rand(0, 30)),
                'updated_at' => now()->subDays(rand(0, 5)),
            ]);
        }

        // Create history entries
        foreach (array_slice($documentIds, 0, 6) as $docId) {
            $actions = ['viewed', 'downloaded', 'searched'];
            foreach ($actions as $action) {
                DB::table('history')->insert([
                    'document_id' => $docId,
                    'user_id' => $userId,
                    'action' => $action,
                    'details' => json_encode(['query' => 'machine learning algorithms']),
                    'created_at' => now()->subHours(rand(1, 72)),
                    'updated_at' => now()->subHours(rand(0, 24)),
                ]);
            }
        }

        // Create friendships
        foreach (array_slice($otherUserIds, 0, 4) as $friendId) {
            DB::table('friendships')->insert([
                'user_id' => $userId,
                'friend_id' => $friendId,
                'status' => 'accepted',
                'relationship_type' => ['colleague', 'mentor', 'friend'][$friendId % 3],
                'accepted_at' => now()->subDays(rand(5, 60)),
                'created_at' => now()->subDays(rand(10, 90)),
                'updated_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        // Create discussions
        $discussionIds = [];
        for ($i = 0; $i < 3; $i++) {
            $discussionIds[] = DB::table('discussions')->insertGetId([
                'title' => "Discussion about " . $titles[$i],
                'description' => "Let's discuss " . $titles[$i],
                'type' => 'general',
                'admin_id' => $userId,
                'privacy' => 'private',
                'member_count' => rand(2, 5),
                'message_count' => rand(5, 20),
                'last_message_at' => now()->subHours(rand(1, 48)),
                'created_at' => now()->subDays(rand(5, 30)),
                'updated_at' => now()->subDays(rand(0, 7)),
            ]);
        }

        // Create notifications
        $notificationTypes = ['friend_request', 'document_shared', 'discussion', 'system'];
        foreach ($notificationTypes as $type) {
            DB::table('notifications')->insert([
                'user_id' => $userId,
                'type' => $type,
                'title' => ucfirst(str_replace('_', ' ', $type)),
                'message' => "You have a new {$type}",
                'sender_id' => $otherUserIds[array_rand($otherUserIds)],
                'is_read' => rand(0, 1),
                'read_at' => rand(0, 1) ? now()->subHours(rand(1, 12)) : null,
                'created_at' => now()->subHours(rand(1, 72)),
                'updated_at' => now()->subHours(rand(0, 24)),
            ]);
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Test user: test@academvault.com / password123');
    }
}