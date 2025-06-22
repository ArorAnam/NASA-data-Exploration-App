# NASA Explorer

A web application to explore and visualize NASA's open data using React and Node.js/Express.

## Project Structure

- `client/` - React frontend
- `server/` - Node.js + Express backend

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Backend Setup
1. `cd server`
2. Create a `.env` file with:
   ```
   NASA_API_KEY=DEMO_KEY
   PORT=5051
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   node index.js
   ```

### Frontend Setup
1. `cd client`
2. Install dependencies:
   ```
   npm install
   ```
3. Start the React app:
   ```
   npm start
   ```

### Running the App
- To start both the backend and frontend concurrently, run from the root directory:
  ```
  npm run dev
  ```

## Testing

### Backend
To run the backend tests, navigate to the `server` directory and run:
```
npm test
```
This will execute the Jest test suite for the Express API.

### Frontend
To run the frontend tests, navigate to the `client` directory and run:
```
npm test
```
This will execute the Jest and React Testing Library test suite for React components.

For a single test run (non-watch mode), use:
```
npm test -- --watchAll=false
```

## Features
- **Astronomy Picture of the Day (APOD):** View NASA's daily featured space image.
- **Mars Rover Photos:** Browse images from Mars rovers like Curiosity, Spirit, and Opportunity.
- **Near Earth Objects (NEOs):** Track asteroids and comets that pass close to Earth, with data visualizations.
- **NASA Media Library:** Search NASA's vast collection of images, videos, and audio.
- Responsive design with a modern, dark-themed UI.
- Interactive modals for viewing media content.

## Deployment
- **Backend:** Deployed on [Render](https://render.com/).
- **Frontend:** Deployed on [Vercel](https://vercel.com/).

---

This project was built as a demonstration of full-stack development skills, consuming public APIs to create an interactive user experience.

## Visualization Roadmap

### Phase 1: Enhanced NEO Dashboard ✅
- [x] **3D Asteroid Orbit Viewer** using Three.js
- [x] **Risk Assessment Matrix** with size vs distance plotting  
- [x] **Discovery Timeline** showing asteroid discoveries over time
- [x] **Velocity Distribution Analysis** with interactive histograms
- [x] **Orbital Period vs Distance** correlation plots

### Phase 2: Solar System Dynamics Integration 📋
- [ ] **Close Approach Calendar** with upcoming asteroid flybys
- [ ] **Comprehensive Asteroid Search** with orbital visualization
- [ ] **Multi-object Comparison Tool**
- [ ] **Historical Close Approaches Timeline**
- [ ] **Small Body Database (SBDB) Integration**

### Phase 3: Cross-API Analytics 🚀
- [ ] **Unified Space Activity Timeline**
- [ ] **Correlation Analysis** between different space events
- [ ] **Interactive Solar System Map**
- [ ] **Mission Overlap Visualization**
- [ ] **Real-time Solar System Dashboard**

---

**Next Steps:**
- Implement backend routes for NASA APIs
- Build frontend pages and components
- Add data visualization and interactivity 