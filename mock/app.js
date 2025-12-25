// State Management
let currentPage = "home"
let currentSection = 'home';
const searchHistory = [
  {
    id: 1,
    query: "Quantum Computing Applications",
    timestamp: new Date(Date.now() - 3600000),
    pdfs: 15,
    videos: 8,
    articles: 23,
  },
  {
    id: 2,
    query: "Machine Learning Algorithms",
    timestamp: new Date(Date.now() - 7200000),
    pdfs: 12,
    videos: 10,
    articles: 18,
  },
  {
    id: 3,
    query: "Neural Networks Deep Learning",
    timestamp: new Date(Date.now() - 86400000),
    pdfs: 20,
    videos: 15,
    articles: 30,
  },
]
let isFullHistoryView = false
let selectedResult = null

// DOM Elements - ONLY GET ELEMENTS THAT EXIST IN INDEX.HTML
const pages = document.querySelectorAll(".page")
const searchForm = document.getElementById("searchForm")
const searchInput = document.getElementById("searchInput")
const mainContent = document.getElementById("mainContent")
const userDropdown = document.getElementById("userDropdown")
const userProfile = document.getElementById("userProfile")
const sidebar = document.getElementById("sidebar")
const mobileMenuToggle = document.getElementById("mobileMenuToggle")
const sidebarClose = document.getElementById("sidebarClose")
const themeToggle = document.getElementById("themeToggle")
const globalSearch = document.getElementById("globalSearch")
const logoutBtn = document.getElementById("logoutBtn")

// ========== NEW SECTION LOADING FUNCTIONS ==========

// Navigation
function navigateTo(sectionId) {
  currentSection = sectionId;
  
  // Update active states in navigation
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  document.querySelectorAll(`[data-section="${sectionId}"]`).forEach(item => {
    item.classList.add('active');
  });
  
  // Update URL hash
  window.location.hash = sectionId;
  
  // Load section content
  loadSection(sectionId);
  
  // Close sidebar on mobile
  if (window.innerWidth <= 768 && sidebar) {
    sidebar.classList.remove('open');
  }
}

async function loadSection(sectionName) {
  // Show loading state
  mainContent.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading ${sectionName}...</p>
    </div>
  `;

  try {
    let content = '';
    
    switch(sectionName) {
      case 'home':
        content = await fetchSection('home');
        break;
      case 'categories':
        content = await fetchSection('categories');
        break;
      case 'documents':
        content = await fetchSection('documents');
        break;
      case 'friends':
        content = await fetchSection('friends');
        break;
      case 'discussions':
        content = await fetchSection('discussions');
        break;
      case 'favorites':
        content = await fetchSection('favorites');
        break;
      case 'history':
        content = await fetchSection('history');
        break;
      case 'profile':
        content = await fetchSection('profile');
        break;
      case 'search':
        content = await fetchSection('search-results');
        break;
      default:
        content = await fetchSection('home');
    }

    mainContent.innerHTML = content;
    initializeSection(sectionName);
    
    // Scroll to top
    mainContent.scrollTop = 0;
  } catch (error) {
    console.error('Error loading section:', error);
    mainContent.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Content</h3>
        <p>Please try again later.</p>
        <button onclick="loadSection('${sectionName}')" class="btn btn-primary">
          Retry
        </button>
      </div>
    `;
  }
}

async function fetchSection(sectionName) {
  try {
    // Try to fetch from sections folder
    const response = await fetch(`sections/${sectionName}.html`);
    if (!response.ok) {
      throw new Error(`Failed to load ${sectionName}`);
    }
    return await response.text();
  } catch (error) {
    console.warn('Using fallback template for:', sectionName);
    return getFallbackTemplate(sectionName);
  }
}

