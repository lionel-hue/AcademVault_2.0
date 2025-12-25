// Mock Database for AcademVault
const mockDatabase = {
    // Current User
    currentUser: {
        id: 1,
        name: "John Doe",
        email: "john.doe@mit.edu",
        role: "student",
        avatar: "https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff",
        institution: "MIT",
        fieldOfStudy: "Computer Science",
        bio: "Passionate about quantum computing and machine learning research. Currently working on quantum algorithms for optimization problems.",
        joinDate: "2023-09-15"
    },

    // Categories
    categories: [
        {
            id: 1,
            name: "Quantum Physics",
            description: "Research on quantum mechanics and computing",
            documentCount: 15,
            color: "#3b82f6",
            tags: ["research", "physics", "quantum"],
            priority: 1
        },
        {
            id: 2,
            name: "Machine Learning",
            description: "AI and ML algorithms research",
            documentCount: 23,
            color: "#10b981",
            tags: ["ai", "algorithms", "data"],
            priority: 2
        },
        {
            id: 3,
            name: "Neuroscience",
            description: "Brain and cognitive science research",
            documentCount: 12,
            color: "#8b5cf6",
            tags: ["biology", "psychology", "brain"],
            priority: 3
        },
        {
            id: 4,
            name: "Renewable Energy",
            description: "Sustainable energy solutions",
            documentCount: 8,
            color: "#f59e0b",
            tags: ["energy", "sustainability", "environment"],
            priority: 4
        }
    ],

    // Documents
    documents: [
        {
            id: 1,
            title: "Introduction to Quantum Algorithms",
            type: "pdf",
            size: "2.5 MB",
            year: 2024,
            author: "Dr. Alice Johnson",
            source: "MIT Press",
            category: "Quantum Physics",
            tags: ["quantum", "algorithms", "computing"],
            favorite: true,
            rating: 4.8,
            color: "#3b82f6"
        },
        {
            id: 2,
            title: "Deep Learning in Healthcare",
            type: "video",
            duration: "45:30",
            platform: "YouTube",
            author: "Prof. Sarah Chen",
            category: "Machine Learning",
            tags: ["ai", "healthcare", "deep-learning"],
            favorite: true,
            rating: 4.9,
            color: "#10b981"
        },
        {
            id: 3,
            title: "Neural Networks Explained",
            type: "article",
            journal: "Nature",
            doi: "10.1038/s41586-024-06710-6",
            author: "Dr. Michael Brown",
            category: "Machine Learning",
            tags: ["neural", "tutorial", "beginner"],
            favorite: false,
            rating: 4.5,
            color: "#8b5cf6"
        },
        {
            id: 4,
            title: "Quantum Computing Applications",
            type: "pdf",
            size: "3.2 MB",
            year: 2023,
            author: "Dr. Robert Wilson",
            source: "Stanford University",
            category: "Quantum Physics",
            tags: ["applications", "case-studies"],
            favorite: true,
            rating: 4.7,
            color: "#3b82f6"
        },
        {
            id: 5,
            title: "Solar Energy Innovations 2024",
            type: "article",
            journal: "Science",
            doi: "10.1126/science.adl4260",
            author: "Dr. Emily Zhang",
            category: "Renewable Energy",
            tags: ["solar", "innovation", "2024"],
            favorite: false,
            rating: 4.6,
            color: "#f59e0b"
        },
        {
            id: 6,
            title: "Brain-Computer Interfaces",
            type: "video",
            duration: "38:15",
            platform: "Coursera",
            author: "Prof. David Kim",
            category: "Neuroscience",
            tags: ["bci", "technology", "future"],
            favorite: true,
            rating: 4.8,
            color: "#8b5cf6"
        }
    ],

    // Search History
    searchHistory: [
        {
            id: 1,
            query: "Quantum Computing Applications",
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            results: {
                pdfs: 15,
                videos: 8,
                articles: 23
            }
        },
        {
            id: 2,
            query: "Machine Learning Algorithms",
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            results: {
                pdfs: 12,
                videos: 10,
                articles: 18
            }
        },
        {
            id: 3,
            query: "Neural Networks Deep Learning",
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            results: {
                pdfs: 20,
                videos: 15,
                articles: 30
            }
        },
        {
            id: 4,
            query: "Renewable Energy Solutions",
            timestamp: new Date(Date.now() - 172800000), // 2 days ago
            results: {
                pdfs: 8,
                videos: 5,
                articles: 12
            }
        }
    ],

    // Friends
    friends: [
        {
            id: 1,
            name: "Alice Johnson",
            email: "alice.johnson@mit.edu",
            role: "student",
            institution: "MIT",
            field: "Computer Science",
            status: "friend",
            avatar: "https://ui-avatars.com/api/?name=Alice+Johnson&background=10b981&color=fff",
            online: true,
            lastSeen: "5 minutes ago"
        },
        {
            id: 2,
            name: "Bob Smith",
            email: "bob.smith@stanford.edu",
            role: "professor",
            institution: "Stanford",
            field: "Physics",
            status: "friend",
            avatar: "https://ui-avatars.com/api/?name=Bob+Smith&background=8b5cf6&color=fff",
            online: false,
            lastSeen: "2 hours ago"
        },
        {
            id: 3,
            name: "Carol Davis",
            email: "carol.davis@harvard.edu",
            role: "student",
            institution: "Harvard",
            field: "Biology",
            status: "pending",
            avatar: "https://ui-avatars.com/api/?name=Carol+Davis&background=f59e0b&color=fff",
            online: true,
            lastSeen: "Online"
        },
        {
            id: 4,
            name: "David Wilson",
            email: "david.wilson@oxford.ac.uk",
            role: "professor",
            institution: "Oxford",
            field: "Mathematics",
            status: "suggested",
            avatar: "https://ui-avatars.com/api/?name=David+Wilson&background=ef4444&color=fff",
            online: false,
            lastSeen: "1 day ago"
        }
    ],

    // Discussions
    discussions: [
        {
            id: 1,
            title: "Quantum Computing Discussion",
            document: "Quantum Algorithms Research",
            preview: "Great insights on the latest findings! Looking forward to collaborating on this project.",
            members: 8,
            admin: "Alice Johnson",
            lastMessage: {
                text: "I think the methodology needs more validation",
                sender: "John Doe",
                time: "5 minutes ago"
            },
            unread: 3,
            tags: ["quantum", "research", "collaboration"]
        },
        {
            id: 2,
            title: "ML Research Group",
            document: "Deep Learning Applications",
            preview: "New paper just published on Nature about transformer models",
            members: 12,
            admin: "Bob Smith",
            lastMessage: {
                text: "The results look promising for healthcare applications",
                sender: "Carol Davis",
                time: "2 hours ago"
            },
            unread: 0,
            tags: ["ml", "ai", "healthcare"]
        },
        {
            id: 3,
            title: "Neuroscience Forum",
            document: "Brain-Computer Interface Review",
            preview: "Discussing ethical implications of neural implants",
            members: 6,
            admin: "David Wilson",
            lastMessage: {
                text: "The FDA approval process is quite complex",
                sender: "Alice Johnson",
                time: "1 day ago"
            },
            unread: 1,
            tags: ["neuroscience", "ethics", "bci"]
        }
    ],

    // Favorites
    favorites: [
        {
            id: 1,
            type: "document",
            itemId: 1,
            addedAt: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
            id: 2,
            type: "document",
            itemId: 2,
            addedAt: new Date(Date.now() - 172800000) // 2 days ago
        },
        {
            id: 3,
            type: "document",
            itemId: 4,
            addedAt: new Date(Date.now() - 259200000) // 3 days ago
        },
        {
            id: 4,
            type: "category",
            itemId: 1,
            addedAt: new Date(Date.now() - 345600000) // 4 days ago
        }
    ],

    // Messages for discussions
    messages: {
        1: [ // Discussion ID 1
            {
                id: 1,
                sender: "Alice Johnson",
                text: "Hey everyone! What do you think about the methodology in the latest quantum paper?",
                time: "2 hours ago",
                avatar: "https://ui-avatars.com/api/?name=Alice+Johnson&background=10b981&color=fff"
            },
            {
                id: 2,
                sender: "John Doe",
                text: "I think the approach is solid but needs more validation with different datasets.",
                time: "1 hour ago",
                avatar: "https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff",
                isOwn: true
            },
            {
                id: 3,
                sender: "Bob Smith",
                text: "Agreed. The error rate reduction is impressive but scalability needs work.",
                time: "45 minutes ago",
                avatar: "https://ui-avatars.com/api/?name=Bob+Smith&background=8b5cf6&color=fff"
            }
        ]
    },

    // Tags (for tag system)
    allTags: [
        { id: 1, name: "quantum", color: "#3b82f6", count: 12 },
        { id: 2, name: "machine-learning", color: "#10b981", count: 18 },
        { id: 3, name: "ai", color: "#8b5cf6", count: 15 },
        { id: 4, name: "research", color: "#f59e0b", count: 25 },
        { id: 5, name: "physics", color: "#ef4444", count: 8 },
        { id: 6, name: "algorithms", color: "#3b82f6", count: 14 },
        { id: 7, name: "data-science", color: "#10b981", count: 11 },
        { id: 8, name: "neuroscience", color: "#8b5cf6", count: 7 },
        { id: 9, name: "sustainability", color: "#f59e0b", count: 9 },
        { id: 10, name: "healthcare", color: "#ef4444", count: 6 }
    ]
};

