// InsideFactz Training Institute - Client Application Controller

// 1. Curriculum Database
const curriculumData = [
  {
    id: 1,
    category: "excel",
    title: "Spreadsheet Foundations",
    desc: "Master the core interface of MS Excel, learning to organize, format, and clean professional business datasets efficiently.",
    topics: ["Spreadsheet Basics", "Cell Formatting & Styles", "Data Cleaning Techniques", "Data Entry Automation", "Shortcut Navigation", "Absolute & Relative Referencing ($)"]
  },
  {
    id: 2,
    category: "excel",
    title: "Analytical Formulas & Logic",
    desc: "Perform complex lookup, conditional, and mathematical calculations to extract valuable business insights from spreadsheets.",
    topics: ["VLOOKUP & HLOOKUP", "INDEX & MATCH", "SUMIFS & COUNTIFS", "IFERROR & Logical IFs", "Nested Logical Statements", "Array & Dynamic Spill Formulas"]
  },
  {
    id: 3,
    category: "excel",
    title: "Interactive Charts & Dashboards",
    desc: "Transform dry rows and columns into interactive dashboards using pivot tables and slicing tools for stakeholders.",
    topics: ["Pivot Tables", "Pivot Charts", "Interactive Slicers", "KPI Card Design", "Conditional Formatting Rules", "Dynamic Executive Dashboards"]
  },
  {
    id: 4,
    category: "python",
    title: "Core Python Programming",
    desc: "Learn the fundamentals of Python programming, the golden language of modern data science, starting from complete scratch.",
    topics: ["Variables & Primitive Types", "Control Flow (Loops/Conditionals)", "List & Dict Comprehensions", "User-Defined Functions & Lambdas", "File Input/Output", "Object-Oriented Programming (OOP)"]
  },
  {
    id: 5,
    category: "python",
    title: "Data Manipulation (Pandas & NumPy)",
    desc: "Load, filter, clean, and combine large files and tabular datasets using Python's powerhouses: Pandas and NumPy.",
    topics: ["Multi-dimensional NumPy Arrays", "Pandas Series & DataFrames", "Handling Missing & Null Data", "Groupby & Data Aggregation", "Merging, Joining & Concatenating", "Datetime Analysis"]
  },
  {
    id: 6,
    category: "python",
    title: "Visual Storytelling in Python",
    desc: "Design and export publication-ready plots and statistical charts to discover visual patterns and present reports.",
    topics: ["Matplotlib Core API", "Seaborn Statistical Plots", "Heatmaps & Correlation Grids", "Distributions & Outlier Boxplots", "Chart Themes & Style Sheets", "Exporting Vector Figures"]
  },
  {
    id: 7,
    category: "python",
    title: "Database Querying & SQL",
    desc: "Connect Python to databases, manage data schemas, and write highly optimized SQL queries for production.",
    topics: ["Relational Database Schemas", "SELECT, WHERE & ORDER BY", "Inner, Left, Right & Outer JOINS", "Aggregations with GROUP BY", "Window Functions (RANK, ROW_NUMBER)", "Python SQL Connectors (sqlite3)"]
  },
  {
    id: 8,
    category: "python",
    title: "Applied Business Statistics",
    desc: "Apply the fundamentals of probability theory, hypothesis testing, and regression modeling to validate business decisions.",
    topics: ["Probability Distributions", "Hypothesis Testing (t-tests, chi-sq)", "P-values & Confidence Intervals", "A/B Testing Implementation", "Correlation vs. Causation", "Analysis of Variance (ANOVA)"]
  },
  {
    id: 9,
    category: "ml",
    title: "Supervised & Unsupervised ML",
    desc: "Learn to build, train, evaluate, and tune classical machine learning models for classification, regression, and grouping.",
    topics: ["Linear & Logistic Regression", "Decision Trees & Ensemble Methods", "Random Forests & XGBoost", "Support Vector Machines (SVM)", "K-Means & Hierarchical Clustering", "Cross-Validation & Hyperparameter Tuning"]
  },
  {
    id: 10,
    category: "ml",
    title: "NLP & Text Mining",
    desc: "Convert text data into numerical features and build machine learning models to analyze sentiment and classify text.",
    topics: ["Tokenization & Stopword Removal", "Stemming & Lemmatization", "Bag of Words & TF-IDF Vectorization", "N-grams & Phrase Models", "Text Classification Models", "Sentiment Analysis (NLTK/SpaCy)"]
  },
  {
    id: 11,
    category: "ml",
    title: "Neural Networks & Deep Learning",
    desc: "Build deep neural networks and sequential models to handle complex image and sequence datasets using TensorFlow.",
    topics: ["Multi-Layer Perceptrons (MLP)", "Backpropagation & Optimizers", "Activation Functions (ReLU, Softmax)", "Convolutional Neural Networks (CNN)", "Recurrent Networks & LSTMs", "TensorFlow & Keras API Basics"]
  },
  {
    id: 12,
    category: "genai",
    title: "Generative AI & LLMs",
    desc: "Harness the power of foundational LLMs, build custom prompt pipelines, and deploy context-aware Retrieval Augmented Generation (RAG) agents.",
    topics: ["Prompt Engineering & Templates", "OpenAI & Anthropic API Integration", "LangChain & LlamaIndex Frameworks", "Vector Databases (Chroma/Pinecone)", "RAG (Retrieval Augmented Generation) Pipelines", "Autonomous AI Agents & Tools"]
  }
];

