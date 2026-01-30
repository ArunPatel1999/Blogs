# Docker Compose Commands

![Docker Compose Logo](https://www.couchbase.com/blog/wp-content/uploads/sites/1/2017/02/docker-compose.png)

A comprehensive guide to Docker Compose commands for managing multi-container applications.

## Basic Docker Compose Operations

### Project Management
```bash
# Start services in detached mode with project name
docker-compose -p projectname up -d

# Stop and remove containers, networks, and volumes
docker compose -p projectname down
```

### Custom Configuration Files
```bash
# Use custom compose file with various operations
docker compose -p projectname -f filenamepath up
docker compose -p projectname -f filenamepath down
docker compose -p projectname -f filenamepath create
docker compose -p projectname -f filenamepath start
docker compose -p projectname -f filenamepath stop
docker compose -p projectname -f filenamepath rm
docker compose -p projectname -f filenamepath pause
docker compose -p projectname -f filenamepath unpause
docker compose -p projectname -f filenamepath kill
```

## Scaling Services

### Service Scaling
```bash
# Scale a specific service to desired number of instances
docker-compose -p projectname up -d --scale service_name=runningCount+extra

# Example: Scale web service to 3 instances
docker-compose -p projectname up -d --scale web=3
```

## Building and Deployment

### Build and Run
```bash
# Build images and start services in detached mode
docker-compose -p projectname up --build -d
```

## Monitoring and Status

### Container Status
```bash
# List running containers for the compose project
docker-compose ps
```

## Docker Ignore Patterns

### .dockerignore Example
```
# Ignore all files except specific ones
*
!target/*.jar
!pom.xml
```

## Common Docker Compose Commands

### Essential Operations
```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs service_name

# Follow log output in real-time
docker-compose logs -f

# Execute command in running service
docker-compose exec service_name command

# Run one-off command
docker-compose run service_name command

# Pull latest images
docker-compose pull

# Validate compose file
docker-compose config

# List services
docker-compose ps --services
```

### Advanced Operations
```bash
# Start specific service
docker-compose start service_name

# Stop specific service
docker-compose stop service_name

# Restart services
docker-compose restart

# Remove stopped containers
docker-compose rm

# Force recreate containers
docker-compose up --force-recreate

# Build specific service
docker-compose build service_name
```

## Project Structure Best Practices

### Typical Directory Layout
```
project/
├── docker-compose.yml
├── .dockerignore
├── Dockerfile
├── src/
├── target/
└── pom.xml
```

### Environment Variables
```bash
# Use environment file
docker-compose --env-file .env up

# Override environment variables
docker-compose -e VARIABLE=value up
```

## Service Dependencies

### Managing Service Order
```yaml
# In docker-compose.yml
services:
  web:
    depends_on:
      - database
  database:
    image: postgres
```

## Volume and Network Management

### Volume Operations
```bash
# List volumes
docker-compose volume ls

# Remove volumes
docker-compose down -v
```

### Network Operations
```bash
# List networks
docker network ls

# Remove networks
docker-compose down --remove-orphans
```

## Troubleshooting

### Common Issues
```bash
# View service configuration
docker-compose config

# Check service health
docker-compose ps

# View detailed logs
docker-compose logs --details

# Remove everything and start fresh
docker-compose down -v --remove-orphans
docker-compose up --build
```

## Production Deployment

### Production Best Practices
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Update services without downtime
docker-compose up -d --no-deps service_name

# Health checks
docker-compose ps --filter "health=healthy"
```

This guide covers essential Docker Compose commands for managing multi-container applications efficiently.