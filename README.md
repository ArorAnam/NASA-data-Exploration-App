# NASA Explorer 🚀

A comprehensive web application to explore and visualize NASA's open data using React and Node.js/Express. Experience the wonders of space through stunning imagery, interactive visualizations, and immersive media content.

## 🌟 Features

### 🌌 Astronomy Picture of the Day (APOD)
- **Daily cosmic wonders** with high-resolution imagery and videos
- **Smooth animations** and elegant transitions
- **Interactive modal** for full-screen viewing
- **Professional layout** with centered content and beautiful typography
- **Copyright information** and detailed explanations
- **Mobile-responsive design** with optimized viewing experience

### 🚀 Mars Rover Photos
- **Multi-rover support** including Curiosity, Opportunity, Spirit, Perseverance, and Ingenuity
- **Enhanced dropdown selection** with mission details and descriptions
- **Interactive date picker** for exploring photos from specific Mars days (Sol)
- **Staggered card animations** for smooth photo loading
- **Detailed photo information** including camera details and Earth dates
- **Professional modal** with comprehensive metadata display
- **Responsive grid layout** adapting to all screen sizes

### ☄️ Near Earth Objects (NEOs) Dashboard
- **Advanced data visualizations** with multiple viewing modes:
  - Interactive data tables with sorting and filtering
  - Bar charts showing asteroid size distributions
  - Risk assessment matrix plotting size vs distance
  - Velocity distribution analysis
  - Discovery timeline showing asteroid discoveries over time
  - **3D orbital visualization** using Three.js for immersive space exploration
- **Real-time data** from NASA's NEO Web Service
- **Comprehensive statistics** and analytics
- **Export capabilities** for data analysis

### 🖼️ NASA Media Library
- **Comprehensive search functionality** across images, videos, and audio
- **Enhanced media players** with full playback controls:
  - Professional video player with custom styling
  - Beautiful audio player with NASA branding
  - Error handling with fallback options
- **Advanced search controls** with proper alignment and responsive design
- **Staggered card animations** and hover effects
- **Detailed modal views** with metadata and sharing capabilities
- **Download and share functionality** for all media types

## 🎨 Design & User Experience

### Visual Enhancements
- **Modern dark theme** with space-inspired aesthetics
- **Gradient text effects** and professional typography
- **Smooth animations** throughout the application
- **Glass-morphism effects** with backdrop filters
- **Responsive design** optimized for all devices
- **Professional loading states** with branded spinners
- **Consistent color scheme** with NASA blue (#2196F3) accents

### Interactive Elements
- **Hover effects** and smooth transitions
- **Professional buttons** with shimmer animations
- **Enhanced modals** with improved layouts
- **Staggered animations** for content loading
- **Touch-friendly** mobile interactions

## 🛠 Technical Stack

### Frontend
- **React 18** with modern hooks and functional components
- **React Router** for seamless navigation
- **Chart.js** for data visualizations
- **Three.js** for 3D orbital visualizations
- **Modern CSS** with flexbox, grid, and advanced effects
- **Responsive design** with mobile-first approach

### Backend
- **Node.js** with Express framework
- **NASA APIs integration** for real-time data
- **RESTful API design** with proper error handling
- **Environment configuration** for secure API key management
- **CORS configuration** for cross-origin requests

## 📁 Project Structure

```
nasa-explorer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.js         # Main application component
│   │   ├── App.css        # Comprehensive styling
│   │   ├── config.js      # API configuration
│   │   └── assets/        # Images and media files
│   └── public/            # Static files
├── server/                # Node.js backend
│   ├── index.js          # Express server
│   ├── index.test.js     # API tests
│   └── package.json      # Backend dependencies
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- NASA API key (get one at https://api.nasa.gov/)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone https://github.com/ArorAnam/NASA-data-Exploration-App.git
   cd nasa-explorer
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   
   Create a `.env` file:
   ```env
   NASA_API_KEY=your_nasa_api_key
   PORT=5051
   ```
   
   Start the server:
   ```bash
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5051

### Development Mode
Run both frontend and backend concurrently:
```bash
npm run dev
```

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```
Includes comprehensive API endpoint testing with Jest.

### Frontend Tests
```bash
cd client
npm test
```
React Testing Library tests for component functionality.

## 🌐 Deployment

### Production Deployment
- **Frontend**: Deployed on [Vercel](https://vercel.com/) with automatic deployments
- **Backend**: Deployed on [Render](https://render.com/) with environment variables
- **CDN**: Optimized asset delivery for global performance

### Environment Variables
```env
# Backend (.env)
NASA_API_KEY=your_nasa_api_key
PORT=5051

# Frontend (environment-specific)
REACT_APP_API_BASE_URL=your_backend_url
```

## 📊 API Endpoints

### Available Routes
- `GET /api/apod` - Astronomy Picture of the Day
- `GET /api/mars-photos` - Mars Rover Photos
- `GET /api/neo-feed` - Near Earth Objects data
- `GET /api/neo-lookup/:id` - Specific NEO details
- `GET /api/nasa-media` - NASA Media Library search

### Rate Limiting
- NASA APIs have rate limits (1000 requests/hour for registered keys)
- Implement caching for production use

## 🎯 Performance Optimizations

- **Lazy loading** for images and media content
- **Efficient state management** with React hooks
- **Optimized animations** with CSS transforms
- **Responsive images** with proper sizing
- **Code splitting** for faster initial loads
- **Error boundaries** for graceful error handling

## 🔧 Advanced Features

### 3D Visualization
- Interactive Three.js orbital viewer
- Real-time asteroid tracking
- Smooth camera controls and animations

### Data Analytics
- Statistical analysis of NEO data
- Interactive charts and graphs
- Export functionality for research

### Media Handling
- Full video playback with custom controls
- Professional audio player interface
- Comprehensive error handling and fallbacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for providing incredible open data APIs
- **React** and **Node.js** communities for excellent documentation
- **Three.js** for 3D visualization capabilities
- **Chart.js** for beautiful data visualizations

## 🔗 Links

- [Live Application](your-deployed-app-url)
- [NASA API Documentation](https://api.nasa.gov/)
- [Project Repository](https://github.com/ArorAnam/NASA-data-Exploration-App)

---

**Built with ❤️ for space exploration enthusiasts and developers interested in NASA's incredible data** 