import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

export const uploadFile = async (
  file: File, 
  userId: string, 
  folder: 'journal' | 'profiles' = 'journal'
): Promise<UploadResult> => {
  // Create a unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${sanitizedName}`;
  const path = `${folder}/${userId}/${filename}`;
  
  // Create storage reference
  const storageRef = ref(storage, path);
  
  // Upload file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get download URL
  const url = await getDownloadURL(snapshot.ref);
  
  return {
    url,
    path,
    filename
  };
};

export const uploadMultipleFiles = async (
  files: File[], 
  userId: string, 
  folder: 'journal' | 'profiles' = 'journal'
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(file => uploadFile(file, userId, folder));
  return Promise.all(uploadPromises);
};

export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

export const deleteMultipleFiles = async (paths: string[]): Promise<void> => {
  const deletePromises = paths.map(path => deleteFile(path));
  await Promise.all(deletePromises);
};

export const getUserFiles = async (userId: string, folder: 'journal' | 'profiles' = 'journal'): Promise<string[]> => {
  const folderRef = ref(storage, `${folder}/${userId}`);
  
  try {
    const result = await listAll(folderRef);
    const urlPromises = result.items.map(item => getDownloadURL(item));
    return Promise.all(urlPromises);
  } catch (error) {
    // Folder doesn't exist or is empty
    return [];
  }
};

// Utility function to validate file types and sizes
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Please use JPG, PNG, or MP4.`
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds the 10MB limit.`
    };
  }
  
  return { valid: true };
};

export const validateFiles = (files: File[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  files.forEach((file, index) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};