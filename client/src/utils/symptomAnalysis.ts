import type { SymptomEntry } from '@shared/schema';

export interface SymptomTrend {
  date: string;
  itching: number;
  fatigue: number;
  brainFog: number;
  sleep: number;
}

export interface FactorCorrelation {
  factor: string;
  symptom: string;
  correlation: number;
  direction: 'increase' | 'decrease';
  color: string;
}

export const processSymptomData = (entries: SymptomEntry[]): SymptomTrend[] => {
  if (!entries || entries.length === 0) return [];

  return entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => {
      const symptoms = entry.symptoms as any;
      return {
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        itching: symptoms?.itchingIntensity || 0,
        fatigue: symptoms?.fatigueLevel || 0,
        brainFog: mapBrainFogToNumber(symptoms?.brainFogSeverity),
        sleep: mapSleepQualityToNumber(symptoms?.sleepQuality)
      };
    });
};

export const calculateCorrelations = (entries: SymptomEntry[]): FactorCorrelation[] => {
  if (!entries || entries.length < 3) return [];

  const correlations: FactorCorrelation[] = [];
  
  // Analyze diet factor correlations
  const sugarDays = entries.filter(entry => {
    const factors = entry.factors as any;
    return factors?.dietFactors?.includes('high-sugar');
  });
  
  if (sugarDays.length > 0) {
    const avgItchingWithSugar = sugarDays.reduce((sum, entry) => {
      const symptoms = entry.symptoms as any;
      return sum + (symptoms?.itchingIntensity || 0);
    }, 0) / sugarDays.length;
    
    const avgItchingWithoutSugar = entries
      .filter(entry => {
        const factors = entry.factors as any;
        return !factors?.dietFactors?.includes('high-sugar');
      })
      .reduce((sum, entry) => {
        const symptoms = entry.symptoms as any;
        return sum + (symptoms?.itchingIntensity || 0);
      }, 0) / Math.max(1, entries.length - sugarDays.length);
    
    const correlation = Math.round(((avgItchingWithSugar - avgItchingWithoutSugar) / 10) * 100);
    
    if (Math.abs(correlation) > 10) {
      correlations.push({
        factor: 'High Sugar Intake',
        symptom: 'Itching',
        correlation: Math.abs(correlation),
        direction: correlation > 0 ? 'increase' : 'decrease',
        color: correlation > 0 ? 'red' : 'green'
      });
    }
  }

  // Analyze medication correlations
  const medicationDays = entries.filter(entry => {
    const factors = entry.factors as any;
    return factors?.medications?.includes('antihistamines');
  });
  
  if (medicationDays.length > 0) {
    const avgItchingWithMeds = medicationDays.reduce((sum, entry) => {
      const symptoms = entry.symptoms as any;
      return sum + (symptoms?.itchingIntensity || 0);
    }, 0) / medicationDays.length;
    
    const avgItchingWithoutMeds = entries
      .filter(entry => {
        const factors = entry.factors as any;
        return !factors?.medications?.includes('antihistamines');
      })
      .reduce((sum, entry) => {
        const symptoms = entry.symptoms as any;
        return sum + (symptoms?.itchingIntensity || 0);
      }, 0) / Math.max(1, entries.length - medicationDays.length);
    
    const correlation = Math.round(((avgItchingWithoutMeds - avgItchingWithMeds) / 10) * 100);
    
    if (Math.abs(correlation) > 10) {
      correlations.push({
        factor: 'Antihistamine Use',
        symptom: 'Itching',
        correlation: Math.abs(correlation),
        direction: correlation > 0 ? 'decrease' : 'increase',
        color: correlation > 0 ? 'green' : 'red'
      });
    }
  }

  return correlations;
};

const mapBrainFogToNumber = (severity: string): number => {
  switch (severity) {
    case 'clear': return 1;
    case 'slight': return 3;
    case 'moderate': return 6;
    case 'severe': return 9;
    default: return 0;
  }
};

const mapSleepQualityToNumber = (quality: string): number => {
  switch (quality) {
    case 'excellent': return 9;
    case 'good': return 7;
    case 'poor': return 4;
    case 'very-poor': return 2;
    default: return 0;
  }
};

export const getWeeklyStats = (entries: SymptomEntry[]) => {
  if (!entries || entries.length === 0) {
    return {
      trackingDays: 0,
      totalDays: 30,
      avgItching: 0,
      avgSleep: 0,
      avgBrainFog: 0,
      completionRate: 0
    };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentEntries = entries.filter(entry => 
    new Date(entry.date) >= thirtyDaysAgo
  );

  const totalItching = recentEntries.reduce((sum, entry) => {
    const symptoms = entry.symptoms as any;
    return sum + (symptoms?.itchingIntensity || 0);
  }, 0);

  const totalSleep = recentEntries.reduce((sum, entry) => {
    const symptoms = entry.symptoms as any;
    return sum + mapSleepQualityToNumber(symptoms?.sleepQuality);
  }, 0);

  const totalBrainFog = recentEntries.reduce((sum, entry) => {
    const symptoms = entry.symptoms as any;
    return sum + mapBrainFogToNumber(symptoms?.brainFogSeverity);
  }, 0);

  return {
    trackingDays: recentEntries.length,
    totalDays: 30,
    avgItching: recentEntries.length > 0 ? totalItching / recentEntries.length : 0,
    avgSleep: recentEntries.length > 0 ? totalSleep / recentEntries.length : 0,
    avgBrainFog: recentEntries.length > 0 ? totalBrainFog / recentEntries.length : 0,
    completionRate: Math.round((recentEntries.length / 30) * 100)
  };
};