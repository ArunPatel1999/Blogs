let allBlogPosts = [];
let filteredPosts = [];
let currentCategory = 'All';

async function loadMarkdown(filename) {
    try {
        const response = await fetch(`/posts/${filename}`);
        const text = await response.text();
        return marked.parse(text);
    } catch (error) {
        return '<p>Error loading blog post.</p>';
    }
}

async function loadBlogMeta(filename, category) {
    try {
        const response = await fetch(`/posts/${filename}`);
        const text = await response.text();
        
        // Check if response is HTML error page
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            return { 
                filename, 
                title: filename.replace('.md', '').replace(/-/g, ' '), 
                excerpt: 'File not found on server.',
                category 
            };
        }
        
        const lines = text.split('\n');
        const title = lines.find(line => line.startsWith('#'))?.replace('#', '').trim() || filename.replace('.md', '').replace(/-/g, ' ');
        
        // Get excerpt from first meaningful paragraph
        let excerpt = 'No description available.';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('```') && line.length > 20) {
                excerpt = line;
                break;
            }
        }
        
        const imageMatch = text.match(/!\[.*?\]\((.*?)\)/);
        const image = imageMatch ? imageMatch[1] : null;
        return { filename, title, excerpt, category, image };
    } catch (error) {
        return { 
            filename, 
            title: filename.replace('.md', '').replace(/-/g, ' '), 
            excerpt: 'Error loading post.',
            category 
        };
    }
}

function showBlogList() {
    document.getElementById('blog-list').style.display = 'block';
    document.getElementById('blog-content').style.display = 'none';
    document.getElementById('not-found').style.display = 'none';
}

function showNotFound(message = 'Page not found') {
    document.getElementById('blog-list').style.display = 'none';
    document.getElementById('blog-content').style.display = 'none';
    document.getElementById('not-found').style.display = 'block';
    document.getElementById('not-found-message').textContent = message;
}

async function showBlogPost(filename) {
    try {
        const response = await fetch(`/posts/${filename}`);
        if (!response.ok) {
            showNotFound(`Blog post "${filename}" not found`);
            return;
        }
        const content = await loadMarkdown(filename);
        document.getElementById('content').innerHTML = content;
        document.getElementById('blog-list').style.display = 'none';
        document.getElementById('blog-content').style.display = 'none';
        document.getElementById('not-found').style.display = 'none';
        document.getElementById('blog-content').style.display = 'block';
    } catch (error) {
        showNotFound(`Error loading blog post "${filename}"`);
        return;
    }
    
    setTimeout(() => {
        document.querySelectorAll('pre').forEach(pre => {
            if (!pre.querySelector('.copy-btn')) {
                const container = document.createElement('div');
                container.className = 'code-container';
                pre.parentNode.insertBefore(container, pre);
                container.appendChild(pre);
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.textContent = 'Copy';
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(pre.textContent);
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => copyBtn.textContent = 'Copy', 2000);
                };
                container.appendChild(copyBtn);
            }
        });
        Prism.highlightAll();
    }, 100);
}

function renderBlogGrid(posts) {
    const grid = document.getElementById('blogGrid');
    const noResults = document.getElementById('noResults');
    
    // Always clear the grid first
    grid.innerHTML = '';
    
    if (posts.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Create cards individually to avoid nesting issues
    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'blog-card';
        
        if (post.image) {
            card.style.backgroundImage = `url(${post.image})`;
            card.classList.add('has-background');
        }
        
        const title = document.createElement('h3');
        title.textContent = post.title;
        
        const meta = document.createElement('div');
        meta.className = 'blog-meta';
        const categoryName = getMenuName(post.category) || 'Unknown';
        meta.textContent = `📁 ${categoryName}`;
        
        const excerpt = document.createElement('div');
        excerpt.className = 'blog-excerpt';
        excerpt.textContent = post.excerpt;
        
        card.onclick = () => showBlogPost(post.filename);
        
        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(excerpt);
        
        grid.appendChild(card);
    });
}

function filterPosts(query) {
    let postsToFilter = currentCategory === 'All' ? allBlogPosts : allBlogPosts.filter(post => post.category === currentCategory);
    
    if (!query.trim()) {
        filteredPosts = [...postsToFilter];
    } else {
        filteredPosts = postsToFilter.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
            post.filename.toLowerCase().includes(query.toLowerCase()) ||
            (post.category && post.category.toLowerCase().includes(query.toLowerCase()))
        );
    }
    renderBlogGrid(filteredPosts);
}

