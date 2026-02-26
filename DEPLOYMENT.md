# Firebook Backend Deployment Guide

## Overview
This guide covers deployment and maintenance of the Firebook backend on AWS EC2 instance.

## Prerequisites
- SSH access to EC2 instance via aws-server
- Git access to backend repository
- Node.js and npm installed
- Database credentials and OAuth provider credentials

## Quick Restart Commands

### Using PM2 (Recommended)
```bash
# Restart the backend
pm2 restart firebook-backend

# Check status
pm2 status

# View logs
pm2 logs firebook-backend
pm2 logs firebook-backend --lines 100
```

### Using Systemd (Alternative)
```bash
# Restart the backend
sudo systemctl restart firebook-backend

# Check status
sudo systemctl status firebook-backend

# View logs
sudo journalctl -u firebook-backend -f
sudo journalctl -u firebook-backend --lines 100
```

### Direct Node (Development)
```bash
# Navigate to backend directory
cd /path/to/backend

# Kill existing process
pkill -f "node server.js"

# Start server
node server.js &

# Or use nodemon for development
nodemon server.js
```

## Environment Setup

### 1. Update Environment Variables
```bash
# Navigate to backend directory
cd /path/to/backend

# Edit .env file
nano .env

# OR set environment variables
export DB_HOST=localhost
export DB_USER=fyrebook
export DB_PASSWORD=your_password
export DB_NAME=fyrebook
export JWT_SECRET=your_secret_key_here

# OAuth Variables
export GOOGLE_CLIENT_ID=your_google_client_id
export GOOGLE_CLIENT_SECRET=your_google_client_secret
export GOOGLE_REDIRECT_URI=https://firebook.app/api/auth/google/callback

export FACEBOOK_APP_ID=your_facebook_app_id
export FACEBOOK_APP_SECRET=your_facebook_app_secret
export FACEBOOK_REDIRECT_URI=https://firebook.app/api/auth/facebook/callback

export APPLE_CLIENT_ID=your_apple_client_id
export APPLE_TEAM_ID=your_team_id
export APPLE_KEY_ID=your_key_id
export APPLE_PRIVATE_KEY_PATH=/path/to/key.p8
export APPLE_REDIRECT_URI=https://firebook.app/api/auth/apple/callback

export OPENAI_API_KEY=your_openai_api_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Create database if not exists
mysql -u root -p < fyrebook.sql

# Verify database connection
mysql -u fyrebook_user -p fyrebook_password fyrebook

# Check if tables exist
USE fyrebook;
SHOW TABLES;
```

## Git Operations

### Update from Repository
```bash
# Pull latest changes
git pull origin master

# Check current branch
git branch

# Check status
git status
```

### Manual Code Updates
```bash
# Upload specific files
scp -i /local/path/to/file.js user@firebook.app:/path/to/remote/

# Or use SFTP if available
sftp user@firebook.app
put /local/path/to/file.js /path/to/remote/
```

## API Testing

### Health Check
```bash
# Basic health check
curl https://firebook.app/api/health

# Check database connectivity
curl https://firebook.app/api/me/social-stats
```

### Social API Endpoints
```bash
# Posts
curl https://firebook.app/api/posts

# Authentication
curl -X POST https://firebook.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Social Stats
curl https://firebook.app/api/me/social-stats

# Feed
curl https://firebook.app/api/me/feed

# Trending
curl https://firebook.app/api/posts/trending
```

## Troubleshooting

### Check Server Logs
```bash
# PM2 logs
pm2 logs firebook-backend --lines 50 --err

# Systemd logs
sudo journalctl -u firebook-backend -f --lines 50

# Check for errors
pm2 logs firebook-backend | grep -i error

# Check for database connection issues
pm2 logs firebook-backend | grep -i "database\|connection\|mariadb"
```

### Common Issues

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Then restart
pm2 restart firebook-backend
```

### Database Connection Issues
```bash
# Test database connection
mysql -u fyrebook_user -p fyrebook_password fyrebook -e "SELECT 1"

# Check if database exists
mysql -u root -e "SHOW DATABASES LIKE 'fyrebook'"

