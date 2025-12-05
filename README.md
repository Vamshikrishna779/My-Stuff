# My Stuff - Personal Watched History Tracker

A modern Progressive Web App (PWA) for tracking movies, anime, TV shows, K-dramas, and J-dramas you've watched. Built with React, Vite, and powered by The Movie Database (TMDb) API.

![My Stuff PWA](https://img.shields.io/badge/PWA-Ready-success)
![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)

## ✨ Features

### Core Functionality
- 🔍 **Live Search** - Search movies, shows, anime, K-dramas, and J-dramas using TMDb API
- ➕ **One-Click Add** - Quickly add items to your watched list
- 🎯 **Manual Category Selection** - Choose the category before adding (Movies, Anime, K-Dramas, J-Dramas, Shows)
- 🤖 **Auto-Categorization** - Smart detection of content type with manual override option
- 🗂️ **Category Filtering** - Filter your watched items by category with item count badges
- 🗑️ **Easy Management** - Remove items with confirmation dialog

### Data & Storage
- 💾 **Local Storage** - All data stored in IndexedDB (no account required)
- 📥 **Export** - Download your watched list as JSON
- 📤 **Import** - Restore your data from JSON backup
- 🔄 **Offline Support** - View your saved items even without internet

### User Experience
- 🌓 **Light/Dark Mode** - Toggle between themes with preference persistence
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- ⚡ **Fast & Smooth** - Debounced search, smooth animations, optimized performance
- 🎨 **Modern Design** - Clean, minimal interface with gradient accents

### PWA Features
- 📲 **Installable** - Add to home screen on mobile and desktop
- 🔌 **Offline Ready** - Service worker caching for offline access
- 🚀 **Fast Loading** - Cached app shell for instant startup
- 🔄 **Auto Updates** - Automatic service worker updates with user confirmation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- TMDb API Key (free - see setup below)

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd "c:\Vamshikrishna_4rth year_WIN SEM\Resume\my-stuff"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`

### Getting Your TMDb API Key

1. Create a free account at [TMDb](https://www.themoviedb.org/signup)
2. Go to **Settings** → **API**
3. Click **"Request an API Key"**
4. Choose **"Developer"**
5. Fill out the form and submit
6. Copy your API key
7. In the app, click the **⚙️ Settings** icon
8. Paste your API key and click **Save**

## 📖 How to Use

### Adding Items

1. **Search** - Type a movie, show, anime, or drama name in the search bar
2. **Review** - See search results with posters, year, and auto-detected category
3. **Select Category** - Use the dropdown to choose or confirm the category:
   - 🎬 Movies
   - 🎌 Anime
   - 🇰🇷 K-Dramas
   - 🇯🇵 J-Dramas
   - 📺 Shows
4. **Add** - Click the "+ Add" button
5. **Done** - Item appears in your watched list!

### Managing Your List

- **Filter by Category** - Click tabs at the top (All, Movies, Anime, K-Dramas, J-Dramas, Shows)
- **Remove Items** - Hover over a card → Click ✕ → Confirm deletion
- **Export Data** - Settings → Export Data (downloads JSON file)
- **Import Data** - Settings → Import Data (select JSON file)
- **Clear All** - Settings → Clear All Data (with confirmation)

### Theme Toggle

- Click **🌙** for dark mode or **☀️** for light mode
- Your preference is saved automatically

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **Vite 7.2** - Build tool and dev server

### PWA
- **vite-plugin-pwa** - PWA plugin for Vite
- **Workbox** - Service worker utilities
- **Web App Manifest** - Installation metadata

### Data & APIs
- **TMDb API v3** - Movie and TV show data
- **IndexedDB (via idb)** - Local data storage
- **LocalStorage** - Settings and preferences

### Styling
- **Vanilla CSS** - Custom styles with CSS variables
- **CSS Grid & Flexbox** - Responsive layouts
- **CSS Animations** - Smooth transitions and effects

## 📁 Project Structure

```
my-stuff/
├── public/
│   └── icons/              # PWA app icons
├── src/
│   ├── components/         # React components
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── WatchedList.tsx
│   │   ├── WatchedItemCard.tsx
│   │   └── SettingsModal.tsx
│   ├── services/           # Business logic
│   │   ├── tmdbService.ts
│   │   └── storageService.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useSearch.ts
│   │   ├── useWatchedItems.ts
│   │   └── useTheme.ts
│   ├── utils/              # Constants and utilities
│   │   └── constants.ts
│   ├── App.tsx             # Main app component
│   ├── App.css             # Global styles
│   └── main.tsx            # Entry point
├── vite.config.ts          # Vite + PWA configuration
└── package.json            # Dependencies
```

## 🎨 Category Color Scheme

| Category | Color | Usage |
|----------|-------|-------|
| Movies | 🔴 Red (#ef4444) | Feature films |
| Anime | 🟣 Purple (#a855f7) | Japanese animation |
| K-Dramas | 🩷 Pink (#ec4899) | Korean dramas |
| J-Dramas | 🔵 Blue (#3b82f6) | Japanese dramas |
| Shows | 🟢 Green (#22c55e) | TV shows & web series |

## 🔧 Available Scripts

```bash
# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Open the app in your browser
2. Look for the install icon in the address bar
3. Click "Install My Stuff"
4. App opens in standalone window

### Mobile (iOS/Android)
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the share button
3. Select "Add to Home Screen"
4. App appears on your home screen

## 🌐 Offline Support

The app works offline with the following capabilities:

**Available Offline:**
- ✅ View all saved items
- ✅ Filter by category
- ✅ Remove items
- ✅ Toggle theme
- ✅ Export data

**Requires Internet:**
- ❌ Search for new items
- ❌ Fetch poster images (cached after first load)

## 🔒 Privacy & Data

- **No Account Required** - Everything is stored locally
- **No Tracking** - No analytics or tracking scripts
- **Your Data, Your Device** - All data stays on your device
- **Export Anytime** - Download your data as JSON
- **No Backend** - Pure client-side application

## 🐛 Troubleshooting

### Search Not Working
- Ensure you've added your TMDb API key in Settings
- Check your internet connection
- Verify the API key is correct

### Items Not Saving
- Check browser storage permissions
- Ensure IndexedDB is enabled
- Try clearing browser cache and reimporting data

### PWA Not Installing
- Use a supported browser (Chrome, Edge, Safari)
- Ensure you're on HTTPS or localhost
- Check browser PWA support

### Offline Mode Issues
- Ensure service worker is registered (check DevTools → Application)
- Try refreshing the page
- Clear service worker cache and reload

## 🚀 Performance

- **Initial Load**: < 2s on 3G
- **Search Debounce**: 300ms
- **Lighthouse PWA Score**: 90+
- **Bundle Size**: Optimized with Vite

## 🤝 Contributing

This is a personal project, but feel free to:
- Fork the repository
- Submit issues
- Suggest features
- Share improvements

## 📄 License

This project is open source and available for personal use.

## 🙏 Acknowledgments

- **TMDb** - For the comprehensive movie and TV database API
- **React Team** - For the amazing UI framework
- **Vite Team** - For the blazing fast build tool
- **Workbox** - For PWA service worker utilities

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the TMDb API documentation
3. Check browser console for errors

## 🎯 Future Enhancements

Potential features for future versions:
- [ ] Ratings and personal notes
- [ ] Watch date tracking
- [ ] Statistics dashboard
- [ ] Search history
- [ ] Multiple lists (Want to Watch, Favorites, etc.)
- [ ] Cloud sync option
- [ ] Recommendations based on watched items
- [ ] Genre filtering
- [ ] Year range filtering
- [ ] Sort options (by date added, title, year)

---

**Built with ❤️ using React + Vite + PWA**

*Last Updated: December 2025*
