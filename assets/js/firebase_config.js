import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, push, set, get, child } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyDDgbdv6mUfLewoZBACWLC7i4dNUgAimak",
    authDomain: "newshub-5d1e6.firebaseapp.com",
    projectId: "newshub-5d1e6",
    storageBucket: "newshub-5d1e6.appspot.com",
    messagingSenderId: "1041591026461",
    appId: "1:1041591026461:web:2a8b7c699030387bbed7f4"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {getDatabase, database, ref, push, set, get, child, auth, signInWithEmailAndPassword, signOut, getAuth, onAuthStateChanged, storage, storageRef, uploadBytes, getDownloadURL };