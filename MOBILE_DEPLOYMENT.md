# Mobile Deployment Guide for Hinted

Hinted is now configured as a Progressive Web App (PWA) that can be installed on iOS and Android devices like a native app.

## Features

- **Installable**: Users can add Hinted to their home screen
- **Offline Support**: Service worker caches assets for offline access
- **Native Feel**: Full-screen app experience without browser UI
- **Fast Loading**: Optimized caching for Supabase API calls
- **App Icons**: Custom Hinted branding on device home screens

## How Users Can Install

### On iOS (iPhone/iPad)

1. Open the deployed website in Safari
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right corner
5. The Hinted app icon will appear on the home screen

**Note**: iOS requires Safari browser for PWA installation.

### On Android

1. Open the deployed website in Chrome
2. Tap the menu (three dots) in the top right
3. Tap "Add to Home screen" or "Install app"
4. Confirm by tapping "Install"
5. The Hinted app icon will appear on the home screen

**Alternative**: Chrome will show an "Install" banner automatically when the site is visited.

## Deployment Steps

### 1. Install Dependencies

Run the following command to install PWA dependencies:

```bash
npm install
```

### 2. Build the PWA

```bash
npm run build
```

This will generate:
- Optimized production build in `dist/`
- Service worker file (`sw.js`)
- Web app manifest (`manifest.webmanifest`)

### 3. Deploy to Hosting

Deploy the `dist/` folder to your hosting platform:

**Netlify**:
```bash
# Already configured with _redirects file
# Just connect your repo and deploy
```

**Vercel**:
```bash
vercel --prod
```

**Other Platforms**:
- Upload the entire `dist/` folder
- Ensure SPA redirects are configured (all routes → index.html)

### 4. Enable HTTPS

PWAs require HTTPS for service workers to function. Most hosting platforms provide this automatically.

## Testing PWA Functionality

### Chrome DevTools (Desktop)

1. Open your deployed site in Chrome
2. Open DevTools (F12)
3. Go to "Application" tab
4. Check "Manifest" section for PWA config
5. Check "Service Workers" for registration status
6. Use "Lighthouse" tab to run PWA audit

### Mobile Testing

**iOS Safari**:
- Service workers have limited functionality
- Install and test the home screen experience
- Verify offline caching works

**Android Chrome**:
- Full PWA support with install prompts
- Test offline functionality thoroughly
- Verify push notifications (if added later)

## PWA Configuration Details

### Manifest (`vite.config.ts`)

- **Name**: Hinted - Gift Tracking & Reminders
- **Short Name**: Hinted
- **Theme Color**: #10B981 (Hinted green)
- **Display Mode**: Standalone (full-screen)
- **Start URL**: / (root)
- **Orientation**: Portrait

### Service Worker Caching

The PWA automatically caches:
- All static assets (JS, CSS, images)
- Supabase API responses (24-hour cache)
- Network-first strategy for API calls

### Icon Requirements

Current setup uses the Hinted logo (1024x1024) for all icon sizes.

For production, consider generating multiple sizes:
- 72x72 (Android)
- 96x96 (Android)
- 128x128 (Android)
- 144x144 (Android)
- 152x152 (iOS)
- 192x192 (Android)
- 384x384 (Android)
- 512x512 (Android, Splash screens)

Use tools like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## Troubleshooting

### Service Worker Not Registering

- Verify HTTPS is enabled
- Check browser console for errors
- Clear browser cache and reload
- Ensure `vite-plugin-pwa` is installed

### Install Prompt Not Showing

- Must be served over HTTPS
- User must visit site at least once
- Some browsers require multiple visits
- Check PWA criteria in Chrome DevTools Lighthouse

### Icons Not Appearing

- Verify icon file exists in `/public` folder
- Check manifest configuration in browser DevTools
- Clear browser cache
- Re-add to home screen

### iOS-Specific Issues

- Use Safari only for installation
- Some PWA features are limited on iOS
- Test thoroughly on actual devices
- Verify apple-touch-icon is set correctly

## Future Enhancements

Consider adding:

1. **Push Notifications**: Remind users of upcoming birthdays
2. **Background Sync**: Sync data when connection is restored
3. **Share Target**: Allow sharing links to save as gift ideas
4. **Shortcuts**: Quick actions from home screen icon
5. **App Shortcuts**: Add new person/gift from app icon menu

## Support

For issues or questions about mobile deployment:
- Check browser console for errors
- Use Chrome DevTools PWA audit
- Test on real devices, not just emulators
- Verify all URLs use HTTPS

---

**Note**: PWA installation is optional. The web app works perfectly in any modern browser without installation.
