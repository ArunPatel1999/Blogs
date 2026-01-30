const blogPostsData = [
    { menuId: 'DOCKER', filePath: 'tools/docker/docker.md' },
    { menuId: 'DOCKER', filePath: 'tools/docker/docker-compose.md' },
    { menuId: 'DOCKER', filePath: 'tools/docker/docker-swarm.md' },
    { menuId: 'BIG_DATA', filePath: 'big-data/starburst.md' },
    { menuId: 'SPLUNK', filePath: 'tools/splunk/push-logs-in-splunk.md' },
    { menuId: 'SPLUNK', filePath: 'tools/splunk/read-splunk-data-using-query.md' },
    { menuId: 'SPARK', filePath: 'tools/spark/reused-spark-code.md' },
];

// Flatten all posts for backward compatibility
const blogFiles = blogPostsData.map(post => post.filePath);