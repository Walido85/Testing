import { db } from './src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function dump() {
  console.log("Dumping RSS sources...");
  const snapshot = await getDocs(collection(db, "rss"));
  snapshot.docs.slice(0, 5).forEach(doc => {
    console.log(`ID: ${doc.id}, Data:`, doc.data());
  });
  process.exit(0);
}

dump();
