# Health Analytics Backend - Production Deployment Guide

This guide covers everything required to safely deploy the backend system to a production environment. 

## 1. Environment Variable Architecture
Create a `.env` file based on `.env.example`. The following are strictly required for production:

*   `NODE_ENV=production` - Vital for Express performance optimizations and hiding error stack traces.
*   `FRONTEND_URL=https://your-domain.com` - Enables strict CORS locking to your exact frontend domain.
*   `MONGODB_URI` - Must use a secure, authenticated connection string (e.g. Atlas or local with auth).
*   `JWT_SECRET` - Use a 64-character hex string (`openssl rand -hex 64`). Never commit this.

## 2. Linux Server Deployment (Nginx + PM2)

This is the recommended deployment method for standard VPS (DigitalOcean, AWS EC2, Linode).

### Step 2.1: Node Application Setup
1. Clone the repository and navigate to the `backend` folder.
2. Install production dependencies:
   ```bash
   npm ci --only=production
   ```
3. Install PM2 globally to keep the Node app running forever:
   ```bash
   npm install -g pm2
   ```
4. Start the app via PM2:
   ```bash
   pm2 start server.js --name "health-analytics-api"
   pm2 save
   pm2 startup
   ```

### Step 2.2: Nginx Reverse Proxy Setup
The backend is configured to `trust proxy`. You must use a reverse proxy like Nginx to handle SSL and forward the real client IP, otherwise the strict rate limiter will block everyone.

1. Install Nginx: `sudo apt install nginx`
2. Create an Nginx config file (`/etc/nginx/sites-available/health-api`):

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        
        # CRITICAL: Forward the real IP so Express rate limiting works
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
3. Enable and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/health-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
4. Secure it with SSL using Certbot: `sudo certbot --nginx -d api.your-domain.com`

---

## 3. Docker Container Deployment

For containerized environments (Kubernetes, AWS ECS, Docker Swarm).

### Create a `Dockerfile` in the `backend/` directory:
```dockerfile
# Use lightweight Node 20 LTS Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Only copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose API Port
EXPOSE 5001

# Start the application natively
CMD ["node", "server.js"]
```

### Build and Run:
1. Build the image:
   ```bash
   docker build -t health-analytics-backend .
   ```
2. Run the container (passing environment variables):
   ```bash
   docker run -d \
     --name health-api \
     -p 5001:5001 \
     -e NODE_ENV=production \
     -e FRONTEND_URL=https://your-domain.com \
     -e MONGODB_URI=mongodb://... \
     -e JWT_SECRET=your_super_secret_key \
     --restart unless-stopped \
     health-analytics-backend
   ```

## Production Security Notes

1. **Helmet & Compression**: The codebase includes `helmet` for HTTP headers and `compression` for payload speed. Both are active.
2. **File Uploads**: Files are strictly whitelisted and stored safely. Ensure the `uploads/documents` host directory has proper Linux permissions and is excluded from source control.
3. **Logging**: Winston automatically writes structured JSON logs to `logs/combined.log` and `logs/error.log` in production, suppressing dangerous `console.log` stdout dumps.
