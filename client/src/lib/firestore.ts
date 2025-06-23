import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  User, 
  InsertUser, 
  SymptomEntry, 
  InsertSymptomEntry, 
  JournalEntry, 
  InsertJournalEntry,
  ForumPost,
  InsertForumPost,
  ForumReply,
  InsertForumReply
} from '@shared/schema';

// User operations
export const createUserInFirestore = async (userData: InsertUser): Promise<User> => {
  const userRef = doc(db, 'users', userData.firebaseUid);
  const user: User = {
    ...userData,
    id: userData.firebaseUid,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await setDoc(userRef, {
    ...user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return user;
};

export const getUserFromFirestore = async (firebaseUid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', firebaseUid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      id: userSnap.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as User;
  }
  
  return null;
};

export const updateUserInFirestore = async (firebaseUid: string, updates: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', firebaseUid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Symptom entry operations
export const createSymptomEntry = async (userId: string, symptomData: Omit<InsertSymptomEntry, 'userId'>): Promise<SymptomEntry> => {
  const entryData = {
    ...symptomData,
    userId,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'symptomEntries'), entryData);
  
  return {
    ...entryData,
    id: docRef.id,
    createdAt: new Date()
  } as SymptomEntry;
};

export const getUserSymptomEntries = async (userId: string, limitCount: number = 50): Promise<SymptomEntry[]> => {
  const q = query(
    collection(db, 'symptomEntries'),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    date: doc.data().date?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as SymptomEntry[];
};

// Journal entry operations
export const createJournalEntry = async (userId: string, journalData: Omit<InsertJournalEntry, 'userId'>): Promise<JournalEntry> => {
  const entryData = {
    ...journalData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'journalEntries'), entryData);
  
  return {
    ...entryData,
    id: docRef.id,
    createdAt: new Date(),
    updatedAt: new Date()
  } as JournalEntry;
};

export const getUserJournalEntries = async (userId: string, limitCount: number = 20): Promise<JournalEntry[]> => {
  const q = query(
    collection(db, 'journalEntries'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as JournalEntry[];
};

export const updateJournalEntry = async (entryId: string, updates: Partial<JournalEntry>): Promise<void> => {
  const entryRef = doc(db, 'journalEntries', entryId);
  await updateDoc(entryRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteJournalEntry = async (entryId: string): Promise<void> => {
  const entryRef = doc(db, 'journalEntries', entryId);
  await deleteDoc(entryRef);
};

// Forum operations
export const createForumPost = async (userId: string, postData: Omit<InsertForumPost, 'userId'>): Promise<ForumPost> => {
  const entryData = {
    ...postData,
    userId,
    isModerated: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'forumPosts'), entryData);
  
  return {
    ...entryData,
    id: docRef.id,
    createdAt: new Date(),
    updatedAt: new Date()
  } as ForumPost;
};

export const getForumPosts = async (category?: string, limitCount: number = 20): Promise<ForumPost[]> => {
  let q = query(
    collection(db, 'forumPosts'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  if (category) {
    q = query(
      collection(db, 'forumPosts'),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  })) as ForumPost[];
};

export const createForumReply = async (userId: string, replyData: Omit<InsertForumReply, 'userId'>): Promise<ForumReply> => {
  const entryData = {
    ...replyData,
    userId,
    isModerated: false,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'forumReplies'), entryData);
  
  return {
    ...entryData,
    id: docRef.id,
    createdAt: new Date()
  } as ForumReply;
};

export const getPostReplies = async (postId: string): Promise<ForumReply[]> => {
  const q = query(
    collection(db, 'forumReplies'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as ForumReply[];
};

// Research data operations
export const contributeResearchData = async (userId: string, dataType: string, anonymizedData: any): Promise<void> => {
  const researchData = {
    userId,
    dataType,
    anonymizedData,
    createdAt: serverTimestamp()
  };
  
  await addDoc(collection(db, 'researchData'), researchData);
};