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

// Alias for SmartDailyCheckin component
export const getCheckinsFromFirestore = getUserCheckins;

// Get user's symptom entries
export async function getSymptomEntriesFromFirestore(userId: string, limitCount = 20) {
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

// Save community contribution
export async function saveCommunityContribution(userId: string, contributionData: any) {
  try {
    const docRef = await addDoc(collection(db, 'community_contributions'), {
      userId,
      ...contributionData,
      createdAt: serverTimestamp()
    });
    
    // Also update user's community stats
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`communityStats.${contributionData.type}Count`]: contributionData.count || 1,
      [`communityStats.totalPoints`]: contributionData.totalPoints || 0,
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving community contribution:', error);
    throw error;
  }
}

// Get user's community contributions
export async function getUserCommunityContributions(userId: string, limitCount = 20) {
  try {
    const q = query(
      collection(db, 'community_contributions'),
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
    console.error('Error getting community contributions:', error);
    return [];
  }
}

// Save peer connection request
export async function savePeerConnectionRequest(fromUserId: string, toUserId: string, connectionData: any) {
  try {
    const docRef = await addDoc(collection(db, 'peer_connections'), {
      fromUserId,
      toUserId,
      status: 'pending',
      ...connectionData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving peer connection request:', error);
    throw error;
  }
}

// Get potential peer matches
export async function getPotentialMatches(userId: string, preferences: any) {
  try {
    // In a real implementation, this would use complex matching algorithms
    // For now, return a basic query
    const q = query(
      collection(db, 'users'),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .filter(doc => doc.id !== userId) // Exclude self
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  } catch (error) {
    console.error('Error getting potential matches:', error);
    return [];
  }
}

// Update peer connection status
export async function updatePeerConnectionStatus(connectionId: string, status: 'accepted' | 'declined') {
  try {
    const connectionRef = doc(db, 'peer_connections', connectionId);
    await updateDoc(connectionRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating peer connection status:', error);
    throw error;
  }
}

// Create doctor profile
export async function createDoctorProfile(doctorData: any) {
  try {
    const docRef = await addDoc(collection(db, 'doctors'), {
      ...doctorData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating doctor profile:', error);
    throw error;
  }
}

// Get doctor profile
export async function getDoctorProfile(doctorId: string) {
  try {
    const docRef = doc(db, 'doctors', doctorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting doctor profile:', error);
    return null;
  }
}

// Get state-based user statistics for doctors
export async function getStateUserStatistics(states: string[]) {
  try {
    // In a real implementation, this would query users by state
    // For now, return mock data based on the provided states
    const q = query(
      collection(db, 'users'),
      limit(100) // Sample for now
    );
    
    const querySnapshot = await getDocs(q);
    
    // Process data by state (mock implementation)
    return states.map(state => ({
      state,
      totalUsers: Math.floor(Math.random() * 1000) + 100,
      activeUsers: Math.floor(Math.random() * 500) + 50,
      newThisMonth: Math.floor(Math.random() * 50) + 5
    }));
  } catch (error) {
    console.error('Error getting state statistics:', error);
    return [];
  }
}

// Create doctor consultation response
export async function createDoctorConsultation(consultationData: any) {
  try {
    const docRef = await addDoc(collection(db, 'doctor_consultations'), {
      ...consultationData,
      createdAt: serverTimestamp(),
      status: consultationData.status || 'open'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating doctor consultation:', error);
    throw error;
  }
}

// Get doctor consultations/questions
export async function getDoctorConsultations(limitCount = 20) {
  try {
    const q = query(
      collection(db, 'doctor_consultations'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting doctor consultations:', error);
    return [];
  }
}

// Add doctor response to consultation
export async function addDoctorResponse(consultationId: string, responseData: any) {
  try {
    const consultationRef = doc(db, 'doctor_consultations', consultationId);
    
    // Get current consultation data
    const consultationSnap = await getDoc(consultationRef);
    if (!consultationSnap.exists()) {
      throw new Error('Consultation not found');
    }
    
    const currentData = consultationSnap.data();
    const responses = currentData.responses || [];
    
    // Add new response
    const newResponse = {
      id: Date.now().toString(),
      ...responseData,
      respondedAt: serverTimestamp()
    };
    
    responses.push(newResponse);
    
    // Update consultation with new response and status
    await updateDoc(consultationRef, {
      responses,
      status: 'answered',
      updatedAt: serverTimestamp()
    });
    
    return newResponse.id;
  } catch (error) {
    console.error('Error adding doctor response:', error);
    throw error;
  }
}

// Update consultation views
export async function updateConsultationViews(consultationId: string) {
  try {
    const consultationRef = doc(db, 'doctor_consultations', consultationId);
    const consultationSnap = await getDoc(consultationRef);
    
    if (consultationSnap.exists()) {
      const currentViews = consultationSnap.data().views || 0;
      await updateDoc(consultationRef, {
        views: currentViews + 1
      });
    }
  } catch (error) {
    console.error('Error updating consultation views:', error);
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