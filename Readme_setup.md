Here are ALL the dependencies you need for both frontend and backend of your SangamBonds application:

## Backend Dependencies

### Production Dependencies (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "express-rate-limit": "^6.10.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "socket.io": "^4.7.2",
    "node-cron": "^3.0.2",
    "winston": "^3.10.0",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "uuid": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.4",
    "validator": "^13.11.0"
  }
}
```

### Development Dependencies (devDependencies)
```json
{
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "supertest": "^6.3.3",
    "@types/jest": "^29.5.5",
    "eslint": "^8.48.0",
    "prettier": "^3.0.3"
  }
}
```

### Backend Installation Commands
```bash
cd backend

# Initialize package.json
npm init -y

# Install production dependencies
npm install express cors helmet dotenv mongoose bcryptjs jsonwebtoken joi express-rate-limit compression morgan socket.io node-cron winston lodash moment uuid multer nodemailer validator

# Install development dependencies
npm install --save-dev nodemon jest supertest @types/jest eslint prettier
```

## Frontend Dependencies

### Production Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "@mui/material": "^5.14.5",
    "@mui/icons-material": "^5.14.3",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "axios": "^1.5.0",
    "react-hot-toast": "^2.4.1",
    "recharts": "^2.8.0",
    "socket.io-client": "^4.7.2",
    "react-query": "^3.39.3",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "react-helmet-async": "^1.3.0",
    "prop-types": "^15.8.1"
  }
}
```

### Development Dependencies (devDependencies)
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4",
    "eslint": "^8.48.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.0.3"
  }
}
```

### Frontend Installation Commands
```bash
# Create React app (if starting fresh)
npx create-react-app frontend
cd frontend

# Or if you have existing project, just install dependencies
cd frontend

# Install Material-UI and emotions
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# Install routing
npm install react-router-dom

# Install HTTP client
npm install axios

# Install notifications
npm install react-hot-toast

# Install charts
npm install recharts

# Install WebSocket client
npm install socket.io-client

# Install React Query for data management
npm install react-query

# Install utilities
npm install lodash moment react-helmet-async prop-types

# Install development dependencies (if needed)
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event eslint eslint-plugin-react eslint-plugin-react-hooks prettier
```

## Complete Installation Script

### Backend Setup
```bash
# Create backend directory
mkdir sangambonds-backend
cd sangambonds-backend

# Initialize npm
npm init -y

# Install all backend dependencies at once
npm install express cors helmet dotenv mongoose bcryptjs jsonwebtoken joi express-rate-limit compression morgan socket.io node-cron winston lodash moment uuid multer nodemailer validator

# Install dev dependencies
npm install --save-dev nodemon jest supertest @types/jest eslint prettier

# Create basic folder structure
mkdir src
mkdir src/controllers src/models src/routes src/middleware src/utils src/config
```

### Frontend Setup
```bash
# Create frontend (if new project)
npx create-react-app sangambonds-frontend
cd sangambonds-frontend

# OR if existing project
cd frontend

# Install all frontend dependencies at once
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom axios react-hot-toast recharts socket.io-client react-query lodash moment react-helmet-async prop-types

# Install dev dependencies (if needed)
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks prettier
```

## Package.json Scripts

### Backend package.json scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/"
  }
}
```

### Frontend package.json scripts
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/"
  }
}
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sangambonds
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
```

## Key Dependencies Explained

### Backend Core Dependencies:
- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **socket.io**: Real-time communication
- **joi**: Data validation

### Frontend Core Dependencies:
- **@mui/material**: UI components library
- **react-router-dom**: Client-side routing
- **axios**: HTTP client
- **recharts**: Charts and graphs
- **react-hot-toast**: Notifications
- **socket.io-client**: WebSocket client

Run these installation commands and you'll have all the dependencies needed for your SangamBonds application!