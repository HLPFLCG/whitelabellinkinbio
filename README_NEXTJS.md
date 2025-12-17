# LinkHub - Open Source Linktree Alternative

A modern, full-stack link-in-bio platform built with Next.js 14, Supabase, and Tailwind CSS. Create your personalized link page with authentication, analytics, and unlimited customization.

## ✨ Features

- 🔐 **User Authentication** - Secure email/password registration and login
- 🔗 **Unlimited Links** - Add, edit, delete, and reorder your links
- 👤 **Custom Profiles** - Personalized URLs (yoursite.com/username)
- 📊 **Analytics** - Track link clicks and performance
- 🎨 **Customization** - Profile pictures, bios, and display names
- 📱 **Responsive Design** - Perfect on all devices
- ⚡ **Lightning Fast** - Server-side rendering for optimal performance
- 🔒 **Secure** - Row-level security with Supabase

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)
- Git installed

### 1. Clone the Repository

```bash
git clone https://github.com/HLPFLCG/whitelabellinkinbio.git
cd whitelabellinkinbio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (~2 minutes)
3. Go to Settings → API and copy:
   - Project URL
   - `anon` `public` key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Setup Database

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL from `IMPLEMENTATION_GUIDE.md` (Database Configuration section)
5. Click "Run" to execute the SQL

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating an Account

1. Go to `/register`
2. Fill in your details:
   - Username (will be your URL: yoursite.com/username)
   - Display name
   - Email
   - Password
3. Click "Sign up"
4. You'll be redirected to your dashboard

### Managing Links

1. Log in to your account
2. Go to the dashboard
3. Click "Add New Link"
4. Fill in:
   - Title (required)
   - URL (required)
   - Description (optional)
5. Click "Save"

### Viewing Your Public Page

Click "View Public Page" in the dashboard or visit `yoursite.com/yourusername`

### Customizing Your Profile

1. Go to Dashboard → Settings
2. Update:
   - Profile picture (enter image URL)
   - Username
   - Display name
   - Bio
3. Click "Save Changes"

## 🏗️ Project Structure

```
whitelabellinkinbio/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected dashboard pages
│   │   └── dashboard/
│   │       ├── page.tsx     # Link management
│   │       ├── settings/    # Profile settings
│   │       └── layout.tsx   # Dashboard layout
│   ├── [username]/          # Public profile pages
│   │   └── page.tsx
│   ├── api/                 # API routes
│   │   └── links/
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/
│   ├── auth/                # Auth components
│   ├── dashboard/           # Dashboard components
│   └── profile/             # Profile components
├── lib/
│   ├── supabase/            # Supabase clients
│   └── types/               # TypeScript types
├── .env.local               # Environment variables (create this)
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide React

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Configure Supabase for Production

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL"
3. Add redirect URLs:
   - `https://your-domain.vercel.app/auth/callback`

## 📊 Database Schema

### Tables

**profiles**
- User profile information
- Username (unique URL slug)
- Display name, bio, avatar
- Theme preferences

**links**
- User's links
- Title, URL, description
- Position (for ordering)
- Click tracking
- Active/inactive status

**social_links** (optional)
- Social media links
- Platform-specific data

## 🔒 Security Features

- Row Level Security (RLS) enabled
- JWT authentication
- HTTP-only cookies
- Input validation
- SQL injection prevention
- XSS protection

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### Adding Features

The codebase is modular and easy to extend. Common additions:

- QR code generation
- Custom domains
- Advanced analytics
- Theme customization
- Social media integration

## 📝 API Routes

### Links API

- `GET /api/links` - Get user's links
- `POST /api/links` - Create new link
- `PATCH /api/links/[id]` - Update link
- `DELETE /api/links/[id]` - Delete link

## 🐛 Troubleshooting

### "Invalid API key" error
- Check that `.env.local` exists and has correct values
- Restart the development server after adding env variables

### Database connection issues
- Verify Supabase project is active
- Check that SQL schema was executed successfully
- Ensure RLS policies are enabled

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors with `npm run build`

## 📚 Documentation

- [Full Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🆘 Support

- Check the [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- Review [Troubleshooting](#troubleshooting) section
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] QR code generation
- [ ] Custom domains
- [ ] Advanced analytics dashboard
- [ ] Theme customization
- [ ] Social OAuth (Google, GitHub)
- [ ] Link scheduling
- [ ] Team collaboration

---

**Built with ❤️ using Next.js, Supabase, and Tailwind CSS**

**Star ⭐ this repo if you find it helpful!**