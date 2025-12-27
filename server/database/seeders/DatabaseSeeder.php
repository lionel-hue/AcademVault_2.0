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

        // Add documents to collections
        foreach ($collectionIds as $collectionId) {
            $docCount = rand(2, 5);
            $selectedDocs = array_rand($documentIds, min($docCount, count($documentIds)));
            if (!is_array($selectedDocs)) {
                $selectedDocs = [$selectedDocs];
            }
            foreach ($selectedDocs as $docIndex) {
                DB::table('collection_document')->insert([
                    'collection_id' => $collectionId,
                    'document_id' => $documentIds[$docIndex],
                    'added_at' => now()->subDays(rand(0, 30)),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
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