# Docker Swarm Commands

![Docker Swarm Logo](https://cycle.io/images/blog/2024/03/docker-swarm-alternative-cycle/resources/images/hero.svg)

A comprehensive guide to Docker Swarm commands for orchestrating containerized applications across multiple nodes.

## Swarm Initialization

### Creating a Swarm Cluster
```bash
# Get Docker system information
docker info

# Initialize swarm mode (current node becomes manager)
docker swarm init

# Initialize swarm with specific advertise address
docker swarm init --advertise-addr 192.168.0.106
```

## Node Management

### Viewing and Managing Nodes
```bash
# List all nodes in the swarm (manager only)
docker node ls

# Get system information including swarm status
docker info

# Remove node from swarm (run on the node to be removed)
docker swarm leave

# Force remove node from swarm
docker swarm leave --force

# Remove node from cluster (manager only)
docker node rm node_id

# Force remove node
docker node rm -f node_id
```

### Adding Nodes to Swarm
```bash
# Get join token for manager nodes (max 7 managers allowed)
docker swarm join-token manager

# Get join token for worker nodes
docker swarm join-token worker
```

## Service Management

### Creating and Managing Services
```bash
# Create a service with replicas and port mapping
docker service create --name my_first_service --replicas 3 -p 80:80 httpd

# List all services
docker service ls

# Show where service tasks are running
docker service ps service_name

# Scale service to specific number of replicas
docker service scale service_name=5

# Scale service to zero (stop all replicas)
docker service scale service_name=0

# Remove service
docker service rm service_name
```

### Service Updates
```bash
# Update service image
docker service update --image mysql:latest service_name
```

## Stack Deployment

### Using Docker Compose with Swarm
```bash
# Deploy stack using docker-compose file
docker stack deploy -c docker_compose_file.yml service_name
```

## Node Availability Management

### Controlling Node Availability
```bash
# Set node availability (active, pause, drain)
docker node update --availability active node_id
docker node update --availability pause node_id
docker node update --availability drain node_id
```

**Availability States:**
- **active**: Node can receive new tasks
- **pause**: Node cannot receive new tasks but existing tasks continue
- **drain**: Node cannot receive new tasks and existing tasks are moved to other nodes

## Networking in Swarm

### Overlay Networks
```bash
# Create overlay network for swarm services
docker network create --driver=overlay first_overlay

# Add network to existing service
docker service update --network-add network_name service_name

# Create service with overlay network
docker service create --name first_swarm --network first_overlay --replicas 4 nginx
```

## Volume Management

### Adding Volumes to Services
```bash
# Add volume to service
docker service update --mount-add type=volume,target=location,destination=/app,readonly service_name

# Add bind mount to service
docker service update --mount-add type=bind,src=/host/path,dst=/container/path service_name
```

## Role Management

### Changing Node Roles
```bash
# Promote worker to manager
docker node promote node_id/hostname

# Demote manager to worker
docker node demote node_id/hostname

# Update node role directly
docker node update --role manager nodename/id
docker node update --role worker nodename/id
```

## Node Labels and Constraints

### Managing Node Labels
```bash
# Add label to node
docker node update --label-add env=dev nodename/id

# Remove label from node
docker node update --label-rm env nodename/id
```

### Service Constraints
```bash
# Run service only on nodes with specific label
docker service create --constraint="node.labels.env==dev" --replicas=2 -d nginx

# Run service only on manager nodes
docker service create --constraint="node.role==manager" --replicas=2 -d nginx

# Run service only on worker nodes
docker service create --constraint="node.role==worker" --replicas=2 -d nginx
```

## Load Balancing and Rebalancing

### Force Service Rebalancing
```bash
# Force rebalancing when new nodes are added
docker service update service_name --detach=false --force
```

## Monitoring and Visualization

### Swarm Visualizer
```bash
# Deploy Docker Swarm visualizer (runs on manager node)
docker service create \
  --name=viz \
  --publish=8080:8080/tcp \
  --constraint=node.role==manager \
  --mount=type=bind,src=/var/run/docker.sock,dst=/var/run/docker.sock \
  dockersamples/visualizer
```

## Advanced Service Configuration

### Service Creation with Multiple Options
```bash
# Create service with comprehensive configuration
docker service create \
  --name web-service \
  --replicas 3 \
  --network overlay-net \
  --publish 80:80 \
  --constraint="node.role==worker" \
  --label env=production \
  --update-delay 10s \
  --update-parallelism 1 \
  nginx:latest
```

## Health Checks and Rolling Updates

### Service Health Management
```bash
# Update service with health check
docker service update \
  --health-cmd "curl -f http://localhost/ || exit 1" \
  --health-interval 30s \
  --health-retries 3 \
  --health-timeout 10s \
  service_name
```

### Rolling Updates
```bash
# Configure rolling update parameters
docker service update \
  --update-delay 30s \
  --update-parallelism 2 \
  --update-failure-action rollback \
  service_name
```

## Troubleshooting

### Common Debugging Commands
```bash
# View service logs
docker service logs service_name

# Follow service logs in real-time
docker service logs -f service_name

# Inspect service configuration
docker service inspect service_name

# View node details
docker node inspect node_id

# Check swarm status
docker system info
```

## Best Practices

### Production Recommendations
- Use odd number of manager nodes (3, 5, 7)
- Separate manager and worker roles for production
- Use overlay networks for service communication
- Implement proper health checks
- Use secrets for sensitive data
- Regular backup of swarm state
- Monitor resource usage across nodes

This guide covers essential Docker Swarm commands for container orchestration and cluster management.