function getFallbackTemplate(sectionName) {
  // Fallback templates for each section
  const templates = {
    'home': `
      <div class="content-section">
        <div class="welcome-banner">
          <div class="banner-content">
            <h2>Welcome back!</h2>
            <p>Continue your research journey</p>
          </div>
        </div>
        <div class="quick-stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1); color: var(--primary-color);">
              <i class="fas fa-book"></i>
            </div>
            <div class="stat-info">
              <h3>45</h3>
              <p>Documents</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success-color);">
              <i class="fas fa-folder"></i>
            </div>
            <div class="stat-info">
              <h3>12</h3>
              <p>Categories</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(139, 92, 246, 0.1); color: var(--purple-color);">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <h3>23</h3>
              <p>Friends</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--warning-color);">
              <i class="fas fa-comments"></i>
            </div>
            <div class="stat-info">
              <h3>8</h3>
              <p>Discussions</p>
            </div>
          </div>
        </div>
      </div>
    `,
    'categories': `
      <div class="content-section">
        <div class="page-header">
          <div class="header-content">
            <h2><i class="fas fa-folder"></i> Categories</h2>
            <p>Organize your research materials by topic</p>
          </div>
          <button class="btn btn-primary" data-action="create-category">
            <i class="fas fa-plus"></i> New Category
          </button>
        </div>
        <div class="categories-grid" id="categoriesGrid">
          <div class="category-card">
            <div class="category-header">
              <div class="category-icon" style="background: rgba(59, 130, 246, 0.1); color: var(--primary-color);">
                <i class="fas fa-folder"></i>
              </div>
            </div>
            <h3>Sample Category</h3>
            <p>5 documents</p>
          </div>
        </div>
      </div>
    `,
    'friends': `
      <div class="content-section">
        <div class="page-header">
          <div class="header-content">
            <h2><i class="fas fa-users"></i> Research Network</h2>
            <p>Connect and collaborate with fellow researchers</p>
          </div>
        </div>
      </div>
    `,
    'discussions': `
      <div class="content-section">
        <div class="page-header">
          <div class="header-content">
            <h2><i class="fas fa-comments"></i> Discussions</h2>
            <p>Collaborate on research topics with peers</p>
          </div>
        </div>
      </div>
    `,
    'profile': `
      <div class="content-section">
        <div class="profile-header-card">
          <div class="profile-main">
            <div class="profile-avatar">
              <img src="https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff" alt="Profile">
            </div>
            <div class="profile-info">
              <h2>John Doe</h2>
              <p class="profile-title">Student Researcher</p>
              <p class="profile-institution">
                <i class="fas fa-university"></i> MIT
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
    'search-results': `
      <div class="content-section">
        <div class="search-results-header">
          <h2>Search Results</h2>
          <p>Find research materials</p>
        </div>
      </div>
    `
  };
  
  return templates[sectionName] || templates['home'];
}

function initializeSection(section) {
  // Initialize section-specific functionality
  switch(section) {
    case 'home':
      initializeHomeSection();
      break;
    case 'categories':
      initializeCategoriesSection();
      break;
    case 'friends':
      initializeFriendsSection();
      break;
    case 'discussions':
      initializeDiscussionsSection();
      break;
    case 'profile':
      initializeProfileSection();
      break;
    case 'search':
    case 'search-results':
      initializeSearchResultsSection();
      break;
  }
  
  // Set up event listeners for the section
  setupSectionEventListeners(section);
}

function initializeHomeSection() {
  // Home section initialization
  console.log('Initializing home section');
  
  // Render history if the element exists in the loaded section
  const historyList = document.getElementById("historyList");
  if (historyList) {
    renderHistory();
  }
  
  // Initialize other home section elements
  const viewAllBtn = document.getElementById("viewAllBtn");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const historySection = document.getElementById("historySection");
  const searchSection = document.getElementById("searchSection");
  
  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", () => {
      isFullHistoryView = true;
      if (historySection) historySection.classList.add("full-view");
      if (searchSection) searchSection.classList.add("expanded");
      viewAllBtn.style.display = "none";
      if (scrollTopBtn) scrollTopBtn.classList.add("visible");
      renderHistory();
    });
  }
  
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      isFullHistoryView = false;
      if (historySection) historySection.classList.remove("full-view");
      if (searchSection) searchSection.classList.remove("expanded");
      if (viewAllBtn) viewAllBtn.style.display = "inline-flex";
      if (scrollTopBtn) scrollTopBtn.classList.remove("visible");
      if (searchSection) searchSection.scrollIntoView({ behavior: "smooth" });
      renderHistory();
    });
  }
}

function initializeCategoriesSection() {
  // Categories section initialization
  console.log('Initializing categories section');
}

function initializeFriendsSection() {
  // Friends section initialization
  console.log('Initializing friends section');
}

function initializeDiscussionsSection() {
  // Discussions section initialization
  console.log('Initializing discussions section');
}

function initializeProfileSection() {
  // Profile section initialization
  console.log('Initializing profile section');
}

function initializeSearchResultsSection() {
  // Search results section initialization
  console.log('Initializing search results section');
}

// ========== EXISTING APP FUNCTIONALITY ==========

// Search
searchForm?.addEventListener("submit", (e) => {
  e.preventDefault()
  const query = searchInput.value.trim()

  if (query) {
    const newResult = {
      id: Date.now(),
      query: query,
      timestamp: new Date(),
      pdfs: Math.floor(Math.random() * 20) + 5,
      videos: Math.floor(Math.random() * 15) + 3,
      articles: Math.floor(Math.random() * 30) + 10,
    }

    searchHistory.unshift(newResult)
    // Only render history if we're on home page
    if (currentSection === 'home') {
      renderHistory()
    }
    selectedResult = newResult

    // Navigate to search results
    navigateTo("search")
  }
})

// Render History - UPDATED to check if element exists
function renderHistory() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return; // Exit if element doesn't exist
  
  const limit = isFullHistoryView ? searchHistory.length : 3
  const items = searchHistory.slice(0, limit)

  historyList.innerHTML = items
    .map(
      (item) => `
        <div class="history-card" data-id="${item.id}">
            <div class="history-content">
                <h4 class="history-title">${item.query}</h4>
                <div class="history-stats">
                    <span class="stat-item">
                        <i class="fas fa-file-pdf"></i>
                        ${item.pdfs} PDFs
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-video"></i>
                        ${item.videos} Videos
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-newspaper"></i>
                        ${item.articles} Articles
                    </span>
                </div>
            </div>
            <div class="history-meta">
                <span class="time-ago">${formatTimeAgo(item.timestamp)}</span>
                <i class="fas fa-chevron-right chevron"></i>
            </div>
        </div>
    `
    )
    .join("")

  // Add click handlers
  document.querySelectorAll(".history-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = Number.parseInt(card.dataset.id)
      const result = searchHistory.find((h) => h.id === id)
      if (result) {
        selectedResult = result
        // Navigate to search results with this query
        performSearch(result.query)
      }
    })
  })
}

// Time formatting
function formatTimeAgo(date) {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

// ========== NEW EVENT LISTENERS ==========

// User profile dropdown
userProfile?.addEventListener('click', (e) => {
  e.stopPropagation();
  userDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!userProfile?.contains(e.target) && !userDropdown?.contains(e.target)) {
    userDropdown?.classList.remove('show');
  }
});

// Mobile menu toggle
mobileMenuToggle?.addEventListener('click', () => {
  sidebar.classList.add('open');
});

// Close sidebar
sidebarClose?.addEventListener('click', () => {
  sidebar.classList.remove('open');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768 && 
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !mobileMenuToggle.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// Theme toggle
themeToggle?.addEventListener('change', (e) => {
  toggleTheme(e.target.checked);
});

// Global search
globalSearch?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch(e.target.value);
  }
});

// Logout
logoutBtn?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});

// Hash change handling
window.addEventListener('hashchange', function() {
  const section = window.location.hash.substring(1) || 'home';
  navigateTo(section);
});

// Navigation event listeners - add after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Navigation items
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('data-section');
      navigateTo(section);
    });
  });
  
  // Tab functionality
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      const container = tab.closest('.content-section') || mainContent;
      
      container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const tabContent = container.querySelector(`#${targetTab}Content`);
      if (tabContent) tabContent.classList.add('active');
    });
  });
});