// State Management
let currentFilter = "all";
let searchQuery = "";
const enrolledStudentsKey = "insidefactz_enrolled_list";

// DOM Element Selectors
document.addEventListener("DOMContentLoaded", () => {
  initRouter();
  initModal();
  initExplorer();
  initEnrollmentForm();
  
  // Set default view on load
  handleRouting();
});

// ========================================================
// 2. SPA ROUTER SYSTEM
// ========================================================
function initRouter() {
  window.addEventListener("hashchange", handleRouting);
  
  // Navigation active links behavior
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetHash = link.getAttribute("href");
      window.location.hash = targetHash;
    });
  });
}

function handleRouting() {
  const hash = window.location.hash || "#home";
  
  // Update view classes
  const sections = document.querySelectorAll(".view-section");
  sections.forEach(sec => {
    sec.classList.remove("active");
  });
  
  const targetSection = document.querySelector(hash);
  if (targetSection) {
    targetSection.classList.add("active");
  } else {
    document.querySelector("#home").classList.add("active");
  }
  
  // Update navbar links active status
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    if (link.getAttribute("href") === hash) {
      link.classList.add("active");
    } else {
      link.classList.remove("remove");
      link.classList.remove("active");
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "instant" });
  
  // Specific view actions
  if (hash === "#home") {
    animateCounters();
  }
}

// ========================================================
// 3. STATS COUNT-UP ANIMATION
// ========================================================
function animateCounters() {
  const statsElements = [
    { id: "stat-tracks", target: 4, labelSuffix: "" },
    { id: "stat-modules", target: 28, labelSuffix: "+" },
    { id: "stat-topics", target: 120, labelSuffix: "+" },
    { id: "stat-projects", target: 100, labelSuffix: "%" }
  ];

  statsElements.forEach(stat => {
    const el = document.getElementById(stat.id);
    if (!el) return;
    
    // Check if animation has already run
    if (el.dataset.animated === "true") return;
    el.dataset.animated = "true";

    let count = 0;
    const duration = 1200; // ms
    const stepTime = Math.max(Math.floor(duration / stat.target), 10);
    
    const timer = setInterval(() => {
      const increment = Math.ceil(stat.target / (duration / stepTime));
      count += increment;
      if (count >= stat.target) {
        count = stat.target;
        clearInterval(timer);
      }
      el.textContent = count + stat.labelSuffix;
    }, stepTime);
  });
}

