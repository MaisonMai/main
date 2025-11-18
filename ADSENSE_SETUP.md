# Google AdSense Setup Instructions

This application has been configured to display Google AdSense advertisements at the bottom of the app.

## Setup Steps

### 1. Sign up for Google AdSense
1. Visit [Google AdSense](https://www.google.com/adsense)
2. Sign in with your Google account
3. Complete the application process
4. Wait for approval (can take a few days)

### 2. Get Your Publisher ID
Once approved:
1. Log in to your AdSense account
2. Go to Account → Account Information
3. Copy your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXXX`)

### 3. Create an Ad Unit
1. In AdSense dashboard, go to **Ads** → **By ad unit**
2. Click **Display ads**
3. Create a new ad unit:
   - Name: "MaisonMai Bottom Banner"
   - Type: Display ad
   - Size: Responsive
4. Click **Create**
5. Copy the **Ad slot ID** (a numerical string)

### 4. Update Your Application

#### Update index.html
Replace `ca-pub-XXXXXXXXXXXXXXXXX` with your actual Publisher ID in:
```
/project/index.html
```

Line 27:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
 crossorigin="anonymous"></script>
```

#### Update AdBanner.tsx
Replace the placeholder values in:
```
/project/src/components/AdBanner.tsx
```

Update the default props:
```typescript
export function AdBanner({
  adClient = 'ca-pub-YOUR_PUBLISHER_ID', // Replace this
  adSlot = 'YOUR_AD_SLOT_ID',            // Replace this
  adFormat = 'auto'
}: AdBannerProps) {
```

### 5. Testing
- **Important**: Ads will NOT show during local development or on localhost
- Test ads may appear for 24-48 hours after setup
- Real ads will appear once Google verifies your site

### 6. Add Your Site to AdSense
1. In AdSense dashboard, go to **Sites**
2. Click **Add site**
3. Enter your production domain (e.g., `maisonmai.com`)
4. Follow verification instructions

### 7. Verify Implementation
1. Deploy your updated application
2. Visit your live site
3. Use Chrome DevTools → Console to check for AdSense errors
4. Ads should appear within 24-48 hours after verification

## Ad Placement

The ad banner is currently placed:
- **Location**: Bottom of the dashboard, above the footer
- **Component**: `<AdBanner />` in `Dashboard.tsx`
- **Style**: Full-width responsive banner

## Compliance

✅ Privacy Policy has been updated to include Google AdSense disclosure
✅ Users can opt-out via Google Ads Settings (link provided in Privacy Policy)

## Troubleshooting

**Ads not showing?**
- Verify Publisher ID and Ad Slot ID are correct
- Ensure site is verified in AdSense
- Check browser console for errors
- Ads don't show on localhost
- New sites may take 24-48 hours to display ads

**Policy violations?**
- Ensure content complies with [AdSense Program Policies](https://support.google.com/adsense/answer/48182)
- Don't click your own ads
- Don't encourage users to click ads

## Additional Resources
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)
- [AdSense Best Practices](https://support.google.com/adsense/answer/17957)
