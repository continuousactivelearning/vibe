// get-firebase-id-token.js
// Usage: node get-firebase-id-token.js <email> <password>
// Prints a Firebase ID token for the given user credentials.

const {initializeApp} = require('firebase/app');
const {getAuth, signInWithEmailAndPassword} = require('firebase/auth');
const dotenv = require('dotenv');
dotenv.config({path: require('path').resolve(__dirname, '../.env')});

// TODO: Replace with your Firebase project config
// TODO: Consider using dotenv to automatically load environment variables from a .env file for local development.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const [, , email, password] = process.argv;
if (!email || !password) {
  throw new Error('Usage: node get-firebase-id-token.js <email> <password>');
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, email, password)
  .then(userCredential => userCredential.user.getIdToken())
  .then(token => {
    console.log('\nYour Firebase ID token:');
    console.log(token);
  })
  .catch(err => {
    throw new Error('Failed to get ID token: ' + err.message);
  });
