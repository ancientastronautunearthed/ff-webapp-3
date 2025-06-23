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
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Save daily check-in data
export async function saveCheckinToFirestore(checkinData: any) {
  try {
    const docRef = await addDoc(collection(db, 'daily_checkins'), {
      ...checkinData,
      createdAt: serverTimestamp()
    });
    console.log('Check-in saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving check-in:', error);
    throw error;
  }
}

// Get user's recent check-ins
export async function getUserCheckins(userId: string, limitCount = 10) {
  try {
    const q = query(
      collection(db, 'daily_checkins'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting check-ins:', error);
    return [];
  }
}

// Save achievement unlock
export async function saveAchievementUnlock(userId: string, achievementData: any) {
  try {
    const docRef = await addDoc(collection(db, 'achievements'), {
      userId,
      ...achievementData,
      unlockedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving achievement:', error);
    throw error;
  }
}

// Update user points and level
export async function updateUserProgress(userId: string, progressData: any) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...progressData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
}

// Create journal entry
export async function createJournalEntry(journalData: any) {
  try {
    const docRef = await addDoc(collection(db, 'journal_entries'), {
      ...journalData,
      createdAt: serverTimestamp()
    });
    console.log('Journal entry saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
}

// Create symptom entry
export async function createSymptomEntry(symptomData: any) {
  try {
    const docRef = await addDoc(collection(db, 'symptom_entries'), {
      ...symptomData,
      createdAt: serverTimestamp()
    });
    console.log('Symptom entry saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating symptom entry:', error);
    throw error;
  }
}

// Get journal entries
export async function getJournalEntries(userId: string, limitCount = 20) {
  try {
    const q = query(
      collection(db, 'journal_entries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return [];
  }
}

// Get symptom entries
export async function getSymptomEntries(userId: string, limitCount = 50) {
  try {
    const q = query(
      collection(db, 'symptom_entries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting symptom entries:', error);
    return [];
  }
}

// Update user in Firestore
export async function updateUserInFirestore(userId: string, userData: any) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete journal entry
export async function deleteJournalEntry(entryId: string) {
  try {
    const entryRef = doc(db, 'journal_entries', entryId);
    await updateDoc(entryRef, {
      deleted: true,
      deletedAt: serverTimestamp()
    });
    console.log('Journal entry marked as deleted:', entryId);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
}

// Update journal entry
export async function updateJournalEntry(entryId: string, updateData: any) {
  try {
    const entryRef = doc(db, 'journal_entries', entryId);
    await updateDoc(entryRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    console.log('Journal entry updated:', entryId);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
}

// Alias for getJournalEntries (backward compatibility)
export const getUserJournalEntries = getJournalEntries;

// Alias for getSymptomEntries (backward compatibility)
export const getUserSymptomEntries = getSymptomEntries;