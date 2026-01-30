# Simple Markdown Blog

A minimal blog website that reads Markdown files and displays them as web pages.

## Deployment

**GitHub Pages:**
1. Push this repository to GitHub
2. Go to Settings > Pages
3. Select "Deploy from a branch" and choose `main`
4. Your blog will be live at `https://yourusername.github.io/repository-name`

**Netlify:**
1. Connect your GitHub repository to Netlify
2. Deploy settings: Build command: (leave empty), Publish directory: `/`
3. Your blog will be live at the provided Netlify URL

## Local Development

1. **Start local server**: Run `python3 server.py`
2. **View your blog**: Open http://localhost:8000

## How to Use

1. **Add your blog posts**: Create `.md` files in the `posts/` directory
2. **Update the file list**: Edit `index.html` and add your new markdown files to the `blogFiles` array
3. **Deploy**: Push to GitHub and your changes will be live

## Adding New Posts

1. Create a new `.md` file in the `posts/` directory (e.g., `my-new-post.md`)
2. Write your content in Markdown format
3. Add the filename to the `blogFiles` array in `index.html`:
   ```javascript
   const blogFiles = [
       'sample-post.md',
       'my-new-post.md',  // Add this line
   ];
   ```

## File Structure
```
Blogs/
├── index.html          # Main blog page
├── server.py          # Local development server (optional)
├── posts/             # Your markdown blog posts
│   └── sample-post.md
└── README.md          # This file
```