# Restart MariaDB if needed
sudo systemctl restart mariadb
```

### Memory Issues
```bash
# Check memory usage
free -h

# Check Node process memory
ps aux | grep node

# Restart if memory is high
pm2 restart firebook-backend
```

## SSL/HTTPS Setup

### Check SSL Certificate
```bash
# Verify SSL certificate
curl -I https://firebook.app

# Check certificate expiry
openssl x509 -in /path/to/cert.pem -noout -dates

# Check certificate chain
openssl s_client -connect firebook.app:443 </dev/null
```

### Setup SSL with Let's Encrypt (if needed)
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d firebook.app

# Update server to use new certificate
# Update paths in server.js to use SSL certificate
```

## Performance Monitoring

### Install PM2 Plus (Optional)
```bash
# PM2 Plus provides monitoring and alerts
pm2 install pm2-logrotate

# Setup monitoring
pm2 startup firebook-backend
pm2 monitor firebook-backend
```

### Database Optimization
```bash
# Add indexes to tables
mysql -u fyrebook_user -p fyrebook_password fyrebook <<EOF
-- Add indexes to improve performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
EOF

-- Analyze slow queries
mysql -u fyrebook_user -p fyrebook_password fyrebook -e "SHOW FULL PROCESSLIST";
EOF
```

## Backup Procedures

### Database Backup
```bash
# Backup database
mysqldump -u fyrebook_user -p fyrebook_password fyrebook > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_$(date +%Y%m%d).sql

# Upload to S3 (if configured)
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://firebook-backups/
```

### Code Backup
```bash
# Backup current code
git add .
git commit -m "Backup before deployment $(date)"

# Push to backup branch
git push origin backup-$(date +%Y%m%d)
```

## Security Checklist

- [ ] Database credentials are strong and unique
- [ ] JWT_SECRET is complex and randomly generated
- [ ] OAuth credentials are stored securely
- [ ] HTTPS is enabled with valid SSL certificate
- [ ] Database user has limited privileges
- [ ] Rate limiting is implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] CORS is properly configured
- [ ] File upload restrictions are in place

## Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous commit
git reset --hard HEAD~1

# Restart server
pm2 restart firebook-backend
```

### Full Rollback
```bash
# Rollback to specific commit
git reset --hard <commit-hash>

# Restart server
pm2 restart firebook-backend
```

## Maintenance Mode

### Enable Maintenance Mode
```bash
# Create maintenance page
echo "System under maintenance. Please check back soon." > maintenance.html

# Update Nginx/Apache configuration to show maintenance page
sudo nano /etc/nginx/sites-available/firebook.conf
# Add: return 503; root /path/to/maintenance.html;
```

### Disable Maintenance Mode
```bash
# Remove maintenance page
rm maintenance.html

# Remove Nginx/Apache maintenance configuration
sudo nano /etc/nginx/sites-available/firebook.conf
# Remove maintenance return directive
```

## Contact & Support

### EC2 Instance Information
- **Instance Type:** [Your EC2 Instance Type]
- **Instance ID:** [Your EC2 Instance ID]
- **Public IP:** [Your Public IP]
- **Region:** [Your AWS Region]

### Support Commands
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check network connections
netstat -tulpn

# Check running processes
ps aux
```

## Notes
- This guide assumes the backend is deployed using PM2 or systemd
- Adjust paths and commands based on your actual deployment setup
- Always test changes in a development environment before applying to production
- Keep backups before major updates
- Monitor server logs regularly
- Use version control for all code changes

## Quick Reference

### Restart Commands Summary
```bash
# Quick restart
pm2 restart firebook-backend

# Check logs
pm2 logs firebook-backend --lines 50

# Check status
pm2 status firebook-backend

# Database connection test
mysql -u fyrebook_user -p fyrebook_password fyrebook -e "SELECT 1"
```

### Important Files
- `server.js` - Main server file
- `.env` - Environment variables
- `package.json` - Dependencies
- `fyrebook.sql` - Database schema
- `src/config/passport.js` - OAuth configuration
- `src/routes/social.js` - Social API routes
- `src/utils/socialGamification.js` - Gamification logic
```

---

Last updated: $(date)
Deployment version: 1.0.0