// ========== NEW HELPER FUNCTIONS ==========

function toggleTheme(isDark) {
  if (isDark) {
    document.documentElement.style.setProperty('--bg-primary', '#0a0a0a');
    document.documentElement.style.setProperty('--bg-secondary', '#111111');
    document.documentElement.style.setProperty('--bg-tertiary', '#1a1a1a');
    document.documentElement.style.setProperty('--text-primary', '#fafafa');
  } else {
    document.documentElement.style.setProperty('--bg-primary', '#f8fafc');
    document.documentElement.style.setProperty('--bg-secondary', '#f1f5f9');
    document.documentElement.style.setProperty('--bg-tertiary', '#e2e8f0');
    document.documentElement.style.setProperty('--text-primary', '#0f172a');
  }
}

function performSearch(query) {
  if (!query.trim()) return;
  
  // Add to search history
  const newResult = {
    id: Date.now(),
    query: query,
    timestamp: new Date(),
    pdfs: Math.floor(Math.random() * 20) + 5,
    videos: Math.floor(Math.random() * 15) + 3,
    articles: Math.floor(Math.random() * 30) + 10,
  };

  searchHistory.unshift(newResult);
  
  // Update history list if on home page
  if (currentSection === 'home') {
    const historyList = document.getElementById("historyList");
    if (historyList) {
      renderHistory();
    }
  }
  
  // Navigate to search section with results
  navigateTo('search');
  
  // Store search query for results page
  localStorage.setItem('lastSearchQuery', query);
  
  // Show toast
  showToast(`Searching for: ${query}`, 'info');
}

