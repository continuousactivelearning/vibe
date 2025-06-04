// get-firebase-id-token.js
// Usage: node get-firebase-id-token.js <email> <password>
// Prints a Firebase ID token for the given user credentials.

const {initializeApp} = require('firebase/app');
const {getAuth, signInWithEmailAndPassword} = require('firebase/auth');

// TODO: Load firebaseConfig from environment variables or a secure config file, not hardcoded.
// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: 'AIzaSyAJeAmGe3p-l6w7EA4rsAwZ_xFKatI86Tg',
  authDomain: 'primeval-wind-455317-i0.firebaseapp.com',
  projectId: 'primeval-wind-455317-i0',
  storageBucket: 'primeval-wind-455317-i0.appspot.com',
  messagingSenderId: '262358825696',
  appId: '1:262358825696:web:b205be2b9e89e3ee04ee85',
  measurementId: 'G-1JPQXWPR4T',
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
