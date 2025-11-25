# Google OAuth Configuration for Maison Mai

To change the Google OAuth consent screen from showing "iseawhxglrbkagsbxqfj.supabase.co" to "Maison Mai" and use your custom domain, follow these steps:

## Option 1: Configure in Supabase Dashboard (Recommended)

### Step 1: Update Site URL in Supabase
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Update the **Site URL** to: `https://maisonmai.co.uk`
5. Add to **Redirect URLs**:
   - `https://maisonmai.co.uk/auth/callback`
   - `https://maisonmai.co.uk`
6. Click **Save**

### Step 2: Update Google Cloud OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Update the following fields:
   - **Application name**: `Maison Mai`
   - **Application home page**: `https://maisonmai.co.uk`
   - **Application privacy policy link**: `https://maisonmai.co.uk/privacy`
   - **Application terms of service link**: `https://maisonmai.co.uk/terms`
   - **Authorised domains**: Add `maisonmai.co.uk`
5. Click **Save and Continue**

### Step 3: Update OAuth 2.0 Client ID
1. Still in Google Cloud Console
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorised JavaScript origins**, add:
   - `https://maisonmai.co.uk`
5. Under **Authorised redirect URIs**, add:
   - `https://maisonmai.co.uk/auth/callback`
   - `https://iseawhxglrbkagsbxqfj.supabase.co/auth/v1/callback`
6. Click **Save**

### Step 4: Update Supabase Google Provider Settings
1. Back in Supabase Dashboard
2. Go to **Authentication** → **Providers**
3. Click on **Google**
4. Ensure your **Client ID** and **Client Secret** are correct
5. Click **Save**

## Option 2: Use Custom Domain with Supabase (Advanced)

If you want to completely replace the Supabase URL with your custom domain:

### Step 1: Set up Custom Domain in Supabase
1. In Supabase Dashboard, go to **Settings** → **Custom Domains**
2. Add your custom domain: `maisonmai.co.uk`
3. Follow the DNS configuration instructions provided by Supabase
4. Wait for DNS propagation (can take up to 24 hours)

### Step 2: Update DNS Records
Add the following DNS records to your domain registrar:
- **CNAME** record pointing to your Supabase project

### Step 3: Update Application URLs
1. Once the custom domain is verified in Supabase
2. Update the Site URL to your custom domain
3. Update all redirect URLs accordingly

## Testing

After making these changes:

1. Clear your browser cache and cookies
2. Go to your app: `https://maisonmai.co.uk`
3. Click "Sign in with Google"
4. You should now see "Continue to Maison Mai" instead of the Supabase URL

## Important Notes

- DNS changes can take up to 48 hours to propagate globally
- Keep the Supabase callback URL in your Google OAuth settings until you've fully migrated to the custom domain
- Test thoroughly in incognito/private browsing mode
- The OAuth consent screen will only show your app name once Google has reviewed and approved it (if your app is in production mode)

## Current Status

Your app is currently using:
- **Supabase URL**: `https://iseawhxglrbkagsbxqfj.supabase.co`
- **Custom Domain**: `https://maisonmai.co.uk`

Make sure both are configured in Google OAuth until you've completed the migration.

## Support

If you encounter issues:
- Check Supabase logs in the Dashboard
- Verify all URLs match exactly (no trailing slashes where not needed)
- Ensure the OAuth consent screen is published (not in testing mode)
- Contact Supabase support for custom domain issues