function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
    <button class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Add to DOM
  document.body.appendChild(toast);

  // Add show class after a frame
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);

  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
}

// Initialize section listeners
function setupSectionEventListeners(section) {
  switch(section) {
    case 'home':
      setupHomeListeners();
      break;
    case 'categories':
      setupCategoriesListeners();
      break;
    case 'friends':
      setupFriendsListeners();
      break;
    case 'discussions':
      setupDiscussionsListeners();
      break;
    case 'profile':
      setupProfileListeners();
      break;
    case 'search':
    case 'search-results':
      setupSearchListeners();
      break;
  }
}

function setupHomeListeners() {
  // Document card actions
  document.querySelectorAll('[data-action="toggle-favorite"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('active');
      const docId = btn.closest('.document-card')?.getAttribute('data-doc-id');
      
      if (docId) {
        if (btn.classList.contains('active')) {
          showToast('Added to favorites', 'success');
        } else {
          showToast('Removed from favorites', 'info');
        }
      }
    });
  });

  // Quick actions
  document.querySelectorAll('[data-action="quick-search"]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo('search');
    });
  });
  
  // Category items
  document.querySelectorAll('[data-action="view-category"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryId = btn.closest('.category-item')?.getAttribute('data-category-id');
      navigateTo('categories');
      showToast(`Viewing category: ${categoryId}`, 'info');
    });
  });
}

function setupCategoriesListeners() {
  // Tab functionality
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      
      // Update active tab button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show corresponding tab content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}-tab`) {
          content.classList.add('active');
        }
      });
    });
  });
}

function setupFriendsListeners() {
  // Friend actions
  document.querySelectorAll('[data-action="add-friend"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const friendId = btn.closest('.friend-card')?.getAttribute('data-friend-id');
      showToast('Friend request sent', 'success');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-clock"></i> Pending';
    });
  });
}

function setupDiscussionsListeners() {
  // Chat functionality
  const messageInput = document.getElementById('messageInput');
  const sendMessage = document.getElementById('sendMessage');

  if (messageInput && sendMessage) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage.click();
      }
    });

    sendMessage.addEventListener('click', () => {
      const text = messageInput.value.trim();
      if (text) {
        // Add message to chat
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
          const messageHTML = `
            <div class="message message-own">
              <div class="message-content">
                <div class="message-bubble">${text}</div>
                <p class="message-time">Just now</p>
              </div>
            </div>
          `;
          messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        messageInput.value = '';
      }
    });
  }
}

function setupProfileListeners() {
  // Profile actions
  document.querySelectorAll('[data-action="edit-profile"]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Edit profile clicked', 'info');
      // Open edit profile modal
    });
  });
}

function setupSearchListeners() {
  // Search functionality
  const searchBtn = document.getElementById('performSearch');
  const mainSearch = document.getElementById('mainSearch');

  if (searchBtn && mainSearch) {
    searchBtn.addEventListener('click', () => {
      const query = mainSearch.value.trim();
      if (query) {
        performSearch(query);
      }
    });

    mainSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }

  // Search suggestions
  document.querySelectorAll('[data-suggestion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const suggestion = btn.getAttribute('data-suggestion');
      if (mainSearch) {
        mainSearch.value = suggestion;
        if (searchBtn) searchBtn.click();
      }
    });
  });
}

// ========== INITIALIZATION ==========

function initializeApp() {
  // Check authentication
  if (!localStorage.getItem('isLoggedIn') && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
    window.location.href = 'login.html';
    return;
  }

  // Load initial section from hash or default
  const initialSection = window.location.hash.substring(1) || 'home';
  navigateTo(initialSection);
  
  // Load user data
  loadUserData();
  
  // Setup mobile responsiveness
  setupMobileResponsive();
}

function loadUserData() {
  const userName = localStorage.getItem('userName') || 'John Doe';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  const userAvatar = localStorage.getItem('userAvatar') || 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff';
  
  // Update UI elements
  document.querySelectorAll('#userName').forEach(el => {
    if (el) el.textContent = userName;
  });
  
  const userAvatarImg = document.getElementById('userAvatarImg');
  if (userAvatarImg) {
    userAvatarImg.src = userAvatar;
  }
  
  // Update profile page if it's loaded
  if (currentSection === 'profile') {
    const profileName = document.getElementById('profileName');
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileName) profileName.textContent = userName;
    if (profileAvatar) profileAvatar.src = userAvatar;
  }
}

function setupMobileResponsive() {
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sidebar) {
      sidebar.classList.remove('open');
    }
  });
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for debugging
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { navigateTo, loadSection };
}