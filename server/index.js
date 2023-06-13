// app.js (or index.js)

require('dotenv').config();
const express = require('express');
// const admin = require('firebase-admin');
const cors = require('cors');
const connection = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 5500;

// db
connection();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use('/api/users', userRoutes);
app.use('/app/auth', authRoutes);

app.get('*', () => {
  console.log('Data');
});

// Initialize Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
//     privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//     clientId: process.env.FIREBASE_CLIENT_ID,
//     authUri: process.env.FIREBASE_AUTH_URI,
//     tokenUri: process.env.FIREBASE_TOKEN_URI,
//     authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
//     clientCertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
//   }),
// });

// API endpoint for Gmail authentication
// app.get('/auth/gmail', async (req, res) => {
//   try {
//     const provider = new admin.auth.GoogleAuthProvider();
//     const result = await admin.auth().createSessionCookie(req.query.idToken, { expiresIn: 60 * 60 * 24 * 5 });
//     res.cookie('session', result, { maxAge: 60 * 60 * 24 * 1000, httpOnly: true });
//     res.status(200).json({ message: 'Authentication successful' });
//   } catch (error) {
//     console.error('Authentication error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
