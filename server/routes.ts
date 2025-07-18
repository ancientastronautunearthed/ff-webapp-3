import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiRoutes } from "./routes/ai";
import { aiImageRoutes } from "./routes/ai-image";
import { companionRoutes } from "./routes/companion";
import { peerRecommendationsRoutes } from "./routes/peer-recommendations";
import { researchRoutes } from "./routes/research";
import { techAssistantRoutes } from "./routes/tech-assistant";
import { updateUserProfileSchema, updateDoctorProfileSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.use("/api/ai", aiRoutes);
  app.use("/api/ai", aiImageRoutes);
  app.use("/api/companion", companionRoutes);
  app.use("/api/peer-recommendations", peerRecommendationsRoutes);
  app.use("/api/research", researchRoutes);
  app.use("/api/tech-assistant", techAssistantRoutes);
  
  // Import and use real estate routes
  const { realEstateRoutes } = await import('./routes/real-estate');
  app.use('/api/real-estate', realEstateRoutes);
  
  // Import and use dynamic stories routes
  const { dynamicStoriesRoutes } = await import('./routes/dynamic-stories');
  app.use('/api/dynamic-stories', dynamicStoriesRoutes);
  
  // Import and use character images routes
  const { characterImagesRoutes } = await import('./routes/character-images');
  app.use('/api/character-images', characterImagesRoutes);
  
  // Import and use adaptive simulation routes
  const { adaptiveSimulationRoutes } = await import('./routes/adaptive-simulation');
  app.use('/api/adaptive-simulation', adaptiveSimulationRoutes);
  
  // Import and use life path routes
  const { lifePathRoutes } = await import('./routes/life-path');
  app.use('/api/life-path', lifePathRoutes);

  // User profile routes
  app.get('/api/users/profile', async (req: Request, res: Response) => {
    try {
      // Mock user profile data
      const mockProfile = {
        id: 'user_current',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1985-06-15',
        gender: 'Male',
        profileImage: '',
        bio: 'Living with Morgellons and managing symptoms through daily tracking and community support.',
        phone: '(555) 123-4567',
        address: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'United States',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '(555) 987-6543',
        emergencyContactRelation: 'Spouse',
        timezone: 'America/Los_Angeles',
        language: 'English',
        emailNotifications: true,
        smsNotifications: false,
        profileVisibility: 'community',
        allowDirectMessages: true,
        shareDataForResearch: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      };
      
      res.json(mockProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.put('/api/users/profile', async (req: Request, res: Response) => {
    try {
      const validatedData = updateUserProfileSchema.partial().parse(req.body);
      
      console.log('Updating user profile:', validatedData);
      
      res.json({ 
        message: 'Profile updated successfully',
        profile: { ...validatedData, updatedAt: new Date() }
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(400).json({ error: 'Invalid profile data' });
    }
  });

  // Doctor profile routes
  app.get('/api/doctors/profile', async (req: Request, res: Response) => {
    try {
      // Enhanced mock doctor profile with comprehensive fields
      const mockProfile = {
        id: 'doc_current',
        firebaseUid: 'doc_firebase_uid',
        email: 'sarah.johnson@example.com',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        medicalLicense: 'MD123456',
        specialty: 'Dermatology',
        yearsExperience: 15,
        practiceStates: ['California', 'Nevada'],
        institution: 'San Francisco Medical Center',
        morgellonsExperience: true,
        morgellonsDescription: 'Extensive experience treating complex skin conditions including Morgellons disease',
        
        // Enhanced profile fields
        profileImage: '',
        bio: 'Board-certified dermatologist with 15+ years of experience specializing in complex skin conditions. Fellowship trained in dermatopathology with particular expertise in Morgellons disease and related conditions.',
        phone: '(555) 123-4567',
        officeAddress: '123 Medical Plaza, Suite 500',
        officeCity: 'San Francisco',
        officeState: 'CA',
        officeZip: '94102',
        medicalSchool: 'UCSF School of Medicine',
        residency: 'Stanford Dermatology Residency Program',
        boardCertifications: ['American Board of Dermatology', 'American Board of Dermatopathology'],
        languages: ['English', 'Spanish'],
        hospitalAffiliations: ['UCSF Medical Center', 'California Pacific Medical Center'],
        insuranceAccepted: ['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'United Healthcare', 'Medicare'],
        telehealth: true,
        inPerson: true,
        officeHours: 'Monday-Friday 8:00 AM - 5:00 PM, Saturday 9:00 AM - 1:00 PM',
        appointmentTypes: ['Initial Consultation', 'Follow-up Visit', 'Telehealth Consultation', 'Second Opinion'],
        consultationFee: 250,
        isVerified: true,
        verificationDate: new Date('2023-01-15'),
        rating: 4.8,
        reviewCount: 127,
        location: 'San Francisco, CA',
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      };
      
      res.json(mockProfile);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.put('/api/doctors/profile', async (req: Request, res: Response) => {
    try {
      const validatedData = updateDoctorProfileSchema.partial().parse(req.body);
      
      console.log('Updating doctor profile:', validatedData);
      
      res.json({ 
        message: 'Profile updated successfully',
        profile: { ...validatedData, updatedAt: new Date() }
      });
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      res.status(400).json({ error: 'Invalid profile data' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
