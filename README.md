# 📝 SaaSNotes

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4-green)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-black)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC)](https://tailwindcss.com/)

> A comprehensive multi-tenant SaaS notes application built with the MERN stack, featuring subscription management, role-based access control, and complete data isolation between tenants.

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [👥 Test Accounts](#-test-accounts)
- [📚 API Documentation](#-api-documentation)
- [🚀 Deployment](#-deployment)
- [🔒 Security Features](#-security-features)
- [📊 Subscription Plans](#-subscription-plans)
- [🧪 Testing](#-testing)
- [🐛 Troubleshooting](#-troubleshooting)
- [🛣️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [👤 Author](#-author)
- [📄 License](#-license)

## 🌟 Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin, Member)
- **Secure password hashing** using bcrypt
- **Rate limiting** and security headers
- **Input validation** and sanitization
- **CORS protection** and Helmet security headers

### 🏢 Multi-Tenancy
- **Complete data isolation** between tenants
- **Tenant-aware API endpoints** with automatic validation
- **Scalable architecture** supporting multiple organizations
- **Shared schema approach** for efficient resource utilization
- **Tenant-specific user management**

### 💳 Subscription Management
- **Free Plan**: 3 notes maximum
- **Pro Plan**: Unlimited notes ($9.99/month)
- **Usage tracking** and limit enforcement
- **Admin-only subscription** upgrades/downgrades
- **Real-time subscription status** updates

### 📝 Notes Management
- **Full CRUD operations** for notes
- **Advanced search** and filtering capabilities
- **Tagging system** for organization
- **Archive/unarchive** functionality
- **Pagination** for large datasets
- **Rich text editing** support

### 🎨 User Interface
- **Responsive design** with Tailwind CSS
- **Modern UI components** with Radix UI
- **Dark/Light theme** support
- **Mobile-first** approach
- **Accessibility** compliant

## 🏗️ Architecture

### Multi-Tenancy Strategy
This application uses a **shared schema with tenant isolation** approach:

- **Single Database**: All tenants share the same MongoDB database
- **Tenant Isolation**: Every record includes a `tenantId` field for data segregation
- **Security**: Middleware ensures users can only access their tenant's data
- **Scalability**: Efficient resource utilization while maintaining data isolation

### Tech Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Frontend** | React | 18.2.0 | User Interface |
| **Backend** | Node.js + Express | 4.18.2 | API Server |
| **Database** | MongoDB + Mongoose | 7.5.0 | Data Storage |
| **Authentication** | JWT | 9.0.2 | Token-based Auth |
| **Styling** | Tailwind CSS | 3.3.3 | CSS Framework |
| **UI Components** | Radix UI | Latest | Accessible Components |
| **Deployment** | Vercel | Latest | Cloud Platform |
| **Type Safety** | TypeScript | 5.0 | Type Checking |

## 📁 Project Structure

```
SaaSNotes/
├── 📁 client/                          # React Frontend Application
│   ├── 📁 public/                      # Static assets
│   │   └── index.html                  # HTML template
│   ├── 📁 src/                         # Source code
│   │   ├── 📁 components/              # Reusable UI components
│   │   │   ├── Layout.js              # Main layout component
│   │   │   ├── NoteCard.js            # Note display component
│   │   │   ├── NoteModal.js           # Note creation/edit modal
│   │   │   └── ProtectedRoute.js      # Route protection wrapper
│   │   ├── 📁 contexts/               # React Context providers
│   │   │   ├── AuthContext.js         # Authentication state
│   │   │   └── NotesContext.js        # Notes state management
│   │   ├── 📁 pages/                  # Page components
│   │   │   ├── Dashboard.js           # Main dashboard
│   │   │   ├── Login.js               # Login page
│   │   │   ├── Notes.js               # Notes management page
│   │   │   └── Settings.js            # User settings page
│   │   ├── App.js                     # Main App component
│   │   ├── index.js                   # Application entry point
│   │   └── index.css                  # Global styles
│   ├── package.json                   # Frontend dependencies
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   └── vercel.json                    # Vercel deployment config
│
├── 📁 server/                          # Node.js Backend Application
│   ├── 📁 middleware/                  # Express middleware
│   │   └── auth.js                    # Authentication middleware
│   ├── 📁 models/                     # MongoDB models
│   │   ├── Note.js                    # Note data model
│   │   ├── Tenant.js                  # Tenant data model
│   │   └── User.js                    # User data model
│   ├── 📁 routes/                     # API route handlers
│   │   ├── auth.js                    # Authentication routes
│   │   ├── notes.js                   # Notes CRUD routes
│   │   ├── subscription.js            # Subscription management
│   │   └── tenants.js                 # Tenant management
│   ├── 📁 services/                   # Business logic services
│   │   └── subscriptionService.js     # Subscription logic
│   ├── 📁 utils/                      # Utility functions
│   │   └── seedData.js               # Database seeding
│   ├── server.js                      # Express server setup
│   ├── package.json                   # Backend dependencies
│   └── vercel.json                    # Vercel deployment config
│
├── 📄 package.json                    # Root package configuration
├── 📄 README.md                       # Project documentation
├── 📄 LICENSE                         # MIT License
└── 📄 .gitignore                      # Git ignore rules
```

### 📂 Key Directories Explained

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| **`client/src/components/`** | Reusable UI components | Layout, NoteCard, NoteModal |
| **`client/src/contexts/`** | State management | AuthContext, NotesContext |
| **`client/src/pages/`** | Page-level components | Dashboard, Login, Notes, Settings |
| **`server/models/`** | Database schemas | User, Note, Tenant models |
| **`server/routes/`** | API endpoints | Authentication, CRUD operations |
| **`server/middleware/`** | Express middleware | Authentication, validation |
| **`server/services/`** | Business logic | Subscription management |

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kush-Varshney/SaaSNotes.git
   cd SaaSNotes
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Environment Setup**
   
   Create `.env` file in the `server` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/notes-saas
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   ```
   
   Create `.env` file in the `client` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Database Setup**
   ```bash
   cd server
   node utils/seedData.js
   ```

5. **Start Development Servers**
   ```bash
   # From root directory - starts both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

### 🌐 Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 👥 Test Accounts

All test accounts use the password: `password`

| Email | Role | Tenant | Description |
|-------|------|--------|-------------|
| admin@acme.test | Admin | Acme Corporation | Can invite users & manage subscriptions |
| user@acme.test | Member | Acme Corporation | Can only manage notes |
| admin@globex.test | Admin | Globex Corporation | Can invite users & manage subscriptions |
| user@globex.test | Member | Globex Corporation | Can only manage notes |

## 📚 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Access | Request Body |
|--------|----------|-------------|---------|--------------|
| `POST` | `/api/auth/login` | User login | Public | `{email, password}` |
| `POST` | `/api/auth/register` | Register new user | Admin only | `{email, password, role}` |
| `GET` | `/api/auth/me` | Get current user profile | Authenticated | - |
| `PUT` | `/api/auth/change-password` | Change password | Authenticated | `{currentPassword, newPassword}` |
| `POST` | `/api/auth/refresh` | Refresh JWT token | Authenticated | - |
| `GET` | `/api/auth/users` | Get all tenant users | Admin only | - |

### Notes Management
| Method | Endpoint | Description | Access | Request Body |
|--------|----------|-------------|---------|--------------|
| `POST` | `/api/notes` | Create note | Authenticated | `{title, content, tags}` |
| `GET` | `/api/notes` | List notes (paginated) | Authenticated | Query params |
| `GET` | `/api/notes/:id` | Get single note | Authenticated | - |
| `PUT` | `/api/notes/:id` | Update note | Authenticated | `{title, content, tags}` |
| `DELETE` | `/api/notes/:id` | Delete note | Authenticated | - |
| `POST` | `/api/notes/:id/archive` | Archive/unarchive note | Authenticated | - |

### Subscription Management
| Method | Endpoint | Description | Access | Request Body |
|--------|----------|-------------|---------|--------------|
| `GET` | `/api/subscription/usage` | Get usage statistics | Authenticated | - |
| `GET` | `/api/subscription/plans` | Get available plans | Public | - |
| `POST` | `/api/subscription/upgrade` | Upgrade subscription | Admin only | - |
| `POST` | `/api/subscription/downgrade` | Downgrade subscription | Admin only | - |

### Tenant Management
| Method | Endpoint | Description | Access | Request Body |
|--------|----------|-------------|---------|--------------|
| `GET` | `/api/tenants/:slug` | Get tenant information | Authenticated | - |
| `POST` | `/api/tenants/:slug/upgrade` | Upgrade to Pro | Admin only | - |
| `POST` | `/api/tenants/:slug/downgrade` | Downgrade to Free | Admin only | - |
| `GET` | `/api/tenants/:slug/stats` | Get tenant statistics | Admin only | - |

## 🚀 Deployment

### Vercel Deployment

1. **Backend Deployment**
   ```bash
   cd server
   npm install -g vercel
   vercel --prod
   ```

2. **Frontend Deployment**
   ```bash
   cd client
   vercel --prod
   ```

3. **Environment Variables** (Set in Vercel Dashboard)
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-mongodb-connection-string>`
   - `JWT_SECRET=<your-production-jwt-secret>`
   - `CLIENT_URL=<your-frontend-url>`

### Database Setup (Production)
- Use MongoDB Atlas or another cloud MongoDB service
- Update `MONGODB_URI` in your Vercel environment variables
- Run the seed script against production database (optional)

## 🔒 Security Features

### Implemented Security Measures
- ✅ JWT token authentication with secure secrets
- ✅ Password hashing using bcrypt (12 rounds)
- ✅ Input validation and sanitization
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Tenant isolation middleware
- ✅ Role-based access control
- ✅ SQL injection prevention
- ✅ XSS protection

### Production Security Checklist
- [ ] Use strong, unique JWT secrets
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production
- [ ] Implement proper logging and monitoring
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement proper error handling
- [ ] Set up monitoring and alerting

## 📊 Subscription Plans

| Plan | Price | Notes Limit | Features | Support |
|------|-------|-------------|----------|---------|
| **Free** | $0/month | 3 notes | Basic note editing, search, archive | Community |
| **Pro** | $9.99/month | Unlimited | All Free features + Priority support + Advanced features | Email + Priority |

## 🧪 Testing

### Manual Testing Scenarios

1. **Multi-tenancy Testing**
   - Login as different tenant users
   - Verify data isolation between tenants
   - Test cross-tenant access prevention

2. **Subscription Testing**
   - Test Free plan limits (3 notes max)
   - Test Pro plan upgrade/downgrade
   - Verify admin-only subscription management

3. **Role-based Access**
   - Test admin vs member permissions
   - Verify user invitation functionality
   - Test subscription management restrictions

4. **Notes Functionality**
   - CRUD operations
   - Search and filtering
   - Archive/unarchive
   - Tag management

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><strong>MongoDB Connection Error</strong></summary>

**Symptoms**: Server fails to start, database connection errors
**Solutions**:
- Ensure MongoDB is running locally or check cloud connection
- Verify connection string in `.env` file
- Check network connectivity and firewall settings
- Verify MongoDB credentials and permissions

</details>

<details>
<summary><strong>CORS Errors</strong></summary>

**Symptoms**: Frontend can't connect to backend, CORS policy errors
**Solutions**:
- Check `CLIENT_URL` in server `.env` file
- Verify frontend URL matches CORS configuration
- Ensure both servers are running on correct ports

</details>

<details>
<summary><strong>Authentication Issues</strong></summary>

**Symptoms**: Login fails, token errors, unauthorized access
**Solutions**:
- Check JWT secret configuration in `.env`
- Verify token expiration settings
- Clear browser localStorage and cookies
- Check if user exists in database

</details>

<details>
<summary><strong>Deployment Issues</strong></summary>

**Symptoms**: Build failures, runtime errors in production
**Solutions**:
- Ensure all environment variables are set in Vercel
- Check build logs for specific errors
- Verify API endpoints are accessible
- Test database connectivity in production

</details>

## 🛣️ Roadmap

### Phase 1 - Core Features ✅
- [x] Multi-tenant architecture
- [x] User authentication and authorization
- [x] Basic notes CRUD operations
- [x] Subscription management
- [x] Role-based access control

### Phase 2 - Enhanced Features 🚧
- [ ] Email notifications for subscription changes
- [ ] Advanced analytics dashboard
- [ ] Export functionality for notes
- [ ] Real-time collaboration features
- [ ] Mobile application (React Native)

### Phase 3 - Advanced Features 📋
- [ ] Advanced search with full-text indexing
- [ ] Audit logging for compliance
- [ ] Multi-language support
- [ ] API rate limiting per user
- [ ] Advanced reporting and insights

### Phase 4 - Enterprise Features 🔮
- [ ] SSO integration (SAML, OAuth)
- [ ] Advanced security features
- [ ] Custom branding per tenant
- [ ] White-label solutions
- [ ] Enterprise support

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/Kush-Varshney/SaaSNotes.git
   cd SaaSNotes
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```

5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Add comprehensive tests for new features
- Update documentation and README as needed
- Ensure all tests pass before submitting
- Write clear commit messages
- Keep pull requests focused and atomic

## 👤 Author

**Kush Varshney**  
B.Tech CSE | Full Stack Developer

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://kushvarshney.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Kush-Varshney/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kush-varshney-490baa250/)

### About the Author
- 🎓 **Education**: B.Tech in Computer Science and Engineering
- 💻 **Specialization**: Full Stack Development
- 🚀 **Expertise**: MERN Stack, Cloud Computing, DevOps
- 🌟 **Passion**: Building scalable web applications and open-source projects

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```

## 📞 Support

- 🐛 **Bug Reports**: [Create an issue](https://github.com/Kush-Varshney/SaaSNotes/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/Kush-Varshney/SaaSNotes/discussions)
- 📧 **Contact**: [GitHub Profile](https://github.com/Kush-Varshney/)
- 🌐 **Portfolio**: [kushvarshney.dev](https://kushvarshney.vercel.app/)

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

<div align="center">

**Built with ❤️ using the MERN stack**

[![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb?logo=react)](https://reactjs.org/)
[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![Made with MongoDB](https://img.shields.io/badge/Made%20with-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Made with Express](https://img.shields.io/badge/Made%20with-Express-000000?logo=express)](https://expressjs.com/)
[![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)

</div>
