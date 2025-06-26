import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Authentication middleware
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid authorization token' });
  }
};

// Routes

// User profile routes
app.get('/api/users/profile', authenticate, async (req: any, res: any) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(userDoc.data());
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/profile', authenticate, async (req: any, res: any) => {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    await userRef.set(req.body, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Symptom entries routes
app.get('/api/symptom-entries', authenticate, async (req: any, res: any) => {
  try {
    const snapshot = await db.collection('symptomEntries')
      .where('userId', '==', req.user.uid)
      .orderBy('date', 'desc')
      .limit(50)
      .get();
    
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(entries);
  } catch (error) {
    console.error('Error fetching symptom entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/symptom-entries', authenticate, async (req: any, res: any) => {
  try {
    const entryData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('symptomEntries').add(entryData);
    res.json({ id: docRef.id, ...entryData });
  } catch (error) {
    console.error('Error creating symptom entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Journal entries routes
app.get('/api/journal-entries', authenticate, async (req: any, res: any) => {
  try {
    const snapshot = await db.collection('journalEntries')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/journal-entries', authenticate, async (req: any, res: any) => {
  try {
    const entryData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('journalEntries').add(entryData);
    res.json({ id: docRef.id, ...entryData });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forum posts routes
app.get('/api/forum-posts', async (req: any, res: any) => {
  try {
    const snapshot = await db.collection('forumPosts')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(posts);
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/forum-posts', authenticate, async (req: any, res: any) => {
  try {
    const postData = {
      ...req.body,
      authorId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      likes: 0,
      likedBy: [],
      replyCount: 0,
      viewCount: 0
    };
    
    const docRef = await db.collection('forumPosts').add(postData);
    res.json({ id: docRef.id, ...postData });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor routes
app.get('/api/doctors/profile', authenticate, async (req: any, res: any) => {
  try {
    const doctorDoc = await db.collection('doctors').doc(req.user.uid).get();
    if (!doctorDoc.exists) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    res.json(doctorDoc.data());
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/doctors/profile', authenticate, async (req: any, res: any) => {
  try {
    const doctorRef = db.collection('doctors').doc(req.user.uid);
    await doctorRef.set(req.body, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI companion routes
app.get('/api/ai/companion', authenticate, async (req: any, res: any) => {
  try {
    const companionDoc = await db.collection('aiCompanions').doc(req.user.uid).get();
    if (!companionDoc.exists) {
      return res.status(404).json({ error: 'AI companion not found' });
    }
    res.json(companionDoc.data());
  } catch (error) {
    console.error('Error fetching AI companion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ai/companion', authenticate, async (req: any, res: any) => {
  try {
    const companionRef = db.collection('aiCompanions').doc(req.user.uid);
    await companionRef.set(req.body, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating/updating AI companion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Export the Express app as a Cloud Function
export const api = onRequest({ maxInstances: 10 }, app);
