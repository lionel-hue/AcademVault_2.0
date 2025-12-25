// State Management
let currentPage = "home"
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

// DOM Elements
const pages = document.querySelectorAll(".page")
const navItems = document.querySelectorAll(".nav-item, .sidebar-item")
const searchForm = document.getElementById("searchForm")
const searchInput = document.getElementById("searchInput")
const historyList = document.getElementById("historyList")
const historySection = document.getElementById("historySection")
const searchSection = document.getElementById("searchSection")
const viewAllBtn = document.getElementById("viewAllBtn")
const scrollTopBtn = document.getElementById("scrollTopBtn")
const backToHome = document.getElementById("backToHome")
const tabs = document.querySelectorAll(".tab")
const tabContents = document.querySelectorAll(".tab-content")

// Navigation
function navigateTo(pageId) {
  pages.forEach((p) => p.classList.remove("active"))
  document.getElementById(pageId).classList.add("active")

  navItems.forEach((item) => {
    if (item.dataset.page === pageId.replace("Page", "")) {
      item.classList.add("active")
    } else {
      item.classList.remove("active")
    }
  })

  currentPage = pageId
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const page = item.dataset.page + "Page"
    navigateTo(page)
  })
})

// Search
searchForm.addEventListener("submit", (e) => {
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
    renderHistory()
    selectedResult = newResult

    document.getElementById("resultsTitle").textContent = query
    navigateTo("resultsPage")

    searchInput.value = ""
    searchInput.blur()
  }
})

// Render History
function renderHistory() {
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
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        ${item.pdfs} PDFs
                    </span>
                    <span class="stat-item">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                        ${item.videos} Videos
                    </span>
                    <span class="stat-item">
                        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        ${item.articles} Articles
                    </span>
                </div>
            </div>
            <div class="history-meta">
                <span class="time-ago">${formatTimeAgo(item.timestamp)}</span>
                <svg class="icon-sm chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        </div>
    `,
    )
    .join("")

  // Add click handlers
  document.querySelectorAll(".history-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = Number.parseInt(card.dataset.id)
      const result = searchHistory.find((h) => h.id === id)
      if (result) {
        selectedResult = result
        document.getElementById("resultsTitle").textContent = result.query
        navigateTo("resultsPage")
      }
    })
  })
}

// View All History
viewAllBtn.addEventListener("click", () => {
  isFullHistoryView = true
  historySection.classList.add("full-view")
  searchSection.classList.add("expanded")
  viewAllBtn.style.display = "none"
  scrollTopBtn.classList.add("visible")
  renderHistory()
})

scrollTopBtn.addEventListener("click", () => {
  isFullHistoryView = false
  historySection.classList.remove("full-view")
  searchSection.classList.remove("expanded")
  viewAllBtn.style.display = "inline-flex"
  scrollTopBtn.classList.remove("visible")
  searchSection.scrollIntoView({ behavior: "smooth" })
  renderHistory()
})

// Back to Home
backToHome.addEventListener("click", () => {
  navigateTo("homePage")
})

// Tabs
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetTab = tab.dataset.tab
    const container = tab.closest(".page")

    container.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"))
    container.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))

    tab.classList.add("active")
    container.querySelector(`#${targetTab}Content`).classList.add("active")
  })
})

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

// Modal Management
function openModal(modalId) {
  document.getElementById(modalId).classList.add("active")
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active")
}

document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest(".modal").classList.remove("active")
  })
})

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active")
    }
  })
})

// Category Modal
document.getElementById("newCategoryBtn")?.addEventListener("click", () => {
  openModal("categoryModal")
})

document.getElementById("createCategoryBtn")?.addEventListener("click", () => {
  const input = document.getElementById("categoryNameInput")
  if (input.value.trim()) {
    // Add category logic here
    console.log("Creating category:", input.value)
    input.value = ""
    closeModal("categoryModal")
  }
})

// Discussion Modal
document.getElementById("newDiscussionBtn")?.addEventListener("click", () => {
  openModal("discussionModal")
})

document.getElementById("createDiscussionBtn")?.addEventListener("click", () => {
  const input = document.getElementById("discussionTitleInput")
  if (input.value.trim()) {
    // Add discussion logic here
    console.log("Creating discussion:", input.value)
    input.value = ""
    closeModal("discussionModal")
  }
})

// Chat Navigation
const discussionCards = document.querySelectorAll(".discussion-card")
discussionCards.forEach((card) => {
  card.addEventListener("click", () => {
    const title = card.querySelector(".discussion-title").textContent
    const members = card.querySelector(".discussion-members").textContent
    document.getElementById("chatTitle").textContent = title
    document.getElementById("chatMembers").textContent = members
    navigateTo("chatPage")
  })
})

document.getElementById("backToDiscussions")?.addEventListener("click", () => {
  navigateTo("discussionsPage")
})

// Chat Functionality
const chatInput = document.getElementById("chatInput")
const sendMessageBtn = document.getElementById("sendMessageBtn")
const messagesContainer = document.getElementById("messagesContainer")
const addImageBtn = document.getElementById("addImageBtn")
const imageInput = document.getElementById("imageInput")

function sendMessage() {
  const text = chatInput.value.trim()
  if (text) {
    const messageHTML = `
            <div class="message message-own">
                <div class="message-content">
                    <div class="message-bubble">${text}</div>
                    <p class="message-time">Just now</p>
                </div>
            </div>
        `
    messagesContainer.insertAdjacentHTML("beforeend", messageHTML)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    chatInput.value = ""
  }
}

sendMessageBtn?.addEventListener("click", sendMessage)
chatInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage()
  }
})

addImageBtn?.addEventListener("click", () => {
  imageInput.click()
})

imageInput?.addEventListener("change", (e) => {
  if (e.target.files && e.target.files[0]) {
    console.log("Image selected:", e.target.files[0].name)
    // Add image upload logic here
  }
})

// Initialize
renderHistory()