// ========================================================
// 4. CURRICULUM EXPLORER SEARCH & FILTER
// ========================================================
function initExplorer() {
  const searchInput = document.getElementById("module-search");
  const filterPills = document.querySelectorAll(".filter-pill");
  
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderModules();
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentFilter = pill.dataset.filter;
      renderModules();
    });
  });

  renderModules();
}

function renderModules() {
  const accordionContainer = document.getElementById("modules-accordion");
  if (!accordionContainer) return;

  // Filter modules
  const filtered = curriculumData.filter(module => {
    const matchesCategory = currentFilter === "all" || module.category === currentFilter;
    const matchesSearch = module.title.toLowerCase().includes(searchQuery) ||
                          module.desc.toLowerCase().includes(searchQuery) ||
                          module.topics.some(t => t.toLowerCase().includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    accordionContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--color-text-gray); border: 1px dashed rgba(247, 245, 239, 0.1); border-radius: var(--border-radius-md);">
        <p style="font-size: 1.2rem; margin-bottom: 0.5rem; font-family: var(--font-serif); font-style: italic;">No modules match your current filter or search criteria.</p>
        <p style="font-size: 0.9rem;">Try adjusting the keyword or selection tags above.</p>
      </div>
    `;
    return;
  }

  accordionContainer.innerHTML = filtered.map(module => {
    let trackLabelClass = "";
    let trackLabelText = "";
    
    switch (module.category) {
      case "excel":
        trackLabelClass = "track-tag-excel";
        trackLabelText = "Track 1: Excel";
        break;
      case "python":
        trackLabelClass = "track-tag-python";
        trackLabelText = "Track 2: Python & Data Science";
        break;
      case "ml":
        trackLabelClass = "track-tag-ml";
        trackLabelText = "Track 3: Machine Learning";
        break;
      case "genai":
        trackLabelClass = "track-tag-genai";
        trackLabelText = "Track 4: Generative AI";
        break;
    }

    const pillsHtml = module.topics.map(topic => `
      <span class="topic-pill">${topic}</span>
    `).join("");

    return `
      <div class="module-accordion-item" id="module-card-${module.id}">
        <div class="module-accordion-header" onclick="toggleAccordion(${module.id})">
          <div class="module-meta-left">
            <div class="module-number-badge">M${module.id.toString().padStart(2, '0')}</div>
            <div>
              <span class="module-header-track-tag ${trackLabelClass}">${trackLabelText}</span>
              <h3 class="module-header-title">${module.title}</h3>
            </div>
          </div>
          <svg class="module-arrow-icon" viewBox="0 0 24 24">
            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
          </svg>
        </div>
        <div class="module-accordion-content" id="module-content-${module.id}">
          <div class="module-content-inner">
            <div class="module-desc-col">
              <p class="module-description">${module.desc}</p>
            </div>
            <div class="module-topics-list-container">
              <h4>Topics Covered</h4>
              <div class="module-topics-pills">
                ${pillsHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Global scope toggle because it's called from inline HTML string
window.toggleAccordion = function(moduleId) {
  const allItems = document.querySelectorAll(".module-accordion-item");
  const targetItem = document.getElementById(`module-card-${moduleId}`);
  const targetContent = document.getElementById(`module-content-${moduleId}`);
  
  if (!targetItem || !targetContent) return;

  const isOpen = targetItem.classList.contains("open");

  // Close all other items
  allItems.forEach(item => {
    item.classList.remove("open");
    const content = item.querySelector(".module-accordion-content");
    if (content) {
      content.style.maxHeight = null;
    }
  });

  // Toggle clicked item
  if (!isOpen) {
    targetItem.classList.add("open");
    // Since max-height needs an exact value for CSS transition, we calculate it dynamically
    // Scroll height gives total height of content inside the container
    targetContent.style.maxHeight = (targetContent.scrollHeight + 40) + "px";
  } else {
    targetItem.classList.remove("open");
    targetContent.style.maxHeight = null;
  }
};

// Expose track selection helper (called from Track Cards to switch view & filter)
window.selectTrackFilter = function(trackName) {
  window.location.hash = "#explorer";
  
  // Wait short moment for routing to finish rendering DOM, then filter
  setTimeout(() => {
    const pill = document.querySelector(`.filter-pill[data-filter="${trackName}"]`);
    if (pill) {
      pill.click();
    }
  }, 100);
};

// ========================================================
// 5. REGISTRATION MODAL
// ========================================================
function initModal() {
  const modalOverlay = document.getElementById("enroll-modal");
  const closeBtn = document.getElementById("close-modal");
  
  // Global helpers to open modal
  window.openEnrollModal = function(selectedTrack = "") {
    if (!modalOverlay) return;
    
    // Autofill dropdown if track is selected
    if (selectedTrack) {
      const selectTrack = document.getElementById("form-track");
      if (selectTrack) {
        selectTrack.value = selectedTrack;
      }
    }
    
    // Reset form display states
    document.getElementById("enrollment-form").style.display = "block";
    document.getElementById("success-view").classList.remove("active");
    
    modalOverlay.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  window.closeEnrollModal = function() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("open");
    document.body.style.overflow = ""; // Re-enable background scrolling
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", closeEnrollModal);
  }

  // Close modal when clicking outside of it
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeEnrollModal();
      }
    });
  }
}

