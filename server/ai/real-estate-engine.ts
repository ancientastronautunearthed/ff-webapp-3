import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || '' });

export interface PropertyListing {
  id: string;
  type: 'apartment' | 'house' | 'condo' | 'mansion' | 'penthouse' | 'tiny_home' | 'co_living';
  name: string;
  location: string;
  district: string;
  price: number;
  monthlyPayment?: number;
  downPaymentRequired: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_work';
  features: string[];
  aiIntegration: 'full' | 'partial' | 'minimal' | 'none';
  energyRating: 'A+' | 'A' | 'B' | 'C' | 'D';
  transportScore: number; // 1-100, proximity to transport
  schoolRating: number; // 1-10 for families with children
  neighborhoodSafety: number; // 1-10
  appreciationPotential: number; // 1-10
  description: string;
  images: string[];
  virtualTourUrl?: string;
  availableFrom: Date;
  petFriendly: boolean;
  parkingSpaces: number;
  amenities: string[];
  monthlyHOAFees?: number;
  propertyTaxAnnual: number;
  insuranceEstimate: number;
  utilityEstimate: number;
  walkScore: number;
  crimeRate: number;
  nearbyAmenities: {
    hospitals: number;
    schools: number;
    restaurants: number;
    shopping: number;
    parks: number;
  };
}

export interface MortgageOption {
  id: string;
  lenderName: string;
  interestRate: number;
  termYears: number;
  loanType: '30_year_fixed' | '15_year_fixed' | 'adjustable' | 'interest_only' | 'fha' | 'va';
  downPaymentPercent: number;
  monthlyPayment: number;
  totalInterest: number;
  pmi?: number; // Private mortgage insurance
  closingCosts: number;
  preApprovalAmount: number;
  creditScoreRequired: number;
  benefits: string[];
  restrictions: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  personality: string[];
  occupation?: string;
  education?: string;
  hobbies: string[];
  spacesNeeded: string[]; // bedroom, office, playroom, etc.
  specialNeeds?: string[];
  monthlyExpenses: number;
  incomeContribution: number;
}

export interface FamilyProgression {
  currentPhase: 'single' | 'dating' | 'engaged' | 'newlywed' | 'growing_family' | 'established_family' | 'empty_nest' | 'retirement';
  members: FamilyMember[];
  plannedAdditions: {
    children: number;
    timeline: string;
    budget: number;
  };
  housingNeeds: {
    minBedrooms: number;
    minBathrooms: number;
    requiredSpaces: string[];
    preferredFeatures: string[];
    maxBudget: number;
    location: string;
  };
  lifestyle: {
    workFromHome: boolean;
    entertainingFrequency: 'never' | 'occasionally' | 'regularly' | 'frequently';
    petOwnership: boolean;
    hobbiesRequiringSpace: string[];
    transportationNeeds: string[];
  };
}

