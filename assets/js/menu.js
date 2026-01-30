const menuStructure = [
    {
        id: null,
        name: 'All',
        subMenu: []
    },
    {
        id: 'JAVA',
        name: 'Java',
        subMenu: [
            {
                id: 'CORE_JAVA',
                name: 'Core Java',
                subMenu: []
            },
            {
                id: 'SPRING',
                name: 'Spring',
                subMenu: [
                    {
                        id: 'SPRING_BOOT',
                        name: 'Spring Boot',
                        subMenu: []
                    }
                ]
            }
        ]
    },
    {
        id: 'TOOLS',
        name: 'Tools',
        subMenu: [
            {
                id: 'DOCKER',
                name: 'Docker',
                subMenu: []
            }
        ]
    }
];

// This function will be used by blog.js to get posts from blogPosts.js
function getPostsFromBlogData() {
    return blogPostsData.map(post => ({
        filename: post.filePath,
        category: post.menuId,
        menuId: post.menuId,
        filePath: post.filePath
    }));
}

function buildHorizontalMenu(structure) {
    let html = '<div class="horizontal-menu">';
    
    structure.forEach(menu => {
        const hasChildren = menu.subMenu && menu.subMenu.length > 0;
        
        if (menu.name === 'All') {
            html += `<div class="menu-item-wrapper"><button class="menu-btn active" data-category="All" onclick="filterByMenuId('All')">${menu.name}</button></div>`;
        } else if (hasChildren) {
            html += `
                <div class="menu-item-wrapper">
                    <button class="menu-btn" data-category="${menu.id}">${menu.name}</button>
                    <div class="dropdown-menu">
                        ${buildDropdownContent(menu.subMenu)}
                    </div>
                </div>
            `;
        } else {
            html += `<div class="menu-item-wrapper"><button class="menu-btn" data-category="${menu.id}" onclick="filterByMenuId('${menu.id}')">${menu.name}</button></div>`;
        }
    });
    
    html += '</div>';
    return html;
}

function buildDropdownContent(subMenus) {
    let html = '';
    
    subMenus.forEach(menu => {
        const hasChildren = menu.subMenu && menu.subMenu.length > 0;
        
        if (!hasChildren) {
            html += `<div class="dropdown-item" data-category="${menu.id}" onclick="filterByMenuId('${menu.id}')">${menu.name}</div>`;
        } else {
            html += `
                <div class="dropdown-item-wrapper">
                    <div class="dropdown-item parent-item" data-category="${menu.id}" onclick="filterByMenuId('${menu.id}')">
                        ${menu.name} <span class="arrow">▶</span>
                    </div>
                    <div class="nested-dropdown">
                        ${buildDropdownContent(menu.subMenu)}
                    </div>
                </div>
            `;
        }
    });
    
    return html;
}



