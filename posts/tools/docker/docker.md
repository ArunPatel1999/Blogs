# Docker Commands

![Docker Logo](https://www.docker.com/wp-content/uploads/2022/03/horizontal-logo-monochromatic-white.png)

A comprehensive guide to Docker commands covering container management, images, volumes, networking, and more.

## Container Lifecycle Management

### Basic Container Operations
```bash
# View Docker version
docker -v

# List all images
docker images

# Pull an image
docker pull name:version

# Search for images
docker search name

# Run a container
docker run name

# List running containers
docker ps

# List all containers (running and stopped)
docker ps -a
```

### Container Control
```bash
# Stop a container
docker stop name:id

# Stop all containers
docker stop $(docker ps -aq)

# Remove a container
docker rm id

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Restart a container
docker restart name
```

## Advanced Container Operations

### Interactive Mode
```bash
# Run container in interactive mode with terminal
docker run --name nameOfContainer -it -d name

# Execute commands inside running container
docker exec -it containerId/name COMMAND

# Get terminal access
docker exec -it containerId/name {sh, bash, powershell, zsh}

# Run image with shell access
docker run -it image sh
```

### Container Management
```bash
# Run container and remove automatically when stopped
docker run --rm name

# Create container without starting
docker container create ubuntu sleep 60

# Start a created container
docker container start container_name

# Attach to running container (foreground)
docker attach container_name

# Pause/unpause container
docker pause container_name
docker unpause container_name

# Remove all non-running containers
docker container prune
```

## Container Information & Monitoring

### Inspection Commands
```bash
# Get detailed container information
docker inspect id

# View container logs
docker logs name

# Follow log output in real-time
docker logs name -f

# View image build history
docker history image_id

# Show running processes inside container
docker top container_name

# Display container resource usage statistics
docker container stats

# Show file system changes
docker container diff container_name

# Rename container
docker rename old_name new_name

# Scan for vulnerabilities
docker scout cves image_name
```

## Image Management

### Creating Images
```bash
# Create image from container
docker commit container_name imageName:version

# Tag an image
docker image tag nginx:latest mynginx:1.0

# Build image from Dockerfile
docker build -t imagename .

# Build with custom Dockerfile name
docker build -t imagename -f Dockerfile-dev .
```

### Import/Export Operations
```bash
# Export container to tar file
docker container export container_name > filename.tar

# Import tar file as image
docker image import filename.tar image_name

# Save image to tar file
docker save -o filename.tar container_name

# Load image from tar file
docker load -i filename.tar
```

## Volume Management

### Volume Operations
```bash
# Run with volume (bind mount)
docker run -v "host_path:container_path:permissions" image

# Mount with read-only permission
docker run -v "host_path:container_path:ro" image

# Share volumes between containers
docker run -itd --name container_name --volumes-from another_container_name image

# Bind mount with detailed options
docker run -itd --name co_name --mount type=bind,source=/home/...,target=/app,readonly image_name
```

## Networking

### Network Commands
```bash
# List networks
docker network ls

# Create custom network
docker network create --driver=bridge --subnet=192.168.2.0/24 --gateway=192.168.2.10 test

# Connect container to network
docker network connect network_name container_name

# Disconnect container from network
docker network disconnect network_name container_name

# Run container with specific network
docker run --network network_name image
```

### Port Mapping
```bash
# Map container port to host port
docker run -p host_port:container_port image

# Map to specific port
docker run -p 9090:9090 image

# Publish all exposed ports to random ports
docker run -P image
```

## Docker Hub & Registry

### Docker Hub Operations
```bash
# Login to Docker Hub
docker login

# Push image to Docker Hub
docker push image_name

# Logout
docker logout
```

### Private Registry
```bash
# Pull registry image
docker pull registry

# Run private registry
docker run --name my_registry -d -p 5000:5000 registry

# Tag image for private registry
docker tag nginx:latest 127.0.0.1:5000/nginx:latest

# Push to private registry
docker push 127.0.0.1:5000/nginx:latest

# Pull from private registry
docker pull 127.0.0.1:5000/nginx

# View registry catalog
# Visit: http://localhost:5000/v2/_catalog
```

### Registry Configuration
For allowing external IP access, create `/etc/docker/daemon.json`:
```json
{
    "insecure-registries": ["ip_address:port_number"]
}
```

## Dockerfile Instructions

### Essential Dockerfile Commands
```dockerfile
FROM ubuntu:latest          # Base image
USER username               # Set user
RUN apt-get update          # Execute commands
WORKDIR /app               # Set working directory
COPY source destination    # Copy files
ADD url destination        # Add files (supports URLs)
ENV KEY=value             # Environment variables
LABEL key=value           # Metadata
EXPOSE 8080               # Expose ports
ENTRYPOINT ["executable"] # Entry point
CMD ["param1", "param2"]  # Default command
ARG BUILD_ARG            # Build arguments
```

## Docker REST API

### API Configuration
```bash
# Edit Docker service file
vim /lib/systemd/system/docker.service

# Change ExecStart line to:
ExecStart=... fd:// -H=tcp://Current_PC_IP:port

# Reload and restart
systemctl daemon-reload
service docker restart

# Use API from remote machine
DOCKER_HOST=192.168.0.109:2375 docker images
```

## Common Run Options

### Frequently Used Flags
```bash
-d, --detach                    # Run in background
-e, --env                       # Set environment variables
--env-file                      # Read environment from file
--expose                        # Expose ports
--health-cmd                    # Health check command
-m, --memory                    # Memory limit
--memory-reservation            # Memory soft limit
--name                          # Container name
-p, --publish                   # Port mapping
-P, --publish-all              # Publish all ports
--rm                           # Auto-remove on exit
-v, --volume                   # Volume mounting
-it                            # Interactive terminal
```

## System Cleanup

### Cleanup Commands
```bash
# Remove all stopped containers
docker container prune

# Remove unused images, containers, networks
docker system prune

# Force remove all running containers
docker rm -f $(docker container ls -a -q)

# Remove all images
docker rmi $(docker image ls -a -q)
```

## File Operations

### Copy Files
```bash
# Copy from container to host
docker cp container_name:/path/to/file /host/path/

# Copy from host to container
docker cp /host/path/file container_name:/path/to/
```

## Key Differences

### CMD vs ENTRYPOINT
- **CMD**: Can be overridden when running container
- **ENTRYPOINT**: Commands are appended to entry point

### Container States
- **Created**: Container exists but not started
- **Running**: Container is actively running
- **Stopped**: Container has stopped
- **Paused**: Container is paused

This guide covers the essential Docker commands for container management, image handling, networking, and deployment operations.