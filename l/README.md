# Polor - Free Quiz Platform for Teachers & Students

Polor is a free web-based quiz platform designed for K-12 teachers and students. It uses AI to generate quiz content and images, supports real-time multiplayer games, and prioritizes accessibility.

## Features

- 🤖 **AI-Powered Quiz Generation** - Create quizzes from simple ideas using Pollinations API
- 🌍 **Multilingual Support** - Support for multiple languages (when enabled by teacher)
- 🎮 **Game Modes** - Classic synchronized mode and Fishing asynchronous mode
- 👤 **Avatar System** - Customizable avatars for students
- ♿ **Accessibility** - Dyslexia font support and keyboard navigation
- 🔥 **Real-time Multiplayer** - Powered by Firebase
- 💰 **Free to Use** - Built on free tiers and $0 budget approach

## Tech Stack

- **Frontend**: HTML/CSS/JavaScript (static)
- **Hosting**: Cloudflare Pages
- **Backend**: Firebase (Auth, Realtime Database, Storage)
- **AI**: Pollinations API (text + image generation)
- **Domain**: polor.org

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/polor.git
cd polor
```

### 2. Set Up Firebase

1. Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Google provider)
3. Create a Realtime Database
4. Create a Storage bucket
5. Copy your Firebase config to `js/config.js`

### 3. Set Up Google Drive API (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Drive API
3. Create credentials (OAuth 2.0 client ID)
4. Add your client ID to the config

### 4. Set Up Pollinations API

1. Get API keys from [https://pollinations.ai/](https://pollinations.ai/)
2. Create `keys.txt` file with your API keys (one per line)
3. Add at least one key to avoid rate limits

### 5. Configure Environment

1. Copy `env.example` to `.env`
2. Fill in your Firebase configuration
3. Add your Google API keys

### 6. Deploy to Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command to: `echo "Static site - no build needed"`
3. Set output directory to: `.`
4. Add environment variables in Cloudflare Pages settings

## File Structure

```
polor/
├── assets/                 # General assets (images, icons, fonts)
├── avatars/               # Avatar assets
│   ├── backgrounds/       # Background images
│   ├── bases/            # Base avatar images
│   ├── brows/            # Eyebrow images
│   ├── eyes/             # Eye images
│   ├── glasses/          # Glasses images
│   ├── hair/             # Hair images
│   ├── hats/             # Hat images
│   ├── mouths/           # Mouth images
│   ├── neck/             # Neck accessory images
│   ├── noses/            # Nose images
│   └── tops/             # Clothing images
├── js/                   # JavaScript files
│   ├── config.js         # Configuration
│   ├── utils.js          # Utility functions
│   ├── avatar.js         # Avatar system
│   ├── firebase.js       # Firebase integration
│   ├── ui.js            # UI management
│   ├── game.js          # Game logic
│   └── main.js          # Main application
├── styles/               # CSS files
│   └── main.css         # Main stylesheet
├── index.html           # Main HTML file
├── keys.txt.example     # Example API keys file
├── env.example          # Example environment file
└── README.md           # This file
```

## Configuration

### Firebase Setup

1. **Authentication**: Enable Google sign-in
2. **Realtime Database**: Set up with these rules:
   ```json
   {
     "rules": {
       "games": {
         ".read": true,
         ".write": "auth != null"
       },
       "quizSets": {
         ".read": "auth != null",
         ".write": "auth != null && (!data.exists() || data.child('createdBy').val() == auth.uid)"
       }
     }
   }
   ```
3. **Storage**: Create bucket for quiz data

### Avatar System

The avatar system uses layered images in the `/avatars/` directory. Each category has:
- Base images (e.g., `base.png`)
- Overlay images (e.g., `baseoverlay.png`)

Images should be the same size and properly aligned for layering.

## Game Modes

### Classic Mode
- Synchronized questions for all students
- Teacher controls question progression
- Real-time leaderboard updates

### Fishing Mode
- Asynchronous questions
- Students progress independently
- Fish-catching theme with points system

## Development

### Local Development

1. Serve the files using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

2. Open `http://localhost:8000` in your browser

### Adding New Features

1. **New Game Modes**: Add to `js/game.js` and update UI
2. **New Avatar Categories**: Add to `js/avatar.js` and create image folders
3. **New Languages**: Add to `CONFIG.languages` in `js/config.js`
4. **New Quiz Types**: Extend the quiz JSON structure

## API Integration

### Pollinations API

Used for:
- Text generation (quiz questions and answers)
- Image generation (question illustrations)

Rate limits: 1 request per 5 seconds per API key

### Google Drive API

Used for:
- Importing quizzes from Google Docs
- Importing quizzes from Google Forms

## Accessibility

- **Dyslexia Font**: Toggle in settings
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliant

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, please open an issue on GitHub or contact us at support@polor.org.

## Roadmap

- [ ] YouTube video import
- [ ] Advanced teacher analytics
- [ ] Student reactions/emojis
- [ ] Quiz set sharing
- [ ] More game modes (racing, tower defense, battle royale)
- [ ] Premium teacher accounts

---

**Built with ❤️ for educators and students worldwide**
