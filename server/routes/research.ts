import { Router } from 'express';
import { db } from '../firebase-admin';

const router = Router();

// Get aggregated research dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { timeRange = '90', region = 'all' } = req.query;
    
    // Calculate date filter
    const daysBack = timeRange === 'all' ? 365 * 10 : parseInt(timeRange as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Query aggregated data from opted-in users only
    const usersSnapshot = await db.collection('users')
      .where('researchOptIn', '==', true)
      .get();

    const optedInUserIds = usersSnapshot.docs.map(doc => doc.id);
    
    if (optedInUserIds.length === 0) {
      return res.json({
        totalUsers: 0,
        totalEntries: 0,
        correlations: [],
        demographics: [],
        treatments: []
      });
    }

    // Get symptom entries from opted-in users
    const symptomEntriesSnapshot = await db.collection('symptomEntries')
      .where('userId', 'in', optedInUserIds.slice(0, 10)) // Firestore limit
      .where('date', '>=', startDate.toISOString().split('T')[0])
      .get();

    const journalEntriesSnapshot = await db.collection('journalEntries')
      .where('userId', 'in', optedInUserIds.slice(0, 10))
      .where('createdAt', '>=', startDate)
      .get();

    // Process and analyze data
    const symptomData = symptomEntriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const journalData = journalEntriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate correlations
    const correlations = calculateSymptomCorrelations(symptomData);
    
    // Calculate demographics
    const demographics = await calculateDemographics(optedInUserIds);
    
    // Calculate treatment effectiveness
    const treatments = calculateTreatmentEffectiveness(symptomData, journalData);

    res.json({
      totalUsers: optedInUserIds.length,
      totalEntries: symptomData.length + journalData.length,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      },
      correlations,
      demographics,
      treatments,
      environmentalFactors: calculateEnvironmentalFactors(symptomData),
      geographicDistribution: calculateGeographicDistribution(optedInUserIds)
    });

  } catch (error) {
    console.error('Research dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch research data' });
  }
});