// ========================================================
// 6. ENROLLMENT FORM SUBMISSION
// ========================================================
function initEnrollmentForm() {
  const form = document.getElementById("enrollment-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Extract inputs
    const fullName = document.getElementById("form-name").value;
    const email = document.getElementById("form-email").value;
    const phone = document.getElementById("form-phone").value;
    const track = document.getElementById("form-track").value;
    const experience = document.getElementById("form-experience").value;

    const studentInfo = {
      fullName,
      email,
      phone,
      track,
      experience,
      date: new Date().toISOString()
    };

    // Save mock database inside SessionStorage
    let list = JSON.parse(sessionStorage.getItem(enrolledStudentsKey)) || [];
    list.push(studentInfo);
    sessionStorage.setItem(enrolledStudentsKey, JSON.stringify(list));

    // Construct Email Content
    let trackLabel = track;
    switch(track) {
      case "excel": trackLabel = "Track 1: Excel Foundations"; break;
      case "python": trackLabel = "Track 2: Python & Data Science"; break;
      case "ml": trackLabel = "Track 3: Machine Learning"; break;
      case "genai": trackLabel = "Track 4: Generative AI"; break;
    }

    const emailSubject = `InsideFactz Academy Enrollment Request - ${fullName}`;
    const emailBody = `Hello InsideFactz Admissions,\n\nI would like to request enrollment in InsideFactz Training Institute.\n\nMy Details:\n----------------------------------------\n* Full Name: ${fullName}\n* Email Address: ${email}\n* Phone Number: ${phone}\n* Selected Program Track: ${trackLabel}\n* Python/Coding Experience: ${experience}\n----------------------------------------\n\nPlease let me know the upcoming batch schedule and onboarding details.\n\nBest regards,\n${fullName}`;

    // Create Gmail Web Compose URL
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=insidefactz2017@gmail.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Create Default Mail Client Mailto URL
    const mailtoUrl = `mailto:insidefactz2017@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Set links on success screen buttons
    const gmailBtn = document.getElementById("success-gmail-btn");
    const mailtoBtn = document.getElementById("success-mailto-btn");

    if (gmailBtn) gmailBtn.setAttribute("href", gmailComposeUrl);
    if (mailtoBtn) mailtoBtn.setAttribute("href", mailtoUrl);

    // Show success dialog
    form.reset();
    form.style.display = "none";
    document.getElementById("success-view").classList.add("active");
    
    // Log info in console for testing verification
    console.log("New registration completed: ", studentInfo);
  });
}
