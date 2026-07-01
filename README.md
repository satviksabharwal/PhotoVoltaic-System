<h1>University Project - MERN Stack Photovoltaic System</h1>

This project is developed as part of my DWT (Database and Web Techniques) subject project at Technische Universität Chemnitz. The Photovoltaic System is a full-stack application built using the MERN stack, which includes MongoDB, Express.js, React.js, and Node.js. It allows users to monitor and analyze photovoltaic data, visualize system performance, and generate reports.

<h2>Features</h2>
<ul>
<li>User-friendly interface for managing projects, products, and PV details</li>
<li>Real-time data collection and visualization of photovoltaic system parameters</li>
<li>Report generation with a graphical representation of system performance</li>
<li>Secure password storage using encryption techniques</li>
<li>Dynamic rendering to support various device screens, including mobile phones, tablets, and laptops</li>
</ul>

## Configuration

The app is environment-driven — no API URLs are hardcoded. Configuration lives in `.env` files for both the client and the server. Template files (`.env.example`) are included; copy them and fill in your values.

### Server (`/server`)

Create `server/.env` (see `server/.env.example`):

```bash
PORT=5500                                   # optional, defaults to 5500
MONGODB_URI="your_mongo_db_uri"
WEATHER_API_TOKEN="your_weather_API_token"
WEATHER_API_TOKEN_REGISTERED_EMAIL_ID="your_email_id_used_for_weather_token"   # Required to use the Weatherbit API
CORS_ORIGIN="https://app.your-domain.com"   # optional, comma-separated; omit to allow all origins (dev)
```

### Client (project root)

The frontend picks its API base URL from `REACT_APP_API_URL`, resolved by [`src/utils/api.ts`](src/utils/api.ts). Create React App loads the matching file automatically:

- `.env.development` → used by `npm start` (defaults to `http://localhost:5500/api`)
- `.env.production` → used by `npm run build` (defaults to a same-origin `/api`)

All API calls in the app use paths only (e.g. `api.get('/project')`), so switching environments never requires code changes — just set `REACT_APP_API_URL`. For a backend on a different domain in production:

```bash
REACT_APP_API_URL=https://api.your-domain.com/api
```

## Usage

<ul>
  <li>Every project file, including the database setup file, is present in this project.</li>
  <li>Install the dependencies. Run <strong>npm install</strong> inside the root directory and /server directory.</li>
  <li>Finally, use the command <strong>npm start</strong> inside the root directory to run the app! Both frontend and backend will run parallely.</li>
</ul>