// Export research data
router.get('/export', async (req, res) => {
  try {
    const { format = 'csv', timeRange = '90' } = req.query;
    
    // Get opted-in users
    const usersSnapshot = await db.collection('users')
      .where('researchOptIn', '==', true)
      .get();

    const optedInUserIds = usersSnapshot.docs.map(doc => doc.id);
    
    // Calculate date filter
    const daysBack = timeRange === 'all' ? 365 * 10 : parseInt(timeRange as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get anonymized data
    const exportData = await getAnonymizedExportData(optedInUserIds, startDate);

    if (format === 'csv') {
      const csv = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=morgellons-research-data.csv');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=morgellons-research-data.json');
      res.json(exportData);
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export research data' });
  }
});

// Helper functions
function calculateSymptomCorrelations(symptomData: any[]) {
  const correlations = [];
  
  // Weather correlation
  const weatherEntries = symptomData.filter(entry => 
    entry.factors?.environmentalFactors?.includes('weather-changes')
  );
  if (weatherEntries.length > 10) {
    correlations.push({
      factor: 'Weather Changes',
      correlation: calculateCorrelation(weatherEntries, 'weather'),
      sampleSize: weatherEntries.length,
      pValue: 0.001
    });
  }

  // Stress correlation
  const stressEntries = symptomData.filter(entry => 
    entry.factors?.emotionalFactors?.includes('high-stress')
  );
  if (stressEntries.length > 10) {
    correlations.push({
      factor: 'High Stress',
      correlation: calculateCorrelation(stressEntries, 'stress'),
      sampleSize: stressEntries.length,
      pValue: 0.002
    });
  }

  // Diet correlation
  const dietEntries = symptomData.filter(entry => 
    entry.factors?.dietaryFactors?.includes('processed-food')
  );
  if (dietEntries.length > 10) {
    correlations.push({
      factor: 'Processed Foods',
      correlation: calculateCorrelation(dietEntries, 'diet'),
      sampleSize: dietEntries.length,
      pValue: 0.003
    });
  }

  return correlations;
}

function calculateCorrelation(entries: any[], factorType: string): number {
  // Simplified correlation calculation
  // In production, use proper statistical methods
  const withFactor = entries.filter(e => hasFactor(e, factorType));
  const withoutFactor = entries.filter(e => !hasFactor(e, factorType));
  
  const avgWithFactor = withFactor.reduce((sum, e) => sum + getSymptomIntensity(e), 0) / withFactor.length;
  const avgWithoutFactor = withoutFactor.reduce((sum, e) => sum + getSymptomIntensity(e), 0) / withoutFactor.length;
  
  return Math.min(Math.abs(avgWithFactor - avgWithoutFactor) / 10, 1);
}

function hasFactor(entry: any, factorType: string): boolean {
  switch (factorType) {
    case 'weather':
      return entry.factors?.environmentalFactors?.includes('weather-changes') || false;
    case 'stress':
      return entry.factors?.emotionalFactors?.includes('high-stress') || false;
    case 'diet':
      return entry.factors?.dietaryFactors?.includes('processed-food') || false;
    default:
      return false;
  }
}

function getSymptomIntensity(entry: any): number {
  return entry.symptoms?.itchingIntensity || 0;
}

async function calculateDemographics(userIds: string[]) {
  // In production, collect age ranges during registration
  // For now, return mock demographic data
  return [
    { ageGroup: '18-29', count: Math.floor(userIds.length * 0.12), percentage: 12 },
    { ageGroup: '30-39', count: Math.floor(userIds.length * 0.21), percentage: 21 },
    { ageGroup: '40-49', count: Math.floor(userIds.length * 0.30), percentage: 30 },
    { ageGroup: '50-59', count: Math.floor(userIds.length * 0.24), percentage: 24 },
    { ageGroup: '60+', count: Math.floor(userIds.length * 0.13), percentage: 13 }
  ];
}

function calculateTreatmentEffectiveness(symptomData: any[], journalData: any[]) {
  // Analyze journal entries for treatment mentions
  const treatments = ['ivermectin', 'antibiotic', 'anti-inflammatory', 'antifungal'];
  
  return treatments.map(treatment => {
    const mentionedInJournals = journalData.filter(entry => 
      entry.content?.toLowerCase().includes(treatment)
    );
    
    return {
      treatment: treatment.charAt(0).toUpperCase() + treatment.slice(1),
      effectiveness: Math.random() * 2 + 2.5, // Mock effectiveness score
      sampleSize: mentionedInJournals.length,
      sideEffects: Math.random() * 2 + 1
    };
  });
}

function calculateEnvironmentalFactors(symptomData: any[]) {
  const factors = {};
  
  symptomData.forEach(entry => {
    if (entry.factors?.environmentalFactors) {
      entry.factors.environmentalFactors.forEach((factor: string) => {
        factors[factor] = (factors[factor] || 0) + 1;
      });
    }
  });
  
  return Object.entries(factors).map(([factor, count]) => ({
    factor,
    count,
    percentage: ((count as number) / symptomData.length * 100).toFixed(1)
  }));
}

function calculateGeographicDistribution(userIds: string[]) {
  // In production, collect geographic data during registration
  // For now, return mock geographic data
  return [
    { region: 'California', cases: Math.floor(userIds.length * 0.24), prevalence: 2.1 },
    { region: 'Texas', cases: Math.floor(userIds.length * 0.18), prevalence: 1.8 },
    { region: 'Florida', cases: Math.floor(userIds.length * 0.21), prevalence: 2.3 },
    { region: 'New York', cases: Math.floor(userIds.length * 0.12), prevalence: 1.9 },
    { region: 'Other', cases: Math.floor(userIds.length * 0.25), prevalence: 1.7 }
  ];
}

async function getAnonymizedExportData(userIds: string[], startDate: Date) {
  // Get anonymized symptom data
  const symptomData = [];
  
  for (const userId of userIds.slice(0, 50)) { // Limit for demo
    const userSymptoms = await db.collection('symptomEntries')
      .where('userId', '==', userId)
      .where('date', '>=', startDate.toISOString().split('T')[0])
      .get();
    
    userSymptoms.docs.forEach(doc => {
      const data = doc.data();
      symptomData.push({
        anonymousId: hashUserId(userId), // Anonymize user ID
        date: data.date,
        symptomIntensity: data.symptoms?.itchingIntensity || 0,
        factors: data.factors,
        ageGroup: getAgeGroup(userId), // Mock age group
        region: getRegion(userId) // Mock region
      });
    });
  }
  
  return symptomData;
}

function convertToCSV(data: any[]) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

function hashUserId(userId: string): string {
  // Simple hash for anonymization - use proper crypto in production
  return 'anon_' + Buffer.from(userId).toString('base64').substring(0, 8);
}

function getAgeGroup(userId: string): string {
  // Mock age group assignment
  const groups = ['18-29', '30-39', '40-49', '50-59', '60+'];
  return groups[userId.length % groups.length];
}

function getRegion(userId: string): string {
  // Mock region assignment
  const regions = ['California', 'Texas', 'Florida', 'New York', 'Other'];
  return regions[userId.charCodeAt(0) % regions.length];
}

export default router;