# SaaS Notes - Deployment Guide

## Project Structure

This is a full-stack monorepo with separate client and server directories:
- `client/` - React frontend application
- `server/` - Express.js backend API

## Deployment Options

### Option 1: Monorepo Deployment (Recommended)

Deploy the entire project from the root directory using the root `vercel.json`:

**Root Directory:** `/Users/kush/Downloads/SaaSNotes`

**Build Commands:**
- Client: `cd client && npm install && npm run build`
- Server: `cd server && npm install`

**Start Commands:**
- Client: Static files served from `client/build`
- Server: `node server/server.js`

### Option 2: Separate Deployments

#### Client Deployment
**Directory:** `client/`
**Build Command:** `npm run build`
**Output Directory:** `build`
**Framework:** Create React App

#### Server Deployment
**Directory:** `server/`
**Build Command:** `npm install`
**Start Command:** `node server.js`
**Framework:** Node.js

## Environment Variables

### Required Environment Variables

#### Server (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notes-saas
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
CLIENT_URL=https://your-client-domain.vercel.app
NODE_ENV=production
```

#### Client (.env.local)
```
REACT_APP_API_URL=https://your-server-domain.vercel.app/api
```

## Vercel Configuration

### Root vercel.json (Monorepo)
- Handles both client and server
- Routes API calls to server
- Serves static files from client build

### Client vercel.json
- Static build configuration
- SPA routing support
- Environment variable for API URL

### Server vercel.json
- Node.js serverless function
- Environment variables for database and JWT
- CORS configuration

## Deployment Steps

1. **Set up MongoDB Atlas:**
   - Create a MongoDB Atlas cluster
   - Get connection string
   - Add to environment variables

2. **Deploy to Vercel:**
   - Connect your GitHub repository
   - Set environment variables in Vercel dashboard
   - Deploy from root directory

3. **Configure Environment Variables:**
   - Add all required environment variables
   - Update CLIENT_URL and REACT_APP_API_URL with deployed URLs

## Build and Start Commands

### For Monorepo Deployment:
- **Build:** `npm run build` (runs in both client and server)
- **Start:** Vercel handles this automatically

### For Separate Deployments:
- **Client Build:** `cd client && npm run build`
- **Server Start:** `cd server && npm start`

## Issues Fixed

1. ✅ Updated client vercel.json with proper routing and environment variables
2. ✅ Updated server vercel.json with required environment variables
3. ✅ Created root vercel.json for monorepo deployment
4. ✅ Added comprehensive deployment documentation

## Recommended Deployment Strategy

**Use the monorepo approach** by deploying from the root directory. This allows:
- Single deployment process
- Shared environment variables
- Automatic routing between client and server
- Easier maintenance and updates
