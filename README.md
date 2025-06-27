# Masjid Fundraiser Appeal Website

A modern, responsive website for the Masjid Fundraiser Appeal at Government Pilot Secondary School SIAKH.

## Features

### ✨ New Features Added

1. **Dynamic Open Graph Images (PNG & SVG)**
   - Automatically generated progress visualization for social media sharing
   - Shows current fundraising progress with animated circle
   - **NEW**: PNG format for better WhatsApp and social media compatibility
   - Updates when you run the update script

2. **Real Image Slider**
   - Smooth sliding gallery with navigation arrows
   - Touch/swipe support for mobile devices
   - Keyboard navigation (arrow keys)
   - Auto-play functionality
   - Dot indicators for easy navigation
   - Supports both images and videos

3. **Enhanced Content**
   - English section explaining the project and its importance
   - Urdu section with Islamic appeal for donations
   - Responsive layout that works on all devices

4. **Improved Responsiveness**
   - Featured image maintains aspect ratio on all screen sizes
   - Mobile-optimized layout
   - Better typography scaling

## How to Use

### Updating Progress Data

1. **Update Contributions**: Edit `contributions.json` to add new donations
2. **Update Expenses**: Edit `expenses.json` to modify project requirements
3. **Regenerate Images**: Run one of the update scripts to refresh the Open Graph image:

```bash
# Generate PNG directly (Recommended for WhatsApp compatibility)
npm run update-og

# Or use the old SVG method
npm run update-og-svg

# Or convert existing SVG to PNG
npm run convert-svg-to-png
```

### Adding New Images/Videos

1. Place new media files in the appropriate folders:
   - `images/3d-mpas/` - 3D model images
   - `images/current-progress/` - Construction progress photos
   - `images/videos/` - Video files

2. Update the `mediaItems` array in `script.js` to include new files

### Customization

- **Colors**: Modify the CSS variables in `style.css`
- **Content**: Edit the text in `index.html`
- **Slider Speed**: Change the auto-play interval in `script.js` (currently 5 seconds)

## File Structure

```
├── index.html              # Main website file
├── style.css               # Styling and responsive design
├── script.js               # JavaScript functionality
├── og-progress.png         # Dynamic Open Graph image (PNG format)
├── og-progress.svg         # Dynamic Open Graph image (SVG format)
├── update-og-png.js        # Script to update PNG with current data
├── update-og-svg.js        # Script to update SVG with current data
├── svg-to-png-converter.js # Script to convert SVG to PNG
├── package.json            # Node.js dependencies
├── contributions.json      # Donation data
├── expenses.json           # Project expense data
├── images/                 # Media files
│   ├── 3d-mpas/           # 3D model images
│   ├── current-progress/  # Construction photos
│   ├── videos/            # Video files
│   └── Masjid appeal.png  # Featured image
└── README.md              # This file
```

## Social Media Sharing

The website includes comprehensive Open Graph and Twitter Card meta tags for optimal sharing on social media platforms. The `og-progress.png` file provides a visual representation of the current fundraising progress and is compatible with WhatsApp and other platforms that don't support SVG.

### PNG vs SVG

- **PNG Format**: Better compatibility with WhatsApp, Facebook, and other social platforms
- **SVG Format**: Smaller file size and scalable, but limited platform support
- **Recommendation**: Use PNG for maximum compatibility

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers with touch support
- Responsive design for all screen sizes

## Islamic Features

- Arabic text support with proper RTL layout
- Islamic quotes and references
- Emphasis on sadaqah jariyah (ongoing charity)
- Respectful and appropriate design for religious content

## Installation

To use the PNG generation features, install the required dependencies:

```bash
npm install
```

---

*May Allah (SWT) accept our efforts and bless this noble project. Ameen.* 