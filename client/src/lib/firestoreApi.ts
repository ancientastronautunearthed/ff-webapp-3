import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  DocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  FirestoreUser, 
  FirestoreSymptomEntry, 
  FirestoreJournalEntry, 
  FirestoreForumPost,
  FirestoreAICompanion,
  FirestoreChatMessage,
  FirestoreDoctor,
  FirestorePeerConnection,
  FirestoreGamification
} from '@shared/firestore-types';

// =================================================================
// TYPE-SAFE HELPER FUNCTION
// =================================================================
/**
 * Safely converts a Firestore DocumentSnapshot to a specific type, including its ID.
 * This function is the single source of truth for data conversion, resolving all type errors.
 * @param doc The DocumentSnapshot from Firestore.
 * @returns The typed object with its Firestore ID.
 */
function fromDoc<T>(doc: DocumentSnapshot<DocumentData>): T {
    const data = doc.data();
    if (!data) {
        throw new Error(`Document data not found for doc with id ${doc.id}`);
    }
    return { id: doc.id, ...data } as T;
}


// =================================================================
// REFACTORED API MODULES
// =================================================================

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated for API call');
  return user.uid;
};

// --- User Profile API ---
export const userProfileApi = {
  async get(userId?: string): Promise<FirestoreUser | null> {
    const uid = userId || getCurrentUserId();
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? fromDoc<FirestoreUser>(userDoc) : null;
  },

  async create(userData: Partial<FirestoreUser>): Promise<void> {
    const uid = getCurrentUserId();
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      firebaseUid: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      points: 0,
      level: 1,
    });
  },

  async update(updates: Partial<FirestoreUser>): Promise<void> {
    const uid = getCurrentUserId();
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }
};

