import { Router } from 'express';
import { RealEstateEngine, PropertyListing, MortgageOption, FamilyProgression } from '../ai/real-estate-engine';

export const realEstateRoutes = Router();

// Get property listings based on user criteria
realEstateRoutes.post('/listings', async (req, res) => {
  try {
    const { 
      location, 
      budget, 
      familyData, 
      searchCriteria 
    } = req.body;

    if (!location || !budget) {
      return res.status(400).json({ error: 'Location and budget are required' });
    }

    // Build family progression context
    const familyProgression: FamilyProgression = {
      currentPhase: familyData?.currentPhase || 'single',
      members: familyData?.members || [],
      plannedAdditions: familyData?.plannedAdditions || { children: 0, timeline: '', budget: 0 },
      housingNeeds: {
        minBedrooms: searchCriteria?.minBedrooms || 2,
        minBathrooms: searchCriteria?.minBathrooms || 1,
        requiredSpaces: searchCriteria?.requiredSpaces || [],
        preferredFeatures: searchCriteria?.preferredFeatures || [],
        maxBudget: budget,
        location: location
      },
      lifestyle: familyData?.lifestyle || {
        workFromHome: false,
        entertainingFrequency: 'occasionally',
        petOwnership: false,
        hobbiesRequiringSpace: [],
        transportationNeeds: []
      }
    };

    const listings = await RealEstateEngine.generatePropertyListings(
      location,
      budget,
      familyProgression
    );

    res.json({
      listings,
      searchCriteria: {
        location,
        budget,
        familyPhase: familyProgression.currentPhase,
        resultsCount: listings.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Property listings error:', error);
    res.status(500).json({ error: 'Failed to generate property listings' });
  }
});

// Get mortgage options for a specific property
realEstateRoutes.post('/mortgage-options', async (req, res) => {
  try {
    const { 
      propertyPrice, 
      creditScore, 
      downPayment, 
      annualIncome, 
      userId 
    } = req.body;

    if (!propertyPrice || !creditScore || !downPayment || !annualIncome) {
      return res.status(400).json({ 
        error: 'Property price, credit score, down payment, and annual income are required' 
      });
    }

    const mortgageOptions = await RealEstateEngine.generateMortgageOptions(
      propertyPrice,
      creditScore,
      downPayment,
      annualIncome
    );

    // Calculate affordability analysis
    const monthlyIncome = annualIncome / 12;
    const maxMonthlyPayment = monthlyIncome * 0.28; // 28% debt-to-income ratio
    const affordabilityAnalysis = {
      maxAffordablePayment: maxMonthlyPayment,
      recommendedDownPayment: propertyPrice * 0.2,
      totalMonthlyExpenses: mortgageOptions[0]?.monthlyPayment + 
        (mortgageOptions[0]?.propertyTaxAnnual || 0) / 12 +
        (mortgageOptions[0]?.insuranceEstimate || 0) / 12,
      affordabilityRating: maxMonthlyPayment >= (mortgageOptions[0]?.monthlyPayment || 0) ? 'good' : 'stretch'
    };

    res.json({
      mortgageOptions,
      affordabilityAnalysis,
      propertyDetails: {
        price: propertyPrice,
        downPayment,
        loanAmount: propertyPrice - downPayment
      },
      userProfile: {
        creditScore,
        annualIncome
      }
    });

  } catch (error) {
    console.error('Mortgage options error:', error);
    res.status(500).json({ error: 'Failed to generate mortgage options' });
  }
});

// Simulate family growth and housing needs
realEstateRoutes.post('/family-projection', async (req, res) => {
  try {
    const { currentFamily, projectionYears } = req.body;

    if (!currentFamily || !projectionYears) {
      return res.status(400).json({ 
        error: 'Current family data and projection years are required' 
      });
    }

    const projection = await RealEstateEngine.simulateFamilyGrowth(
      currentFamily,
      projectionYears
    );

    // Calculate financial implications
    const financialProjection = {
      currentAnnualExpenses: currentFamily.members.reduce(
        (sum: number, member: any) => sum + (member.monthlyExpenses || 0) * 12, 0
      ),
      projectedAnnualExpenses: projection.projectedFamily.members.reduce(
        (sum: number, member: any) => sum + (member.monthlyExpenses || 0) * 12, 0
      ),
      housingCostChanges: projection.housingChanges.reduce(
        (sum: number, change: any) => sum + change.estimatedCost, 0
      ),
      totalProjectedCost: 0
    };

    financialProjection.totalProjectedCost = 
      (financialProjection.projectedAnnualExpenses - financialProjection.currentAnnualExpenses) * projectionYears +
      financialProjection.housingCostChanges;

    res.json({
      familyProjection: projection,
      financialImpact: financialProjection,
      recommendations: generateFamilyRecommendations(projection),
      timeline: projectionYears
    });

  } catch (error) {
    console.error('Family projection error:', error);
    res.status(500).json({ error: 'Failed to generate family projection' });
  }
});

// Purchase property simulation
realEstateRoutes.post('/purchase-simulation', async (req, res) => {
  try {
    const { 
      propertyId, 
      propertyPrice, 
      mortgageOption, 
      userFinancials, 
      familyData 
    } = req.body;

    const simulation = {
      propertyId,
      purchasePrice: propertyPrice,
      downPayment: mortgageOption.downPaymentPercent * propertyPrice / 100,
      monthlyPayment: mortgageOption.monthlyPayment,
      closingCosts: mortgageOption.closingCosts,
      totalInitialCost: (mortgageOption.downPaymentPercent * propertyPrice / 100) + mortgageOption.closingCosts,
      
      // Monthly breakdown
      monthlyBreakdown: {
        mortgage: mortgageOption.monthlyPayment,
        propertyTax: (propertyPrice * 0.012) / 12,
        insurance: (propertyPrice * 0.003) / 12,
        utilities: 250,
        maintenance: propertyPrice * 0.01 / 12,
        total: 0
      },
      
      // Long-term projections
      fiveYearProjection: {
        totalPaid: mortgageOption.monthlyPayment * 60,
        principalPaid: calculatePrincipalPaid(propertyPrice - (mortgageOption.downPaymentPercent * propertyPrice / 100), mortgageOption.interestRate, 60),
        estimatedValue: propertyPrice * 1.25, // 5% annual appreciation
        equity: 0
      },
      
      // Affordability analysis
      affordability: {
        monthlyIncomeRequired: mortgageOption.monthlyPayment / 0.28,
        debtToIncomeRatio: mortgageOption.monthlyPayment / (userFinancials.monthlyIncome || 5000),
        emergencyFundNeeded: mortgageOption.monthlyPayment * 6,
        recommendation: 'proceed' // Will be calculated based on ratios
      }
    };

    // Calculate totals
    simulation.monthlyBreakdown.total = Object.values(simulation.monthlyBreakdown)
      .filter(val => typeof val === 'number')
      .reduce((sum, val) => sum + val, 0);

    simulation.fiveYearProjection.equity = 
      simulation.fiveYearProjection.estimatedValue - 
      (propertyPrice - simulation.fiveYearProjection.principalPaid);

    // Determine recommendation
    if (simulation.affordability.debtToIncomeRatio > 0.28) {
      simulation.affordability.recommendation = 'risky';
    } else if (simulation.affordability.debtToIncomeRatio > 0.35) {
      simulation.affordability.recommendation = 'not_recommended';
    }

    res.json({
      purchaseSimulation: simulation,
      successFactors: [
        'Stable employment history',
        'Emergency fund in place',
        'Good credit score',
        'Reasonable debt-to-income ratio'
      ],
      risks: [
        'Interest rate changes',
        'Property value fluctuations', 
        'Unexpected maintenance costs',
        'Income loss'
      ],
      nextSteps: [
        'Get pre-approved for mortgage',
        'Schedule property inspection',
        'Review neighborhood comparables',
        'Plan for moving costs'
      ]
    });

  } catch (error) {
    console.error('Purchase simulation error:', error);
    res.status(500).json({ error: 'Failed to generate purchase simulation' });
  }
});

// Market analysis for a location
realEstateRoutes.get('/market-analysis/:location', async (req, res) => {
  try {
    const { location } = req.params;
    
    // Simulate market data for 2035
    const marketAnalysis = {
      location,
      averagePrice: 650000 + Math.floor(Math.random() * 300000),
      pricePerSqFt: 400 + Math.floor(Math.random() * 200),
      yearOverYearGrowth: 3 + Math.random() * 7, // 3-10%
      monthsOfInventory: 2 + Math.random() * 4, // 2-6 months
      medianDaysOnMarket: 15 + Math.floor(Math.random() * 30),
      
      trends: {
        aiIntegratedHomes: {
          premiumPercent: 15,
          demand: 'high',
          description: 'Homes with full AI integration command 15% premium'
        },
        sustainableFeatures: {
          premiumPercent: 8,
          demand: 'very_high',
          description: 'Energy-efficient homes with green technology'
        },
        flexibleSpaces: {
          premiumPercent: 12,
          demand: 'high',
          description: 'Adaptable spaces for work-from-home arrangements'
        }
      },
      
      forecast: {
        nextYear: 'Moderate growth expected due to AI workforce expansion',
        threeYear: 'Strong appreciation potential with infrastructure development',
        fiveYear: 'Market maturation with sustainable growth patterns'
      },
      
      demographics: {
        averageAge: 34,
        familySize: 2.3,
        workFromHomePercent: 65,
        techWorkersPercent: 40
      }
    };

    res.json({
      marketAnalysis,
      lastUpdated: new Date().toISOString(),
      dataSource: 'AI Real Estate Analytics 2035'
    });

  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(500).json({ error: 'Failed to generate market analysis' });
  }
});

// Helper functions
function generateFamilyRecommendations(projection: any) {
  const recommendations = [];
  
  if (projection.housingChanges.length > 0) {
    recommendations.push({
      type: 'housing',
      priority: 'high',
      title: 'Plan for Space Changes',
      description: 'Your family growth will require additional bedrooms and spaces.',
      timeline: `Years ${projection.housingChanges[0]?.year || 2}-${projection.housingChanges[projection.housingChanges.length - 1]?.year || 5}`
    });
  }

  if (projection.milestones.some((m: any) => m.type === 'birth')) {
    recommendations.push({
      type: 'financial',
      priority: 'high',
      title: 'Build Education Fund',
      description: 'Start saving for children\'s education and future expenses.',
      timeline: 'Start immediately'
    });
  }

  if (projection.milestones.some((m: any) => m.type === 'empty_nest')) {
    recommendations.push({
      type: 'lifestyle',
      priority: 'medium',
      title: 'Consider Downsizing',
      description: 'Opportunity to reduce housing costs and optimize for new lifestyle.',
      timeline: 'Plan 2-3 years in advance'
    });
  }

  return recommendations;
}

function calculatePrincipalPaid(loanAmount: number, rate: number, months: number): number {
  const monthlyRate = rate / 12;
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months * 5)) / 
    (Math.pow(1 + monthlyRate, months * 5) - 1);
  
  let balance = loanAmount;
  let principalPaid = 0;
  
  for (let i = 0; i < months; i++) {
    const interestPayment = balance * monthlyRate;
    const principal = monthlyPayment - interestPayment;
    principalPaid += principal;
    balance -= principal;
  }
  
  return principalPaid;
}