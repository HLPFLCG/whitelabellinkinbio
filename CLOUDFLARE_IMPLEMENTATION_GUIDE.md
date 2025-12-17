# Cloudflare Pages + D1 Implementation Guide

## 🚀 Overview

This guide will help you build a Linktree alternative using:
- **Cloudflare Pages** - Free hosting with global CDN
- **D1 Database** - Serverless SQLite database
- **Cloudflare Workers** - Serverless API functions
- **GitHub** - Version control and automatic deployments

## ✨ Why Cloudflare Stack?

### Advantages over Supabase/Vercel
- ✅ **Completely Free** - No credit card required
- ✅ **Global Edge Network** - Faster than traditional hosting
- ✅ **Zero Cold Starts** - Instant response times
- ✅ **Unlimited Bandwidth** - No bandwidth limits
- ✅ **Built-in DDoS Protection** - Enterprise-grade security
- ✅ **Simple Setup** - One platform for everything
- ✅ **Better Performance** - Edge computing at 300+ locations

### Cost Comparison

| Service | Cloudflare | Vercel + Supabase |
|---------|-----------|-------------------|
| Hosting | Free (unlimited) | Free (100GB/mo) |
| Database | Free (5GB) | Free (500MB) |
| Bandwidth | Unlimited | 100GB/mo |
| Functions | Free (100k/day) | Free (100GB-hrs) |
| **Total** | **$0/month** | **$0/month** |

**Winner:** Cloudflare (unlimited bandwidth + better performance)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Global Network                 │
│                    (300+ Edge Locations)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Cloudflare Pages                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Static Assets (HTML, CSS, JS)                       │  │
│  │  - Homepage                                           │  │
│  │  - Login/Register pages                              │  │
│  │  │  - Dashboard                                       │  │
│  │  - Public profiles                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Functions                                        │  │
│  │  - /api/auth/register                                │  │
│  │  - /api/auth/login                                   │  │
│  │  - /api/links (CRUD)                                 │  │
│  │  - /api/profile                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      D1 Database (SQLite)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables:                                              │  │
│  │  - users                                              │  │
│  │  - profiles                                           │  │
│  │  - links                                              │  │
│  │  - sessions                                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

1. **GitHub Account** - For version control
2. **Cloudflare Account** - Free account at cloudflare.com
3. **Node.js 18+** - For local development
4. **Wrangler CLI** - Cloudflare's CLI tool

## 🚀 Quick Start

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate.

### Step 3: Create D1 Database

```bash
wrangler d1 create linktree-db
```

Copy the database ID from the output. You'll need it later.

### Step 4: Update wrangler.toml

Create `wrangler.toml` in your project root:

```toml
name = "linktree-clone"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "linktree-db"
database_id = "your-database-id-here"
```

### Step 5: Initialize Database Schema

Create `schema.sql`:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    theme TEXT DEFAULT 'light',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Links table
CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    click_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON links(user_id, position);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
```

Apply the schema:

```bash
wrangler d1 execute linktree-db --file=./schema.sql
```

## 🏗️ Project Structure

```
linktree-cloudflare/
├── functions/              # Cloudflare Workers API
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.ts
│   │   │   ├── login.ts
│   │   │   └── logout.ts
│   │   ├── links/
│   │   │   ├── index.ts
│   │   │   └── [id].ts
│   │   └── profile/
│   │       └── index.ts
│   └── _middleware.ts
├── public/                 # Static assets
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── settings.html
│   └── [username].html
├── src/                    # Source code
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── profile.js
│   │   └── api.js
│   └── css/
│       └── styles.css
├── schema.sql             # Database schema
├── wrangler.toml          # Cloudflare configuration
├── package.json
└── README.md
```

## 🔐 Authentication Implementation

### Password Hashing

We'll use Web Crypto API (built into Workers):

```typescript
// functions/api/auth/utils.ts
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### Register Endpoint