// Helper functions
const DataService = {
    // Get current user
    getCurrentUser() {
        return mockDatabase.currentUser;
    },

    // Get categories
    getCategories() {
        return mockDatabase.categories;
    },

    // Get documents by category
    getDocumentsByCategory(categoryId) {
        const category = mockDatabase.categories.find(c => c.id === categoryId);
        if (!category) return [];
        
        return mockDatabase.documents.filter(doc => 
            doc.category.toLowerCase() === category.name.toLowerCase()
        );
    },

    // Get all documents
    getAllDocuments() {
        return mockDatabase.documents;
    },

    // Get search history
    getSearchHistory() {
        return mockDatabase.searchHistory;
    },

    // Get friends
    getFriends(status = 'all') {
        if (status === 'all') {
            return mockDatabase.friends;
        }
        return mockDatabase.friends.filter(friend => friend.status === status);
    },

    // Get discussions
    getDiscussions() {
        return mockDatabase.discussions;
    },

    // Get messages for a discussion
    getMessages(discussionId) {
        return mockDatabase.messages[discussionId] || [];
    },

    // Get favorites
    getFavorites() {
        const favDocs = mockDatabase.favorites
            .filter(fav => fav.type === 'document')
            .map(fav => mockDatabase.documents.find(doc => doc.id === fav.itemId))
            .filter(Boolean);
        
        const favCategories = mockDatabase.favorites
            .filter(fav => fav.type === 'category')
            .map(fav => mockDatabase.categories.find(cat => cat.id === fav.itemId))
            .filter(Boolean);

        return { documents: favDocs, categories: favCategories };
    },

    // Get all tags
    getAllTags() {
        return mockDatabase.allTags;
    },

    // Add a tag to a document
    addTagToDocument(documentId, tagName) {
        const document = mockDatabase.documents.find(doc => doc.id === documentId);
        if (document && !document.tags.includes(tagName)) {
            document.tags.push(tagName);
            return true;
        }
        return false;
    },

    // Remove a tag from a document
    removeTagFromDocument(documentId, tagName) {
        const document = mockDatabase.documents.find(doc => doc.id === documentId);
        if (document) {
            const index = document.tags.indexOf(tagName);
            if (index > -1) {
                document.tags.splice(index, 1);
                return true;
            }
        }
        return false;
    },

    // Search documents
    searchDocuments(query) {
        const lowerQuery = query.toLowerCase();
        return mockDatabase.documents.filter(doc => 
            doc.title.toLowerCase().includes(lowerQuery) ||
            doc.category.toLowerCase().includes(lowerQuery) ||
            doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            doc.author.toLowerCase().includes(lowerQuery)
        );
    },

    // Add to favorites
    addToFavorite(type, itemId) {
        const exists = mockDatabase.favorites.some(fav => 
            fav.type === type && fav.itemId === itemId
        );
        
        if (!exists) {
            mockDatabase.favorites.push({
                id: mockDatabase.favorites.length + 1,
                type,
                itemId,
                addedAt: new Date()
            });
            return true;
        }
        return false;
    },

    // Remove from favorites
    removeFromFavorite(type, itemId) {
        const index = mockDatabase.favorites.findIndex(fav => 
            fav.type === type && fav.itemId === itemId
        );
        
        if (index > -1) {
            mockDatabase.favorites.splice(index, 1);
            return true;
        }
        return false;
    },

    // Add friend request
    addFriendRequest(friendId) {
        const friend = mockDatabase.friends.find(f => f.id === friendId);
        if (friend) {
            friend.status = 'pending';
            return true;
        }
        return false;
    },

    // Accept friend request
    acceptFriendRequest(friendId) {
        const friend = mockDatabase.friends.find(f => f.id === friendId);
        if (friend && friend.status === 'pending') {
            friend.status = 'friend';
            return true;
        }
        return false;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mockDatabase, DataService };
}