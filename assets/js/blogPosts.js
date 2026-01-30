const blogPostsData = [
    { menuId: 'DOCKER', filePath: 'tools/docker/docker.md' },
    { menuId: 'DOCKER', filePath: 'tools/docker/docker-compose.md' },
    { menuId: 'DOCKER', filePath: 'tools/docker/docker-swarm.md' },
    { menuId: 'BIG_DATA', filePath: 'big-data/starburst.md' },
];

// Flatten all posts for backward compatibility
const blogFiles = blogPostsData.map(post => post.filePath);