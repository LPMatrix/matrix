document.addEventListener('DOMContentLoaded', function() {
  const HASHNODE_PUBLICATION_URL = 'https://matrix.hashnode.dev';
  const RSS_FEED_URL = `${HASHNODE_PUBLICATION_URL}/rss.xml`;

  const feedUrls = [
    RSS_FEED_URL,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_FEED_URL)}`,
    `https://corsproxy.io/?${encodeURIComponent(RSS_FEED_URL)}`
  ];

  const fallbackPosts = [
    ['Jan 15, 2026', 'Building a Text-to-SQL RAG System: From Documentation to Databases', 'building-a-text-to-sql-rag-system-from-documentation-to-databases', 'AI'],
    ['Jan 11, 2026', 'Building a RAG System for Laravel Documentation: A Local-First Approach', 'building-a-rag-system-for-laravel-documentation-a-local-first-approach', 'AI'],
    ['Jun 13, 2025', 'Exploring Withdrawal Functionality in Financial Applications', 'exploring-withdrawal-functionality-in-financial-applications', 'Web Development'],
    ['Jun 2, 2025', 'Exploring 0Xprocessing', 'exploring-0xprocessing', 'Web Development'],
    ['Mar 6, 2025', "Mistral AI: A Promising Partner for Nigeria's Technological Future", 'mistral-ai-a-promising-partner-for-nigerias-technological-future', 'AI'],
    ['Aug 30, 2023', 'Building a Robust Software: Essential Environments Explained', 'building-a-robust-software-essential-environments-explained', 'DevOps'],
    ['Aug 28, 2023', 'Rethinking Development Branches: Strategies for Scalable Software Development', 'rethinking-development-branches-strategies-for-scalable-software-development', 'DevOps'],
    ['Aug 22, 2023', 'Crafting a Blameless Postmortem Document: Learning from Incidents', 'crafting-a-blameless-postmortem-document-learning-from-incidents', 'DevOps'],
    ['Aug 19, 2023', 'A Glimpse into My typical Week at a Startup: Meetings', 'a-glimpse-into-my-typical-week-at-a-startup-meetings', 'Web Development'],
    ['Aug 16, 2023', 'Mono Repository vs. Individual Repositories: Weighing Code Organization Strategies', 'mono-repository-vs-individual-repositories-weighing-code-organization-strategies', 'DevOps'],
    ['Aug 11, 2023', 'Building API as a Service: Simplifying Development and Integration', 'building-api-as-a-service-simplifying-development-and-integration', 'Web Development'],
    ['Aug 4, 2023', "Simplifying Operations with Tatum's Key Management System (KMS)", 'simplifying-operations-with-tatums-key-management-system-kms', 'Web Development'],
    ['Jul 29, 2023', 'Best Practices for Handling Transactions and Security in Financial Systems', 'best-practices-for-handling-transactions-and-security-in-financial-systems', 'Web Development'],
    ['Dec 31, 2022', 'A Comprehensive Guide to Threading in Python Programming', 'a-comprehensive-guide-to-threading-in-python-programming', 'Web Development'],
    ['Dec 21, 2022', 'Things to consider when building a fintech solution', 'things-to-consider-when-building-a-fintech-solution', 'Web Development'],
    ['Dec 16, 2022', 'Understanding the MVC Architecture with Laravel', 'understanding-the-mvc-architecture-with-laravel', 'Web Development'],
    ['Dec 8, 2022', 'API documentatin with Postman', 'api-documentatin-with-postman', 'Web Development'],
    ['Dec 3, 2022', 'Deploying a Laravel application to Digitalocean', 'deploying-a-laravel-application-to-digitalocean', 'DevOps'],
    ['Nov 2, 2022', 'Setting up a Laravel application', 'setting-up-a-laravel-application', 'Web Development'],
    ['Aug 11, 2022', 'Laravel Best Practices', 'laravel-best-practices', 'Web Development'],
    ['Jul 15, 2022', 'Retrospective with Mubaraq', 'retrospective-with-mubaraq', 'Web Development'],
    ['Dec 28, 2021', 'Web3 - What and Why', 'web3-what-and-why', 'Web Development'],
    ['Sep 7, 2021', 'Clean Code: Part II', 'clean-code-part-ii', 'Web Development'],
    ['Sep 7, 2021', 'Clean Code: Part I', 'clean-code-part-i', 'Web Development'],
    ['Apr 11, 2021', 'Bad programmers worry about the code. Good programmers worry about data structures and their relationships: Data Structures', 'bad-programmers-worry-about-the-code-good-programmers-worry-about-data-structures-and-their-relationships-data-structures', 'Web Development'],
    ['Apr 8, 2021', 'Divide and Conquer: Karatsuba Multiplication', 'divide-and-conquer-karatsuba-multiplication', 'Web Development'],
    ['Feb 11, 2021', 'The Web: Message queue', 'the-web-message-queue', 'Web Development'],
    ['Feb 6, 2021', 'The web: Caching', 'the-web-caching', 'Web Development'],
    ['Jan 29, 2021', 'The Web: Proxies', 'the-web-proxies', 'Web Development'],
    ['Jan 21, 2021', 'The Web: Web Servers', 'the-web-web-servers', 'Web Development'],
    ['Jan 18, 2021', 'The Web: TCP, UDP', 'the-web-tcp-udp', 'Web Development']
  ].map(([date, title, slug, category], index) => normalizePost({
    title,
    date,
    category,
    tags: [category],
    link: `${HASHNODE_PUBLICATION_URL}/${slug}`,
    excerpt: 'Read the full article on The Digital Matrix.'
  }, index));

  let allPosts = [];
  let filteredPosts = [];
  let selectedCategory = 'All';

  const postsContainer = document.getElementById('posts-container');
  const featuredContainer = document.getElementById('featured-post');
  const errorContainer = document.getElementById('error-container');
  const searchInput = document.getElementById('articleSearch');
  const categoryButtons = document.querySelectorAll('.category-btn');

  init();

  async function init() {
    showLoadingState();

    try {
      allPosts = mergePosts(await loadPostsFromFeed(), fallbackPosts);
      clearErrorMessage();
    } catch (error) {
      console.warn('Using fallback Hashnode posts:', error);
      allPosts = fallbackPosts;
      clearErrorMessage();
    }

    filteredPosts = allPosts;
    displayFeaturedPost(allPosts[0]);
    renderPosts();
    bindControls();
    hideLoadingState();
  }

  async function loadPostsFromFeed() {
    let lastError;

    for (const url of feedUrls) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Feed request failed with ${response.status}`);
        }

        const feedText = await response.text();
        const xmlText = unwrapProxyResponse(feedText);
        const posts = processRSSFeed(xmlText);

        if (posts.length > 0) {
          return posts;
        }
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('No posts found in Hashnode feed');
  }

  function unwrapProxyResponse(text) {
    const trimmedText = text.trim();

    if (!trimmedText.startsWith('{')) {
      return text;
    }

    try {
      const data = JSON.parse(trimmedText);
      return data.contents || data.data || text;
    } catch (error) {
      return text;
    }
  }

  function processRSSFeed(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('Hashnode feed returned invalid XML');
    }

    return Array.from(xmlDoc.querySelectorAll('item')).map((item, index) => {
      const title = getElementText(item, 'title');
      const link = getElementText(item, 'link');
      const pubDate = getElementText(item, 'pubDate');
      const description = getElementText(item, 'description');
      const content = getElementText(item, 'content\\:encoded') || getElementText(item, 'encoded') || description;
      const categories = Array.from(item.querySelectorAll('category')).map(category => category.textContent.trim()).filter(Boolean);
      const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;

      return normalizePost({
        title,
        link,
        date: formatDate(pubDate),
        excerpt: createExcerpt(description || content),
      category: categories[0] || 'General',
        tags: categories,
        readTime: Math.max(1, Math.ceil(wordCount / 200))
      }, index);
    }).filter(post => post.title && post.link);
  }

  function normalizePost(post, index) {
    return {
      id: index + 1,
      title: post.title || 'Untitled article',
      link: post.link || HASHNODE_PUBLICATION_URL,
      date: post.date || '',
      excerpt: post.excerpt || 'Read the full article on The Digital Matrix.',
      category: post.category || 'General',
      tags: post.tags || [],
      readTime: post.readTime || 1,
      author: 'Mubaraq Sanusi'
    };
  }

  function mergePosts(primaryPosts, secondaryPosts) {
    const postsByLink = new Map();

    [...primaryPosts, ...secondaryPosts].forEach(post => {
      if (!postsByLink.has(post.link)) {
        postsByLink.set(post.link, post);
      }
    });

    return Array.from(postsByLink.values());
  }

  function renderPosts() {
    if (!postsContainer) return;

    postsContainer.innerHTML = '';

    if (filteredPosts.length === 0) {
      postsContainer.innerHTML = `
        <div class="md:col-span-3 bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h3 class="text-2xl font-bold mb-3">No matching articles</h3>
          <p class="text-text">Try another search term or category.</p>
        </div>
      `;
    } else {
      filteredPosts.forEach(post => {
        postsContainer.appendChild(createPostElement(post));
      });
    }
  }

  function displayFeaturedPost(post) {
    if (!featuredContainer || !post) return;

    featuredContainer.innerHTML = `
      <div class="flex flex-col md:flex-row">
        <div class="w-full p-8 md:p-10 bg-gray-900">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="bg-accent/20 text-accent text-xs px-3 py-1 rounded-full">${escapeHtml(post.category)}</span>
            <span class="text-sm text-gray-400">${escapeHtml(post.date)}</span>
          </div>
          <h3 class="text-2xl md:text-3xl font-bold mb-4">${escapeHtml(post.title)}</h3>
          <p class="text-text mb-6">${escapeHtml(post.excerpt)}</p>
          <a href="${escapeAttribute(post.link)}" target="_blank" rel="noopener noreferrer" class="special-button bg-transparent border border-accent text-accent px-6 py-3 rounded-full hover:text-white transition-colors duration-300 inline-flex items-center gap-2">
            Read on Hashnode <i class="fas fa-arrow-up-right-from-square text-sm"></i>
          </a>
        </div>
      </div>
    `;
  }

  function createPostElement(post) {
    const postDiv = document.createElement('article');
    postDiv.className = 'blog-card rounded-lg overflow-hidden shadow-lg stagger-fade-in hover:shadow-xl transition-shadow duration-300';

    postDiv.innerHTML = `
      <div class="p-6 bg-gray-900">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span class="bg-accent/20 text-accent text-xs px-3 py-1 rounded-full">${escapeHtml(post.category)}</span>
          <span class="text-sm text-gray-400">${escapeHtml(post.date)}</span>
          <span class="text-sm text-gray-400">${escapeHtml(String(post.readTime))} min read</span>
        </div>
        <h3 class="text-xl font-bold mb-4">
          <a href="${escapeAttribute(post.link)}" target="_blank" rel="noopener noreferrer" class="hover:text-accent transition-colors duration-300">${escapeHtml(post.title)}</a>
        </h3>
        <p class="text-text mb-6 line-clamp-3">${escapeHtml(post.excerpt)}</p>
        <a href="${escapeAttribute(post.link)}" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline inline-flex items-center gap-2">
          Read more <i class="fas fa-arrow-up-right-from-square text-xs"></i>
        </a>
      </div>
    `;

    return postDiv;
  }

  function bindControls() {
    categoryButtons.forEach(button => {
      button.addEventListener('click', function() {
        categoryButtons.forEach(btn => {
          btn.classList.remove('active', 'bg-accent', 'text-white', 'border-accent');
          btn.classList.add('border-gray-700');
        });

        this.classList.add('active', 'bg-accent', 'text-white', 'border-accent');
        this.classList.remove('border-gray-700');

        selectedCategory = this.textContent.trim();
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        applyFilters();
      });
    }
  }

  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

    filteredPosts = allPosts.filter(post => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory || post.tags.includes(selectedCategory);
      const searchableText = `${post.title} ${post.excerpt} ${post.category} ${post.tags.join(' ')}`.toLowerCase();
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

      return matchesCategory && matchesSearch;
    });

    renderPosts();
  }

  function getElementText(parent, selector) {
    const element = parent.querySelector(selector);
    return element ? element.textContent.trim() : '';
  }

  function createExcerpt(content) {
    const plainText = stripHtml(content).replace(/\s+/g, ' ').trim();
    return plainText.length > 150 ? `${plainText.substring(0, 150)}...` : plainText;
  }

  function stripHtml(content) {
    return content.replace(/<[^>]*>?/gm, '');
  }

  function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function showLoadingState() {
    document.querySelectorAll('.loading-indicator').forEach(element => {
      element.style.display = 'block';
    });
  }

  function hideLoadingState() {
    document.querySelectorAll('.loading-indicator').forEach(element => {
      element.style.display = 'none';
    });
  }

  function displayErrorMessage(message) {
    if (!errorContainer) return;

    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  }

  function clearErrorMessage() {
    if (!errorContainer) return;

    errorContainer.textContent = '';
    errorContainer.style.display = 'none';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[character]));
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
});