function findMenuPath(menuId, structure = menuStructure, path = []) {
    for (const menu of structure) {
        if (menu.id === menuId) {
            return [...path, menu.id].join('/');
        }
        if (menu.subMenu && menu.subMenu.length > 0) {
            const found = findMenuPath(menuId, menu.subMenu, [...path, menu.id]);
            if (found) return found;
        }
    }
    return null;
}

function findMenuIdFromPath(path, structure = menuStructure, currentPath = []) {
    for (const menu of structure) {
        const fullPath = [...currentPath, menu.id].join('/');
        if (fullPath === path) {
            return menu.id;
        }
        if (menu.subMenu && menu.subMenu.length > 0) {
            const found = findMenuIdFromPath(path, menu.subMenu, [...currentPath, menu.id]);
            if (found) return found;
        }
    }
    return null;
}

function getMenuPath(menuId) {
    if (menuId === 'All') return '';
    return findMenuPath(menuId) || menuId;
}

function getMenuIdFromPath(path) {
    if (!path) return 'All';
    return findMenuIdFromPath(path) || 'All';
}

function getMenuName(menuId, structure = menuStructure) {
    if (menuId === 'All') return 'All';
    
    for (const menu of structure) {
        if (menu.id === menuId) {
            return menu.name;
        }
        if (menu.subMenu && menu.subMenu.length > 0) {
            const found = getMenuName(menuId, menu.subMenu);
            if (found && found !== menuId) return found;
        }
    }
    return menuId; // fallback to ID if name not found
}

function highlightMenuPath(menuId) {
    // Clear all active states
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active'));
    
    if (menuId === 'All') {
        const allBtn = document.querySelector('[data-category="All"]');
        if (allBtn) allBtn.classList.add('active');
        return;
    }
    
    // Get the full path and highlight all parent menus
    const menuPath = getMenuPath(menuId);
    if (!menuPath) return;
    
    const pathParts = menuPath.split('/');
    
    // Highlight each level in the path
    pathParts.forEach(part => {
        // Find and highlight the element for this part
        const element = document.querySelector(`[data-category="${part}"]`);
        if (element) {
            element.classList.add('active');
        }
        
        // Also look for elements with onclick containing this part
        const clickElement = document.querySelector(`[onclick*="filterByMenuId('${part}')"]`);
        if (clickElement) {
            clickElement.classList.add('active');
        }
    });
}

function filterByMenuId(menuId) {
    currentCategory = menuId;
    
    // Highlight the selected menu path
    highlightMenuPath(menuId);
    
    // Update URL with hierarchical path
    const menuPath = getMenuPath(menuId);
    const url = menuPath ? `${window.location.origin}/${menuPath}` : window.location.origin;
    window.history.pushState({ category: menuId }, '', url);
    
    filterPosts(document.getElementById('searchInput').value);
}

// Keep old function for backward compatibility
function filterByCategory(category) {
    filterByMenuId(category);
}

function renderHierarchicalMenu() {
    const menuHtml = buildHorizontalMenu(menuStructure);
    document.getElementById('hierarchicalMenu').innerHTML = menuHtml;
}

function toggleTheme() {
    const body = document.body;
    const button = document.querySelector('.theme-toggle');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        button.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        button.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

async function initBlog() {
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.querySelector('.theme-toggle').textContent = '☀️';
    }
    
    // Load blog posts from blogPostsData
    const allPosts = await Promise.all(blogPostsData.map(post => loadBlogMeta(post.filePath, post.menuId)));
    
    allBlogPosts = allPosts;
    filteredPosts = [...allBlogPosts];
    
    // Render hierarchical menu and blog grid
    renderHierarchicalMenu();
    
    // Check URL path for category
    const currentPath = window.location.pathname.substring(1); // Remove leading slash
    const categoryFromUrl = getMenuIdFromPath(currentPath);
    
    if (currentPath && categoryFromUrl === 'All') {
        // Invalid URL path
        showNotFound(`Category "${currentPath}" not found`);
    } else if (categoryFromUrl !== 'All') {
        filterByMenuId(categoryFromUrl);
    } else {
        renderBlogGrid(filteredPosts);
    }
    
    // Setup search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterPosts(e.target.value);
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        const category = event.state?.category || 'All';
        filterByMenuId(category);
    });
}

initBlog();