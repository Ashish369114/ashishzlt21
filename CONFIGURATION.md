# Configuration Guide

## Backend Configuration (.env)

The `.env` file should be created in the `backend` folder. Here's what each variable means:

### Example .env File

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/school-management-system

# Server Configuration
PORT=5000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Environment
NODE_ENV=development
```

### Configuration Details

#### MONGODB_URI
- **Purpose**: Database connection string
- **Default**: `mongodb://localhost:27017/school-management-system`
- **For Production**: Change to your MongoDB Atlas URI
- **Format**: `mongodb://[username]:[password]@[host]:[port]/[database]`

#### PORT
- **Purpose**: Port on which backend server runs
- **Default**: 5000
- **Alternative**: 5001, 5002, etc. (if 5000 is in use)

#### JWT_SECRET
- **Purpose**: Secret key for signing JWT tokens
- **Default**: `your_super_secret_jwt_key_change_in_production`
- **Production**: Change to a long, random, secure string
- **Generate**: Use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### NODE_ENV
- **Purpose**: Defines the environment
- **Options**:
  - `development` - Development mode with verbose logging
  - `production` - Production mode with optimizations

---

## Database Setup

### MongoDB Local Installation

#### Windows
1. Download MongoDB Community Server
2. Run the installer
3. MongoDB runs on port 27017 by default
4. Start MongoDB: `mongod`
5. Connect: `mongosh` or MongoDB Compass

#### Mac
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu)
```bash
sudo apt-get update
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Verify MongoDB Connection
```bash
# Open MongoDB shell
mongosh

# Show databases
show databases

# Use the school database
use school-management-system

# Show collections
show collections
```

---

## Frontend Configuration

The frontend uses `http://localhost:5000/api` as the base API URL.

To change the API URL, modify `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';  // Change this line
```

### Development Server
- **Address**: `http://localhost:3000`
- **Hot Reload**: Enabled (changes update automatically)

### Build for Production
```bash
npm run build
```
This creates an optimized production build in the `build/` folder.

---

## Database Seeding

### Run Initial Seed
```bash
cd backend
npm run seed
```

### What Gets Created
- 1 Super Admin
- 1 Principal
- 7 Teachers (one per subject)
- 30 Classes (Grades 1-10, Sections A-C)
- 10 Students
- 10 Parents
- 1 Accountant & Admin
- 7 Subjects
- Sample fees

### Reset Database
To reset and reseed:
```bash
# All data is deleted, then reseeded
npm run seed
```

---

## API Configuration

### Base URL
```
http://localhost:5000/api
```

### Headers Required (after login)
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Example API Call
```javascript
const headers = {
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};

fetch('http://localhost:5000/api/students', {
  headers
})
```

---

## Environment Variables for Production

### Backend (.env.production)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-management-system
PORT=5000
JWT_SECRET=your-long-random-secure-string-here
NODE_ENV=production
```

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

---

## Docker Configuration (Optional)

### Dockerfile for Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/school-management-system
      PORT: 5000
      JWT_SECRET: your-secret-key
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000/api

volumes:
  mongo_data:
```

---

## Nginx Configuration (Production)

### nginx.conf
```nginx
upstream api {
    server backend:5000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location /api/ {
        proxy_pass http://api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://frontend/;
    }
}
```

---

## SSL/TLS Configuration (HTTPS)

### Using Let's Encrypt with Nginx
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Database Backup

### MongoDB Backup
```bash
# Backup
mongodump --uri "mongodb://localhost:27017/school-management-system" \
  --out ./backup

# Restore
mongorestore --uri "mongodb://localhost:27017" ./backup
```

### Automated Backup (Cron)
```bash
# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh
```

---

## Monitoring & Logging

### Backend Logs
```bash
# View logs
tail -f backend.log

# Log level configuration (add to .env)
LOG_LEVEL=debug  # debug, info, warn, error
```

### MongoDB Monitoring
```bash
# Check database size
db.stats()

# Check collections
db.collection.stats()

# Monitor operations
db.currentOp()
```

---

## Performance Optimization

### Backend
1. Add caching layer (Redis)
2. Database indexing
3. Pagination for large datasets
4. Compression middleware

### Frontend
1. Code splitting
2. Lazy loading
3. Image optimization
4. CSS minification

---

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Set strong database passwords
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS only cookies
- [ ] Implement CSRF protection

---

## Troubleshooting Configuration

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Issues
```bash
# Test connection
mongosh "mongodb://localhost:27017"

# Check MongoDB service status
sudo systemctl status mongodb
```

### Permission Errors
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

---

## Additional Configuration Files

### .gitignore
```
node_modules/
.env
.env.local
.env.*.local
*.log
build/
dist/
```

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100
}
```

### .eslintrc.json
```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  }
}
```

---

## Reference

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [JWT Introduction](https://jwt.io/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

**All configuration is ready! You're set to run the School Operating System.** 🚀
