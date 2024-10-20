import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAcx_lGouvtqKHW_r9ZOpCCLn7lXcN0bPg",
  authDomain: "flashcard-eb667.firebaseapp.com",
  databaseURL: "https://flashcard-eb667-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "flashcard-eb667",
  storageBucket: "flashcard-eb667.appspot.com",
  messagingSenderId: "309222550304",
  appId: "1:309222550304:web:bcacc60d3bad24aa7a4545"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };