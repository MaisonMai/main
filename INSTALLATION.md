# Hinted - Installation & Setup Guide

## Quick Start

### 1. Install Dependencies

Due to network issues during setup, you may need to run:

```bash
npm install
```

If you encounter network errors, try:

```bash
npm install --verbose
# or
npm install --legacy-peer-deps
# or
yarn install
```

### 2. Environment Setup

Your `.env` file is already configured with Supabase credentials. Verify it contains:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_key (optional)
```

### 3. Database Setup

Your database is already set up with these migrations:
- `20251018152810_create_hinted_schema.sql` - Core tables
- `20251018170535_add_person_preferences_and_ai_analysis.sql` - AI learning system

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

## Features Overview

### Core Features
- **People Management**: Track relationships, birthdays, notes
- **Gift Ideas**: Save gift ideas with URLs, prices, priorities
- **Reminders**: Set birthday and occasion reminders
- **AI Suggestions**: Get personalized gift recommendations

### AI Learning System
- Analyzes person notes when added/updated
- Learns from gift URLs and descriptions
- Builds preference profiles automatically
- Provides increasingly personalized suggestions

### Mobile PWA
- Install on iOS/Android home screen
- Offline functionality
- Native app experience
- Push notification ready

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard layout
│   ├── AuthForm.tsx     # Login/signup
│   ├── PeopleView.tsx   # People management
│   ├── GiftsView.tsx    # Gift ideas view
│   ├── PersonDetail.tsx # Individual person page
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── lib/               # Utilities and services
│   ├── supabase.ts    # Supabase client & types
│   └── aiService.ts   # AI analysis functions
└── App.tsx            # Root component

supabase/
└── migrations/        # Database migrations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **PWA**: vite-plugin-pwa, Workbox
- **AI**: OpenAI API (optional)
- **Icons**: Lucide React

## Database Tables

- `profiles` - User profiles
- `people` - People you're tracking
- `gift_ideas` - Gift ideas for people
- `reminders` - Birthday and occasion reminders
- `person_preferences` - AI-learned preferences
- `gift_analysis` - AI analysis of gift ideas

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Supabase handles authentication
- API keys stored in environment variables

## Deployment

See `MOBILE_DEPLOYMENT.md` for PWA deployment instructions.

Recommended hosting platforms:
- **Netlify**: Zero-config, automatic deploys
- **Vercel**: Optimized for React apps
- **Cloudflare Pages**: Fast global CDN
- **Firebase Hosting**: Google infrastructure

## Troubleshooting

### npm install fails
- Check internet connection
- Try `npm cache clean --force`
- Use `npm install --legacy-peer-deps`
- Try yarn: `yarn install`

### Build fails
- Run `npm run typecheck` to find TypeScript errors
- Ensure all dependencies are installed
- Check Node.js version (v16+ recommended)

### Service worker not loading
- HTTPS required in production
- Run `npm install` to get vite-plugin-pwa
- Check browser console for errors

### AI features not working
- Set `VITE_OPENAI_API_KEY` in `.env`
- Restart dev server after changing `.env`
- Check OpenAI API quota/billing

## Support & Documentation

- Supabase Docs: https://supabase.com/docs
- Vite PWA Plugin: https://vite-pwa-org.netlify.app/
- React Docs: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/docs

---

**Ready to use!** Once dependencies are installed, run `npm run dev` to start developing.