export class RealEstateEngine {
  static async generatePropertyListings(
    location: string,
    budget: number,
    familyNeeds: FamilyProgression
  ): Promise<PropertyListing[]> {
    try {
      const prompt = `
Generate 5-8 realistic property listings for 2035 in ${location} with budget around $${budget}.

Family Context:
- Phase: ${familyNeeds.currentPhase}
- Members: ${familyNeeds.members.length}
- Min Bedrooms: ${familyNeeds.housingNeeds.minBedrooms}
- Work from home: ${familyNeeds.lifestyle.workFromHome}
- Entertainment: ${familyNeeds.lifestyle.entertainingFrequency}

Create diverse options including:
1. Properties within budget
2. Properties slightly above budget (stretch options)
3. Properties below budget (conservative options)
4. Different AI integration levels (full smart home to minimal tech)
5. Various neighborhoods and property types

Each property should have realistic 2035 features like:
- AI home assistants and automation
- Energy efficient systems
- Smart security
- Flexible spaces for remote work
- Sustainable features

Return as JSON array with all PropertyListing fields populated.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string" },
                name: { type: "string" },
                location: { type: "string" },
                price: { type: "number" },
                bedrooms: { type: "number" },
                bathrooms: { type: "number" },
                features: { type: "array", items: { type: "string" } },
                description: { type: "string" }
              }
            }
          }
        },
        contents: prompt
      });

      const listings = JSON.parse(response.text || '[]');
      return listings.map((listing: any, index: number) => ({
        id: `prop_${Date.now()}_${index}`,
        type: listing.type || 'house',
        name: listing.name || `Property ${index + 1}`,
        location: listing.location || location,
        district: this.generateDistrict(location),
        price: listing.price || budget,
        downPaymentRequired: Math.floor(listing.price * 0.2),
        squareFootage: this.calculateSquareFootage(listing.bedrooms, listing.bathrooms),
        bedrooms: listing.bedrooms || 2,
        bathrooms: listing.bathrooms || 2,
        yearBuilt: 2025 + Math.floor(Math.random() * 10),
        condition: 'good',
        features: listing.features || ['Smart Home Integration', 'Energy Efficient'],
        aiIntegration: this.randomAIIntegration(),
        energyRating: this.randomEnergyRating(),
        transportScore: Math.floor(Math.random() * 40) + 60,
        schoolRating: Math.floor(Math.random() * 4) + 6,
        neighborhoodSafety: Math.floor(Math.random() * 3) + 7,
        appreciationPotential: Math.floor(Math.random() * 4) + 6,
        description: listing.description || 'A beautiful property in the heart of 2035.',
        images: [`/property-images/${index + 1}-1.jpg`],
        availableFrom: new Date(),
        petFriendly: Math.random() > 0.3,
        parkingSpaces: Math.floor(Math.random() * 3) + 1,
        amenities: this.generateAmenities(),
        propertyTaxAnnual: Math.floor(listing.price * 0.012),
        insuranceEstimate: Math.floor(listing.price * 0.003),
        utilityEstimate: 200 + Math.floor(Math.random() * 300),
        walkScore: Math.floor(Math.random() * 40) + 50,
        crimeRate: Math.random() * 0.05,
        nearbyAmenities: {
          hospitals: Math.floor(Math.random() * 5) + 1,
          schools: Math.floor(Math.random() * 8) + 2,
          restaurants: Math.floor(Math.random() * 20) + 10,
          shopping: Math.floor(Math.random() * 15) + 5,
          parks: Math.floor(Math.random() * 10) + 3
        }
      }));

    } catch (error) {
      console.error('Property listing generation failed:', error);
      return this.generateFallbackListings(location, budget, familyNeeds);
    }
  }

  static async generateMortgageOptions(
    propertyPrice: number,
    creditScore: number,
    downPayment: number,
    income: number
  ): Promise<MortgageOption[]> {
    const baseRate = 0.065; // 6.5% base rate for 2035
    const creditAdjustment = (750 - creditScore) * 0.0001;
    const adjustedRate = Math.max(0.045, baseRate + creditAdjustment);

    const options: MortgageOption[] = [
      {
        id: 'conventional_30',
        lenderName: 'Future Finance Bank',
        interestRate: adjustedRate,
        termYears: 30,
        loanType: '30_year_fixed',
        downPaymentPercent: (downPayment / propertyPrice) * 100,
        monthlyPayment: this.calculateMonthlyPayment(propertyPrice - downPayment, adjustedRate, 30),
        totalInterest: 0, // Calculate later
        closingCosts: Math.floor(propertyPrice * 0.03),
        preApprovalAmount: income * 5,
        creditScoreRequired: 620,
        benefits: ['Stable payments', 'No prepayment penalty'],
        restrictions: ['PMI if down payment < 20%']
      },
      {
        id: 'ai_optimized',
        lenderName: 'Neural Lending Solutions',
        interestRate: adjustedRate - 0.005,
        termYears: 25,
        loanType: 'adjustable',
        downPaymentPercent: (downPayment / propertyPrice) * 100,
        monthlyPayment: this.calculateMonthlyPayment(propertyPrice - downPayment, adjustedRate - 0.005, 25),
        totalInterest: 0,
        closingCosts: Math.floor(propertyPrice * 0.025),
        preApprovalAmount: income * 5.5,
        creditScoreRequired: 680,
        benefits: ['AI-optimized rates', 'Smart payment adjustments', 'Lower closing costs'],
        restrictions: ['Requires smart home integration', 'Rate adjusts every 5 years']
      }
    ];

    // Calculate total interest for each option
    options.forEach(option => {
      const principal = propertyPrice - downPayment;
      const totalPayments = option.monthlyPayment * option.termYears * 12;
      option.totalInterest = totalPayments - principal;
    });

    return options;
  }

  static async simulateFamilyGrowth(
    currentFamily: FamilyProgression,
    timeframe: number // years
  ): Promise<{
    projectedFamily: FamilyProgression;
    housingChanges: Array<{
      year: number;
      reason: string;
      newRequirements: any;
      estimatedCost: number;
    }>;
    milestones: Array<{
      year: number;
      type: 'marriage' | 'birth' | 'education' | 'career' | 'empty_nest';
      description: string;
      impact: string;
    }>;
  }> {
    const projectedFamily = { ...currentFamily };
    const housingChanges = [];
    const milestones = [];

    // Simulate year by year progression
    for (let year = 1; year <= timeframe; year++) {
      // Age all family members
      projectedFamily.members = projectedFamily.members.map(member => ({
        ...member,
        age: member.age + year
      }));

      // Check for major life events
      if (currentFamily.currentPhase === 'dating' && year === 2) {
        projectedFamily.currentPhase = 'engaged';
        milestones.push({
          year,
          type: 'marriage',
          description: 'Engagement and wedding planning',
          impact: 'Need space for wedding planning, possibly larger home for entertaining'
        });
      }

      if (currentFamily.currentPhase === 'engaged' && year === 3) {
        projectedFamily.currentPhase = 'newlywed';
        milestones.push({
          year,
          type: 'marriage',
          description: 'Wedding and settling into married life',
          impact: 'Combined finances, shared living space optimization'
        });
      }

      // Simulate children based on planned additions
      if (currentFamily.plannedAdditions.children > 0 && year >= 2) {
        const childrenToAdd = Math.min(1, currentFamily.plannedAdditions.children);
        for (let i = 0; i < childrenToAdd; i++) {
          const newChild: FamilyMember = {
            id: `child_${Date.now()}_${i}`,
            name: `Child ${projectedFamily.members.filter(m => m.relationship === 'child').length + 1}`,
            age: 0,
            relationship: 'child',
            personality: ['Curious', 'Energetic'],
            hobbies: ['Playing', 'Learning'],
            spacesNeeded: ['nursery'],
            monthlyExpenses: 800,
            incomeContribution: 0
          };
          
          projectedFamily.members.push(newChild);
          projectedFamily.currentPhase = 'growing_family';
          
          milestones.push({
            year,
            type: 'birth',
            description: `Birth of ${newChild.name}`,
            impact: 'Need nursery space, higher monthly expenses'
          });

          housingChanges.push({
            year,
            reason: 'New baby requires nursery and family space',
            newRequirements: {
              minBedrooms: projectedFamily.housingNeeds.minBedrooms + 1,
              requiredSpaces: [...projectedFamily.housingNeeds.requiredSpaces, 'nursery', 'family_room']
            },
            estimatedCost: 50000 // Renovation or moving costs
          });
        }
      }

      // Children growing up and needing their own rooms
      const childrenNeedingRooms = projectedFamily.members.filter(
        m => m.relationship === 'child' && m.age >= 8 && m.spacesNeeded.includes('nursery')
      );

      if (childrenNeedingRooms.length > 0) {
        childrenNeedingRooms.forEach(child => {
          child.spacesNeeded = ['bedroom', 'study_space'];
          milestones.push({
            year,
            type: 'education',
            description: `${child.name} needs own bedroom and study space`,
            impact: 'Requires additional bedroom or space conversion'
          });
        });

        housingChanges.push({
          year,
          reason: 'Growing children need individual bedrooms',
          newRequirements: {
            minBedrooms: projectedFamily.members.filter(m => m.relationship === 'child').length + 1
          },
          estimatedCost: 25000
        });
      }

      // Empty nest phase
      const childrenLeavingHome = projectedFamily.members.filter(
        m => m.relationship === 'child' && m.age >= 18
      );

      if (childrenLeavingHome.length > 0 && year > 18) {
        projectedFamily.currentPhase = 'empty_nest';
        milestones.push({
          year,
          type: 'empty_nest',
          description: 'Children leaving home for college/independence',
          impact: 'Opportunity to downsize or repurpose rooms'
        });

        housingChanges.push({
          year,
          reason: 'Empty nest - consider downsizing or repurposing space',
          newRequirements: {
            minBedrooms: 2,
            requiredSpaces: ['home_office', 'hobby_room']
          },
          estimatedCost: -100000 // Potential savings from downsizing
        });
      }
    }

    return {
      projectedFamily,
      housingChanges,
      milestones
    };
  }

  // Helper methods
  private static calculateMonthlyPayment(principal: number, rate: number, years: number): number {
    const monthlyRate = rate / 12;
    const numPayments = years * 12;
    return Math.floor(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    );
  }

  private static generateDistrict(location: string): string {
    const districts = ['Downtown Tech', 'Green Valley', 'Historic District', 'Waterfront', 'University Area'];
    return districts[Math.floor(Math.random() * districts.length)];
  }

  private static calculateSquareFootage(bedrooms: number, bathrooms: number): number {
    return 500 + (bedrooms * 300) + (bathrooms * 150) + Math.floor(Math.random() * 500);
  }

  private static randomAIIntegration(): 'full' | 'partial' | 'minimal' | 'none' {
    const options = ['full', 'partial', 'minimal', 'none'];
    return options[Math.floor(Math.random() * options.length)] as any;
  }

  private static randomEnergyRating(): 'A+' | 'A' | 'B' | 'C' | 'D' {
    const ratings = ['A+', 'A', 'B', 'C', 'D'];
    return ratings[Math.floor(Math.random() * ratings.length)] as any;
  }

  private static generateAmenities(): string[] {
    const amenities = [
      'Fitness Center', 'Pool', 'Rooftop Garden', 'Coworking Space',
      'EV Charging', 'Smart Lockers', 'Virtual Concierge', 'Pet Spa'
    ];
    return amenities.slice(0, Math.floor(Math.random() * 4) + 2);
  }

  private static generateFallbackListings(
    location: string,
    budget: number,
    familyNeeds: FamilyProgression
  ): PropertyListing[] {
    return [
      {
        id: 'fallback_1',
        type: 'house',
        name: 'Modern Family Home',
        location: location,
        district: 'Family District',
        price: budget,
        downPaymentRequired: Math.floor(budget * 0.2),
        squareFootage: 1800,
        bedrooms: familyNeeds.housingNeeds.minBedrooms,
        bathrooms: familyNeeds.housingNeeds.minBathrooms,
        yearBuilt: 2030,
        condition: 'good',
        features: ['Smart Home', 'Energy Efficient', 'Family Friendly'],
        aiIntegration: 'partial',
        energyRating: 'A',
        transportScore: 75,
        schoolRating: 8,
        neighborhoodSafety: 8,
        appreciationPotential: 7,
        description: 'A well-designed family home perfect for growing families.',
        images: ['/fallback-property.jpg'],
        availableFrom: new Date(),
        petFriendly: true,
        parkingSpaces: 2,
        amenities: ['Garage', 'Garden'],
        propertyTaxAnnual: Math.floor(budget * 0.012),
        insuranceEstimate: Math.floor(budget * 0.003),
        utilityEstimate: 300,
        walkScore: 70,
        crimeRate: 0.02,
        nearbyAmenities: {
          hospitals: 2,
          schools: 5,
          restaurants: 15,
          shopping: 8,
          parks: 4
        }
      }
    ];
  }
}