```typescript
// functions/api/auth/register.ts
import { hashPassword, generateId } from './utils';

interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  try {
    const { email, password, username, displayName } = await request.json();
    
    // Validate input
    if (!email || !password || !username) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if email exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if username exists
    const existingUsername = await env.DB.prepare(
      'SELECT id FROM profiles WHERE username = ?'
    ).bind(username).first();
    
    if (existingUsername) {
      return new Response(JSON.stringify({ error: 'Username already taken' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create user
    const userId = generateId();
    const passwordHash = await hashPassword(password);
    
    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)'
    ).bind(userId, email, passwordHash).run();
    
    // Create profile
    const profileId = generateId();
    await env.DB.prepare(
      'INSERT INTO profiles (id, user_id, username, display_name) VALUES (?, ?, ?, ?)'
    ).bind(profileId, userId, username, displayName || username).run();
    
    // Create session
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionId, userId, expiresAt.toISOString()).run();
    
    // Return session cookie
    return new Response(JSON.stringify({ 
      success: true,
      user: { id: userId, email, username }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Login Endpoint

```typescript
// functions/api/auth/login.ts
import { verifyPassword, generateId } from './utils';

interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  try {
    const { email, password } = await request.json();
    
    // Get user
    const user = await env.DB.prepare(
      'SELECT id, email, password_hash FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password_hash as string);
    
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get profile
    const profile = await env.DB.prepare(
      'SELECT username FROM profiles WHERE user_id = ?'
    ).bind(user.id).first();
    
    // Create session
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionId, user.id, expiresAt.toISOString()).run();
    
    return new Response(JSON.stringify({ 
      success: true,
      user: { 
        id: user.id, 
        email: user.email,
        username: profile?.username 
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

## 🔗 Links API Implementation

```typescript
// functions/api/links/index.ts
interface Env {
  DB: D1Database;
}

// GET - Get user's links
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  // Get session from cookie
  const cookie = request.headers.get('Cookie');
  const sessionId = cookie?.match(/session=([^;]+)/)?.[1];
  
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Verify session
  const session = await env.DB.prepare(
    'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
  ).bind(sessionId).first();
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Get links
  const { results } = await env.DB.prepare(
    'SELECT * FROM links WHERE user_id = ? ORDER BY position ASC'
  ).bind(session.user_id).all();
  
  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST - Create new link
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  // Get session
  const cookie = request.headers.get('Cookie');
  const sessionId = cookie?.match(/session=([^;]+)/)?.[1];
  
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const session = await env.DB.prepare(
    'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
  ).bind(sessionId).first();
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Get request body
  const { title, url, description } = await request.json();
  
  // Get max position
  const maxPos = await env.DB.prepare(
    'SELECT MAX(position) as max_pos FROM links WHERE user_id = ?'
  ).bind(session.user_id).first();
  
  const position = (maxPos?.max_pos as number || 0) + 1;
  
  // Create link
  const linkId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO links (id, user_id, title, url, description, position) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(linkId, session.user_id, title, url, description, position).run();
  
  // Get created link
  const link = await env.DB.prepare(
    'SELECT * FROM links WHERE id = ?'
  ).bind(linkId).first();
  
  return new Response(JSON.stringify(link), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## 🎨 Frontend Implementation

### Dashboard HTML

```html
<!-- public/dashboard.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - LinkHub</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <span class="text-xl font-bold">LinkHub</span>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/dashboard.html" class="text-gray-700 hover:text-indigo-600">Links</a>
                    <a href="/settings.html" class="text-gray-700 hover:text-indigo-600">Settings</a>
                    <button id="logoutBtn" class="text-gray-700 hover:text-red-600">Logout</button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold">Your Links</h1>
                <a id="viewProfileBtn" href="#" target="_blank" 
                   class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    View Public Page
                </a>
            </div>

            <!-- Add Link Button -->
            <button id="addLinkBtn" 
                    class="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 mb-4">
                + Add New Link
            </button>

            <!-- Links List -->
            <div id="linksList" class="space-y-3"></div>
        </div>
    </div>

    <script src="/js/dashboard.js"></script>
</body>
</html>
```

### Dashboard JavaScript

```javascript
// public/js/dashboard.js
class Dashboard {
    constructor() {
        this.links = [];
        this.init();
    }

    async init() {
        await this.checkAuth();
        await this.loadLinks();
        this.setupEventListeners();
    }

    async checkAuth() {
        // Check if user is logged in
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }
        const user = await response.json();
        document.getElementById('viewProfileBtn').href = `/${user.username}`;
    }

    async loadLinks() {
        const response = await fetch('/api/links');
        if (response.ok) {
            this.links = await response.json();
            this.renderLinks();
        }
    }

    renderLinks() {
        const container = document.getElementById('linksList');
        container.innerHTML = '';

        if (this.links.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <p>No links yet. Click the button above to add your first link!</p>
                </div>
            `;
            return;
        }

        this.links.forEach(link => {
            const linkEl = document.createElement('div');
            linkEl.className = 'bg-white border rounded-lg p-4 flex items-center justify-between';
            linkEl.innerHTML = `
                <div class="flex-1">
                    <h3 class="font-medium">${link.title}</h3>
                    <p class="text-sm text-gray-600">${link.url}</p>
                    <p class="text-xs text-gray-500 mt-1">${link.click_count} clicks</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="dashboard.editLink('${link.id}')" 
                            class="text-blue-600 hover:text-blue-700">Edit</button>
                    <button onclick="dashboard.deleteLink('${link.id}')" 
                            class="text-red-600 hover:text-red-700">Delete</button>
                </div>
            `;
            container.appendChild(linkEl);
        });
    }

    setupEventListeners() {
        document.getElementById('addLinkBtn').addEventListener('click', () => {
            this.showAddLinkModal();
        });

        document.getElementById('logoutBtn').addEventListener('click', async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        });
    }

    showAddLinkModal() {
        const title = prompt('Link Title:');
        if (!title) return;

        const url = prompt('URL:');
        if (!url) return;

        const description = prompt('Description (optional):');

        this.addLink({ title, url, description });
    }

    async addLink(data) {
        const response = await fetch('/api/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            await this.loadLinks();
        }
    }

    async deleteLink(id) {
        if (!confirm('Delete this link?')) return;

        const response = await fetch(`/api/links/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await this.loadLinks();
        }
    }
}

const dashboard = new Dashboard();
```

## 🚀 Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Implement Cloudflare Pages version"
git push origin cloudflare-implementation
```

### Step 2: Connect to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click "Pages" in the sidebar
3. Click "Create a project"
4. Click "Connect to Git"
5. Select your repository
6. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
7. Click "Save and Deploy"

### Step 3: Configure Environment Variables

In Cloudflare Pages dashboard:
1. Go to Settings → Environment Variables
2. Add any required variables
3. Redeploy

### Step 4: Bind D1 Database

1. Go to Settings → Functions
2. Add D1 database binding:
   - Variable name: `DB`
   - D1 database: Select your database

## 📊 Performance Comparison

| Metric | Cloudflare | Vercel + Supabase |
|--------|-----------|-------------------|
| Cold Start | 0ms | 50-200ms |
| Response Time | 10-50ms | 100-300ms |
| Global Latency | <50ms | 100-500ms |
| Bandwidth | Unlimited | 100GB/mo |
| Database Queries | Edge | Centralized |

## ✅ Next Steps

1. Complete the implementation following this guide
2. Test locally with `wrangler pages dev`
3. Deploy to Cloudflare Pages
4. Configure custom domain (optional)
5. Monitor performance in Cloudflare dashboard

## 📚 Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

**Ready to build with Cloudflare? Let's continue with the full implementation!** 🚀