// --- Symptom Entries API ---
export const symptomEntriesApi = {
  async list(userId?: string): Promise<FirestoreSymptomEntry[]> {
    const uid = userId || getCurrentUserId();
    const q = query(collection(db, 'symptomEntries'), where('userId', '==', uid), orderBy('date', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromDoc<FirestoreSymptomEntry>(doc));
  },
  
  // create, update, delete methods remain the same...
  async create(entryData: Omit<FirestoreSymptomEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const uid = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'symptomEntries'), {
      ...entryData,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(entryId: string, updates: Partial<FirestoreSymptomEntry>): Promise<void> {
    await updateDoc(doc(db, 'symptomEntries', entryId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(entryId: string): Promise<void> {
    await deleteDoc(doc(db, 'symptomEntries', entryId));
  }
};

// --- Journal Entries API ---
export const journalEntriesApi = {
  async list(userId?: string): Promise<FirestoreJournalEntry[]> {
    const uid = userId || getCurrentUserId();
    const q = query(collection(db, 'journalEntries'), where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromDoc<FirestoreJournalEntry>(doc));
  },
  
  // create, update, delete methods remain the same...
  async create(entryData: Omit<FirestoreJournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const uid = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'journalEntries'), {
      ...entryData,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(entryId: string, updates: Partial<FirestoreJournalEntry>): Promise<void> {
    await updateDoc(doc(db, 'journalEntries', entryId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(entryId: string): Promise<void> {
    await deleteDoc(doc(db, 'journalEntries', entryId));
  }
};

// --- Forum Posts API ---
export const forumPostsApi = {
  async list(category?: string): Promise<FirestoreForumPost[]> {
    const coll = collection(db, 'forumPosts');
    let q;
    // This logic is now clearer and type-safe.
    if (category) {
      q = query(
        coll,
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else {
      q = query(
        coll,
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromDoc<FirestoreForumPost>(doc));
  },
  
  // create, like, unlike methods remain the same...
  async create(postData: Omit<FirestoreForumPost, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt' | 'likes' | 'likedBy' | 'replyCount' | 'viewCount' | 'isModerated' | 'moderationFlags'>): Promise<string> {
    const uid = getCurrentUserId();
    const user = await userProfileApi.get(uid);
    
    const docRef = await addDoc(collection(db, 'forumPosts'), {
      ...postData,
      authorId: uid,
      authorName: postData.isAnonymous ? 'Anonymous' : (user?.name || 'User'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
      replyCount: 0,
      viewCount: 0,
      isModerated: false,
      moderationFlags: [],
    });
    return docRef.id;
  },

  async like(postId: string): Promise<void> {
    const uid = getCurrentUserId();
    await updateDoc(doc(db, 'forumPosts', postId), {
      likedBy: arrayUnion(uid),
      likes: increment(1),
    });
  },

  async unlike(postId: string): Promise<void> {
    const uid = getCurrentUserId();
    await updateDoc(doc(db, 'forumPosts', postId), {
      likedBy: arrayRemove(uid),
      likes: increment(-1),
    });
  }
};

// --- AI Companion API ---
export const aiCompanionApi = {
  async get(userId?: string): Promise<FirestoreAICompanion | null> {
    const uid = userId || getCurrentUserId();
    const companionDoc = await getDoc(doc(db, 'aiCompanions', uid));
    return companionDoc.exists() ? fromDoc<FirestoreAICompanion>(companionDoc) : null;
  },
  
  // create, update methods remain the same...
  async create(companionData: Omit<FirestoreAICompanion, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const uid = getCurrentUserId();
    await setDoc(doc(db, 'aiCompanions', uid), {
      ...companionData,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async update(updates: Partial<FirestoreAICompanion>): Promise<void> {
    const uid = getCurrentUserId();
    await updateDoc(doc(db, 'aiCompanions', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }
};

// --- Chat Messages API ---
export const chatMessagesApi = {
  async list(userId?: string): Promise<FirestoreChatMessage[]> {
    const uid = userId || getCurrentUserId();
    const q = query(collection(db, 'chatMessages'), where('userId', '==', uid), orderBy('timestamp', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromDoc<FirestoreChatMessage>(doc));
  },
  
  // create method remains the same...
  async create(messageData: Omit<FirestoreChatMessage, 'id' | 'userId' | 'timestamp'>): Promise<string> {
    const uid = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'chatMessages'), {
      ...messageData,
      userId: uid,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  }
};

// --- Doctor Profile API ---
export const doctorProfileApi = {
  async get(doctorId?: string): Promise<FirestoreDoctor | null> {
    const uid = doctorId || getCurrentUserId();
    const doctorDoc = await getDoc(doc(db, 'doctors', uid));
    return doctorDoc.exists() ? fromDoc<FirestoreDoctor>(doctorDoc) : null;
  },
  async list(): Promise<FirestoreDoctor[]> {
    const q = query(collection(db, 'doctors'), where('verification.verified', '==', true), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromDoc<FirestoreDoctor>(doc));
  },

  // create, update methods remain the same...
  async create(doctorData: Omit<FirestoreDoctor, 'id' | 'firebaseUid' | 'createdAt'>): Promise<void> {
    const uid = getCurrentUserId();
    await setDoc(doc(db, 'doctors', uid), {
      ...doctorData,
      firebaseUid: uid,
      createdAt: serverTimestamp(),
    });
  },

  async update(updates: Partial<FirestoreDoctor>): Promise<void> {
    const uid = getCurrentUserId();
    await updateDoc(doc(db, 'doctors', uid), updates);
  }
};

// --- Peer Connections API ---
export const peerConnectionsApi = {
  async list(userId?: string): Promise<FirestorePeerConnection[]> {
    const uid = userId || getCurrentUserId();
    const q1 = query(collection(db, 'peerConnections'), where('userId1', '==', uid), orderBy('createdAt', 'desc'));
    const q2 = query(collection(db, 'peerConnections'), where('userId2', '==', uid), orderBy('createdAt', 'desc'));
    
    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const connections1 = snapshot1.docs.map(doc => fromDoc<FirestorePeerConnection>(doc));
    const connections2 = snapshot2.docs.map(doc => fromDoc<FirestorePeerConnection>(doc));
    
    // Simple merge, consider de-duping if necessary
    return [...connections1, ...connections2];
  },

  // create, updateStatus methods remain the same...
  async create(connectionData: Omit<FirestorePeerConnection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'peerConnections'), {
      ...connectionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateStatus(connectionId: string, status: FirestorePeerConnection['status']): Promise<void> {
    await updateDoc(doc(db, 'peerConnections', connectionId), {
      status,
      updatedAt: serverTimestamp(),
    });
  }
};

// --- Gamification API ---
export const gamificationApi = {
  async get(userId?: string): Promise<FirestoreGamification | null> {
    const uid = userId || getCurrentUserId();
    const gamificationDoc = await getDoc(doc(db, 'gamification', uid));
    return gamificationDoc.exists() ? fromDoc<FirestoreGamification>(gamificationDoc) : null;
  },

  // addPoints, addAchievement methods remain the same...
  async addPoints(points: number, reason: string): Promise<void> {
    const uid = getCurrentUserId();
    const gamificationRef = doc(db, 'gamification', uid);
    
    const gamificationDoc = await getDoc(gamificationRef);
    
    if (!gamificationDoc.exists()) {
      await setDoc(gamificationRef, {
        userId: uid,
        points: points,
        level: 1,
        experience: points,
        streaks: {
          daily: 1,
          weekly: 1,
          longest: 1,
          lastActivity: serverTimestamp(),
        },
        achievements: [],
        challenges: {
          active: [],
          completed: [],
          totalCompleted: 0,
        },
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(gamificationRef, {
        points: increment(points),
        experience: increment(points),
        'streaks.lastActivity': serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  },

  async addAchievement(achievement: FirestoreGamification['achievements'][0]): Promise<void> {
    const uid = getCurrentUserId();
    await updateDoc(doc(db, 'gamification', uid), {
      achievements: arrayUnion(achievement),
      updatedAt: serverTimestamp(),
    });
  }
};

// --- Daily check-ins API ---
export const dailyCheckinsApi = {
  async save(checkinData: any): Promise<string> {
    const uid = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'dailyCheckins'), {
      ...checkinData,
      userId: uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async list(userId?: string, limitCount = 10): Promise<any[]> {
    const uid = userId || getCurrentUserId();
    const q = query(collection(db, 'dailyCheckins'), where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromDoc<any>(doc)); // Using <any> since no type was provided
  }
};
