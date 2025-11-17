# Deploying Seating Chart Generator to GitHub Pages

## Step-by-Step Guide

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `seating-chart` (or any name you prefer)
   - **Description**: "Seating Chart Generator for Teachers"
   - **Public** or **Private** (both work with GitHub Pages)
   - Don't initialize with README (you already have files)
4. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

Open your terminal in the project directory and run:

```bash
# Navigate to your project directory
cd /home/nlod/claude/seating-charter

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Seating Chart Generator web app"

# Add your GitHub repository as remote
# Replace USERNAME and REPO_NAME with your values
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Example:**
If your username is `jsmith` and repo is `seating-chart`:
```bash
git remote add origin https://github.com/jsmith/seating-chart.git
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** (top menu)
3. Click **"Pages"** (left sidebar)
4. Under **"Source"**:
   - Branch: Select **"main"** (or your default branch)
   - Folder: Select **"/ (root)"**
5. Click **"Save"**

### Step 4: Wait for Deployment

- GitHub will build and deploy your site (takes 1-2 minutes)
- Refresh the Settings → Pages page
- You'll see: **"Your site is live at https://USERNAME.github.io/REPO_NAME/"**

### Step 5: Access Your Site

Your seating chart generator will be available at:
```
https://USERNAME.github.io/REPO_NAME/
```

**Example:**
```
https://jsmith.github.io/seating-chart/
```

## Updating Your Site

Whenever you make changes:

```bash
# Make your changes to files
# Then commit and push

git add .
git commit -m "Description of changes"
git push
```

GitHub Pages will automatically rebuild and deploy (takes 1-2 minutes).

## Troubleshooting

### Issue: 404 Page Not Found

**Solution:** Make sure you selected **"/ (root)"** as the folder in GitHub Pages settings.

### Issue: Site doesn't update after pushing changes

**Solution:**
1. Check the "Actions" tab in your repository to see if the deployment succeeded
2. Clear your browser cache (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
3. Wait a few minutes - deployments can take time

### Issue: Can't push to GitHub

**Solution:** You may need to authenticate. Options:
1. **Personal Access Token** (recommended):
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with "repo" permissions
   - Use token as password when pushing

2. **SSH Key**:
   - Set up SSH key: [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

## Custom Domain (Optional)

To use your own domain (e.g., `seating.yourschool.com`):

1. In GitHub Pages settings, enter your custom domain
2. Configure DNS with your domain provider:
   - Add a CNAME record pointing to `USERNAME.github.io`
3. Wait for DNS propagation (can take 24-48 hours)

## Privacy & Security Notes

- GitHub Pages sites are **always public** (even if the repo is private)
- This is fine for this app because:
  - No student data is stored on the server
  - All processing happens in the user's browser
  - YAML files are uploaded by teachers, not stored anywhere
- Teachers should **never** commit student data to the repository
- Only commit the application code, not actual classroom data

## Alternative: Download and Use Locally

If you prefer not to publish online, teachers can:

1. Download the entire repository as a ZIP file
2. Extract it anywhere on their computer
3. Open `index.html` in their browser
4. Works 100% offline - no internet needed

### Running Locally with Python's Built-in Server (Optional)

For a more "server-like" experience locally:

```bash
# Navigate to the project directory
cd /path/to/seating-charter

# Start a simple HTTP server (Python 3)
python3 -m http.server 8000

# Or on Windows:
python -m http.server 8000

# Then visit in your browser:
# http://localhost:8000
```

This is useful for development or if you want to test the app as it would appear on GitHub Pages.

**Note:** The app works perfectly fine by just opening `index.html` directly - the Python server is completely optional.

## Support

For issues with GitHub Pages specifically, see:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)
