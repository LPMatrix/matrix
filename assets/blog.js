document.addEventListener('DOMContentLoaded', function() {
  // RSS feed URL - replace with your actual RSS feed URL
  const rssFeed = 'https://matrix.hashnode.dev/rss.xml';
  
  // Use a CORS proxy if needed (for production, set up your own proxy)
  const rssFeedUrl = `http://www.whateverorigin.org/get?url=` + encodeURIComponent(rssFeed);
  
  // Fetch the RSS feed
  fetchRSSFeed(rssFeedUrl);
  
  /**
   * Fetches and parses the RSS feed
   * @param {string} url - The URL of the RSS feed
   */
  async function fetchRSSFeed(url) {
    try {
      // Show loading state
      showLoadingState();
      
      // Fetch the RSS feed (with CORS proxy if needed)
      const response = await fetch(url);
      const xmlText = await response.text();
      
      // Parse the XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      console.log(xmlText);
      
      // Process the feed
      const posts = processRSSFeed(xmlDoc);
      
      // Display the posts
      displayPosts(posts);
      
      // Initialize the featured post
      if (posts.length > 0) {
        displayFeaturedPost(posts[0]);
      }
      
      // Hide loading state
      hideLoadingState();
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      displayErrorMessage('Failed to load blog posts. Please try again later.');
      hideLoadingState();
    }
  }
  
  /**
   * Processes the RSS feed XML and extracts post data
   * @param {Document} xmlDoc - The parsed XML document
   * @returns {Array} - Array of post objects
   */
  function processRSSFeed(xmlDoc) {
    const items = xmlDoc.querySelectorAll('item');
    const posts = [];
    
    items.forEach((item, index) => {
      // Extract data from the RSS item
      const title = getElementText(item, 'title');
      const link = getElementText(item, 'link');
      const pubDate = getElementText(item, 'pubDate');
      const description = getElementText(item, 'description');
      const content = getElementText(item, 'content:encoded') || description;
      
      // Extract the first image from content if available
      const imageUrl = extractFirstImage(content) || 'assets/img/blog-' + ((index % 6) + 1) + '.jpg';
      
      // Extract categories/tags
      const categories = [];
      item.querySelectorAll('category').forEach(category => {
        categories.push(category.textContent);
      });
      
      // Format the date
      const date = formatDate(pubDate);
      
      // Calculate estimated reading time (roughly 200 words per minute)
      const wordCount = content.split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));
      
      // Create excerpt (first ~150 characters of content without HTML)
      const excerpt = createExcerpt(description || content);
      
      // Add the post to our array
      posts.push({
        id: index + 1,
        title: title,
        link: link,
        date: date,
        content: content,
        excerpt: excerpt,
        image: imageUrl,
        category: categories.length > 0 ? categories[0] : 'General',
        tags: categories,
        readTime: readTime,
        author: "Mubaraq Sanusi"  // Default author or extract from RSS if available
      });
    });
    
    return posts;
  }
  
  /**
   * Displays the posts in the grid
   * @param {Array} posts - Array of post objects
   */
  function displayPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) {
      console.error('Posts container not found');
      return;
    }
    
    // Clear existing content
    postsContainer.innerHTML = '';
    
    // Add each post to the container
    posts.forEach(post => {
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);
    });
  }
  
  /**
   * Displays the featured post
   * @param {Object} post - The post object to feature
   */
  function displayFeaturedPost(post) {
    const featuredContainer = document.getElementById('featured-post');
    if (!featuredContainer) {
      console.error('Featured post container not found');
      return;
    }
    
    featuredContainer.innerHTML = `
      <div class="flex flex-col md:flex-row">
        <div class="md:w-1/2">
          <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
        </div>
        <div class="md:w-1/2 p-8 bg-gray-900">
          <div class="flex items-center mb-4">
            <span class="bg-accent/20 text-accent text-xs px-3 py-1 rounded-full">${post.category}</span>
            <span class="text-sm text-gray-400 ml-4">${post.date}</span>
          </div>
          <h3 class="text-2xl md:text-3xl font-bold mb-4">${post.title}</h3>
          <p class="text-text mb-6">${post.excerpt}</p>
          <a href="${post.link}" target="_blank" class="special-button bg-transparent border border-accent text-accent px-6 py-3 rounded-full hover:text-white transition-colors duration-300">Read Article</a>
        </div>
      </div>
    `;
  }
  
  /**
   * Creates a post element for the grid
   * @param {Object} post - The post object
   * @returns {HTMLElement} - The post element
   */
  function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'blog-card rounded-lg overflow-hidden shadow-lg stagger-fade-in hover:shadow-xl transition-shadow duration-300';
    
    postDiv.innerHTML = `
      <div class="relative overflow-hidden group">
        <img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110">
        <div class="absolute top-4 left-4">
          <span class="bg-accent/20 text-accent text-xs px-3 py-1 rounded-full">${post.category}</span>
        </div>
      </div>
      <div class="p-6 bg-gray-900">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm text-gray-400">${post.date}</span>
          <span class="text-sm text-gray-400">${post.readTime} min read</span>
        </div>
        <h3 class="text-xl font-bold mb-4">${post.title}</h3>
        <p class="text-text mb-6 line-clamp-3">${post.excerpt}</p>
        <a href="${post.link}" target="_blank" class="text-accent hover:underline">Read more</a>
      </div>
    `;
    
    return postDiv;
  }
  
  // Helper Functions
  
  /**
   * Gets text content of an XML element
   * @param {Element} parent - The parent element
   * @param {string} tagName - The tag name to find
   * @returns {string} - The text content or empty string
   */
  function getElementText(parent, tagName) {
    const element = parent.querySelector(tagName);
    return element ? element.textContent : '';
  }
  
  /**
   * Extracts the first image URL from HTML content
   * @param {string} content - HTML content
   * @returns {string|null} - Image URL or null
   */
  function extractFirstImage(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
  }
  
  /**
   * Creates an excerpt from HTML content
   * @param {string} content - HTML content
   * @returns {string} - Plain text excerpt
   */
  function createExcerpt(content) {
    // Remove HTML tags
    const plainText = content.replace(/<[^>]*>?/gm, '');
    // Limit to ~150 characters and add ellipsis if needed
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  }
  
  /**
   * Formats a date string
   * @param {string} dateString - Date string from RSS
   * @returns {string} - Formatted date
   */
  function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  /**
   * Shows loading state
   */
  function showLoadingState() {
    // Find loading indicator elements and show them
    const loadingElements = document.querySelectorAll('.loading-indicator');
    loadingElements.forEach(el => {
      el.style.display = 'block';
    });
  }
  
  /**
   * Hides loading state
   */
  function hideLoadingState() {
    // Find loading indicator elements and hide them
    const loadingElements = document.querySelectorAll('.loading-indicator');
    loadingElements.forEach(el => {
      el.style.display = 'none';
    });
  }
  
  /**
   * Displays an error message
   * @param {string} message - The error message
   */
  function displayErrorMessage(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
    } else {
      console.error(message);
    }
  }
  
  // Category filtering functionality
  const categoryButtons = document.querySelectorAll('.category-btn');
  
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      categoryButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-accent', 'text-white');
        btn.classList.add('border-gray-700');
        btn.classList.remove('border-accent');
      });
      
      // Add active class to clicked button
      this.classList.add('active', 'bg-accent', 'text-white');
      this.classList.remove('border-gray-700');
      this.classList.add('border-accent');
      
      // Filter logic would be implemented here
      // For now, let's log the selected category
      console.log('Selected category:', this.textContent.trim());
    });
  });
});