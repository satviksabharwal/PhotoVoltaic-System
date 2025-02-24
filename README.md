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

You'll need to paste your MONGODB_URI and WEATHER_API_TOKEN, as I used Weatherbit to fetch weather data. Alternatively, create a .env file inside the server folder with the following environment variables:

```bash
MONGODB_URI="your_mongo_db_uri"
WEATHER_API_TOKEN = "your_weather_API_token"
WEATHER_API_TOKEN_REGISTERED_EMAIL_ID = "your_email_id_used_for_weather_token" (Required to use API from Weatherbit)
```

You'll then need to make sure that these environment variables are referenced in your code and loaded correctly.

## Usage

<ul>
  <li>Every project file, including the database setup file, is present in this project.</li>
  <li>Install the dependencies. Run <strong>npm install</strong> inside the root directory and /server directory.</li>
  <li>Finally, use the command <strong>npm start</strong> inside the root directory to run the app! Both frontend and backend will run parallely.</li>
</ul>
