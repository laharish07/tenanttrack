# 🏢 TenantTrack - Organization Management System

A modern, full-stack organization and tenant management platform built with React, TypeScript, and Supabase.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://tenanttrack.pages.dev/)
[![Deployed on Cloudflare](https://img.shields.io/badge/deployed%20on-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)


## 🚀 Live Demo

**[View Live Application →](https://bb44399f.tenanttrack.pages.dev/)**

## ✨ Features

- **Organization Management** - Create and manage multiple organizations/tenants
- **User Authentication** - Secure login and registration with Supabase Auth
- **Real-time Data** - Live updates using Supabase real-time subscriptions
- **Responsive Design** - Modern UI built with Tailwind CSS and shadcn/ui
- **Role-based Access** - Manage user permissions and access levels
- **Dashboard Analytics** - Track key metrics and insights
- **Dark Mode Support** - Beautiful interface in light and dark themes

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Cloudflare Pages
- **Version Control:** Git & GitHub

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or bun package manager
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Kathitjoshi/tenanttrack.git
cd tenanttrack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

To get these credentials:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.




## 🔑 Key Features Explained

### Organization Management
- Create and manage multiple organizations
- Assign users to specific organizations
- Organization-specific settings and configurations

### Authentication & Security
- Email/password authentication via Supabase
- Row-level security (RLS) policies
- Protected routes and API endpoints

### Real-time Updates
- Live data synchronization across clients
- Instant updates when data changes
- WebSocket-based communication

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request





## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)
- Backend powered by [Supabase](https://supabase.com/)
- [Laharish S](https://github.com/laharish07)
- [Kathit Joshi](https://github.com/Kathitjoshi)

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/Kathitjoshi/tenanttrack/issues) on GitHub.

---

⭐ Star this repository if you find it helpful!
