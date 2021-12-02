import firebase from "firebase/app";
import 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBRwSLk_mSwkMKczEbJNmBhkpBuQ3vjbz4",
    authDomain: "asset-management-notifications.firebaseapp.com",
    databaseURL: "https://asset-management-notifications-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "asset-management-notifications",
    storageBucket: "asset-management-notifications.appspot.com",
    messagingSenderId: "79298844617",
    appId: "1:79298844617:web:e80dbfedc7ea692d48ba18"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export default firebase;
export { db };