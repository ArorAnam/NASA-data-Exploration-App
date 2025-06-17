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
   PORT=5000
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
- To start both the backend and frontend concurrently, run:
  ```
  npm run dev
  ```

## Features
- Explore NASA's Astronomy Picture of the Day, Mars Rover Photos, Near Earth Objects, and more
- Data visualization and interactive UI
- Responsive design

## Deployment
- Backend: Render/Heroku
- Frontend: Vercel/Netlify

---

**Next Steps:**
- Implement backend routes for NASA APIs
- Build frontend pages and components
- Add data visualization and interactivity 