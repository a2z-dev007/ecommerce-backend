# Deployment Guide

This guide covers deploying your ecommerce backend to production environments.

## 🚀 Quick Deployment Checklist

- [ ] Environment variables configured
- [ ] Database setup and seeded
- [ ] SSL certificates configured
- [ ] Domain/subdomain pointed to server
- [ ] Reverse proxy configured (nginx)
- [ ] Process manager setup (PM2)
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented

## 🌐 Environment Setup

### 1. Server Requirements

**Minimum Requirements:**
- Node.js 18+ LTS
- 2GB RAM
- 20GB SSD storage
- Ubuntu 20.04+ or similar

**Recommended:**
- 4GB+ RAM
- 50GB+ SSD storage
- Load balancer for multiple instances

### 2. Environment Variables

Create production `.env` file:

```env
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/business_db

# JWT Secrets (Generate strong secrets!)
JWT_ACCESS_SECRET=your-super-secure-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Security
BCRYPT_SALT_ROUNDS=12
COOKIE_SECRET=your-cookie-secret-min-16-chars

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/var/www/uploads

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Payment Gateways (Optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Configure network access (whitelist your server IP)
   - Create database user

2. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/business_db
   ```

3. **Seed Database**
   ```bash
   npm run seed
   ```

### Self-Hosted MongoDB

```bash
# Install MongoDB
sudo apt update
sudo apt install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
> use business_db
> db.createUser({
    user: "dbuser",
    pwd: "secure_password",
    roles: ["readWrite"]
  })
```

## 🐳 Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### 2. Build and Run

```bash
# Build the application
npm run build

# Build Docker image
docker build -t ecommerce-backend .

# Run container
docker run -d \
  --name ecommerce-api \
  -p 3000:3000 \
  --env-file .env \
  ecommerce-backend
```

### 3. Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

## 🔧 Traditional Server Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create application user
sudo adduser --system --group ecommerce
```

### 2. Application Deployment

```bash
# Clone repository
git clone <your-repo-url> /var/www/ecommerce-backend
cd /var/www/ecommerce-backend

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Set permissions
sudo chown -R ecommerce:ecommerce /var/www/ecommerce-backend
```

### 3. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'ecommerce-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/ecommerce/error.log',
    out_file: '/var/log/ecommerce/out.log',
    log_file: '/var/log/ecommerce/combined.log',
    time: true
  }]
};
```

Start with PM2:

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ecommerce --hp /home/ecommerce
```

## 🔒 Nginx Reverse Proxy

### 1. Install Nginx

```bash
sudo apt install nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/ecommerce-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/ecommerce-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# PM2 logs
pm2 logs ecommerce-api

# System monitoring
htop
```

### 2. Log Management

Create log rotation `/etc/logrotate.d/ecommerce`:

```
/var/log/ecommerce/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ecommerce ecommerce
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Health Checks

Create health check script:

```bash
#!/bin/bash
# /usr/local/bin/health-check.sh

HEALTH_URL="http://localhost:3000/api/v1/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "API is healthy"
    exit 0
else
    echo "API is unhealthy (HTTP $RESPONSE)"
    # Restart application
    pm2 restart ecommerce-api
    exit 1
fi
```

Add to crontab:

```bash
# Check every 5 minutes
*/5 * * * * /usr/local/bin/health-check.sh
```

## 🔄 Backup Strategy

### 1. Database Backup

```bash
#!/bin/bash
# /usr/local/bin/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
DB_NAME="business_db"

mkdir -p $BACKUP_DIR

# MongoDB Atlas backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"
rm -rf "$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
```

### 2. Application Backup

```bash
#!/bin/bash
# /usr/local/bin/backup-app.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/application"
APP_DIR="/var/www/ecommerce-backend"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" \
    --exclude="node_modules" \
    --exclude="dist" \
    --exclude=".git" \
    -C "$(dirname $APP_DIR)" "$(basename $APP_DIR)"

# Keep only last 30 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +30 -delete
```

## 🚀 Scaling Considerations

### 1. Horizontal Scaling

```bash
# Multiple PM2 instances
pm2 start ecosystem.config.js -i max

# Load balancer configuration (nginx)
upstream api_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}
```

### 2. Database Scaling

- Use MongoDB replica sets
- Implement read replicas
- Consider sharding for large datasets

### 3. Caching Layer

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis for caching
# Update application to use Redis for sessions and caching
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   sudo chown -R ecommerce:ecommerce /var/www/ecommerce-backend
   ```

3. **MongoDB connection issues**
   - Check network access in MongoDB Atlas
   - Verify connection string
   - Check firewall rules

4. **SSL certificate issues**
   ```bash
   sudo certbot renew --dry-run
   ```

### Performance Optimization

1. **Enable gzip compression** (already included in app)
2. **Use CDN for static assets**
3. **Implement Redis caching**
4. **Database indexing optimization**
5. **Monitor and optimize slow queries**

## 📋 Post-Deployment Checklist

- [ ] API endpoints responding correctly
- [ ] Database seeded with initial data
- [ ] SSL certificate working
- [ ] Monitoring and logging active
- [ ] Backup scripts scheduled
- [ ] Health checks configured
- [ ] Performance testing completed
- [ ] Security scan performed
- [ ] Documentation updated

## 🆘 Support

For deployment issues:
1. Check application logs: `pm2 logs ecommerce-api`
2. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system resources: `htop`, `df -h`
4. Verify environment variables
5. Test database connectivity

---

**Security Note**: Always use strong passwords, keep systems updated, and follow security best practices for production deployments.