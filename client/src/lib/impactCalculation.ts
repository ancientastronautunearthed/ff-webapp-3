import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';

interface ImpactScoreCalculation {
  userId: string;
  researchScore: number;
  supportScore: number;
  knowledgeScore: number;
  mentoringScore: number;
  consistencyScore: number;
  totalScore: number;
  lastCalculated: Date;
}

interface UserActivity {
  type: 'research_participation' | 'forum_post' | 'forum_reply' | 'helpful_vote' | 'mentoring' | 'knowledge_share';
  points: number;
  timestamp: Date;
  details?: any;
}

export class ImpactCalculationEngine {
  // Point values for different activities
  private static readonly POINT_VALUES = {
    research_participation: 200,
    research_data_contribution: 150,
    forum_post_helpful: 25,
    forum_reply_helpful: 15,
    received_helpful_vote: 10,
    mentoring_session: 50,
    knowledge_article: 75,
    community_support: 20,
    daily_check_in: 5,
    symptom_tracking: 8,
    journal_entry: 10,
    peer_connection: 30,
    survey_completion: 40
  };

  // Multipliers for consistency and quality
  private static readonly MULTIPLIERS = {
    weekly_streak: 1.1,
    monthly_streak: 1.25,
    quality_content: 1.5,
    verified_expert: 2.0,
    peer_endorsed: 1.3
  };

  static async calculateUserImpactScore(userId: string): Promise<ImpactScoreCalculation> {
    try {
      // Get user's activities from different collections
      const [
        researchActivities,
        forumActivities,
        mentoringActivities,
        healthTrackingActivities,
        communityActivities
      ] = await Promise.all([
        this.getResearchActivities(userId),
        this.getForumActivities(userId),
        this.getMentoringActivities(userId),
        this.getHealthTrackingActivities(userId),
        this.getCommunityActivities(userId)
      ]);

      // Calculate scores for each category
      const researchScore = this.calculateResearchScore(researchActivities);
      const supportScore = this.calculateSupportScore(forumActivities, communityActivities);
      const knowledgeScore = this.calculateKnowledgeScore(forumActivities);
      const mentoringScore = this.calculateMentoringScore(mentoringActivities);
      const consistencyScore = this.calculateConsistencyScore(healthTrackingActivities);

      // Calculate total with weighted scoring
      const totalScore = Math.round(
        researchScore * 0.3 +
        supportScore * 0.25 +
        knowledgeScore * 0.2 +
        mentoringScore * 0.15 +
        consistencyScore * 0.1
      );

      const calculation: ImpactScoreCalculation = {
        userId,
        researchScore,
        supportScore,
        knowledgeScore,
        mentoringScore,
        consistencyScore,
        totalScore,
        lastCalculated: new Date()
      };

      // Save to Firebase
      await this.saveImpactScore(calculation);

      // Check for new achievements
      await this.checkAchievements(userId, calculation);

      return calculation;
    } catch (error) {
      console.error('Error calculating impact score:', error);
      throw error;
    }
  }

  private static async getResearchActivities(userId: string) {
    const activities = [];
    
    try {
      // Research consent and participation
      const consentQuery = query(
        collection(db, 'research_consent'),
        where('userId', '==', userId)
      );
      const consentSnapshot = await getDocs(consentQuery);
      
      if (!consentSnapshot.empty) {
        activities.push({
          type: 'research_participation',
          points: this.POINT_VALUES.research_participation,
          timestamp: consentSnapshot.docs[0].data().createdAt?.toDate() || new Date()
        });
      }

      // Survey completions
      const surveysQuery = query(
        collection(db, 'survey_responses'),
        where('userId', '==', userId)
      );
      const surveysSnapshot = await getDocs(surveysQuery);
      
      surveysSnapshot.docs.forEach(doc => {
        activities.push({
          type: 'research_participation',
          points: this.POINT_VALUES.survey_completion,
          timestamp: doc.data().completedAt?.toDate() || new Date()
        });
      });

    } catch (error) {
      console.error('Error getting research activities:', error);
    }
    
    return activities;
  }

  private static async getForumActivities(userId: string) {
    const activities = [];
    
    try {
      // Forum posts
      const postsQuery = query(
        collection(db, 'forum_posts'),
        where('userId', '==', userId)
      );
      const postsSnapshot = await getDocs(postsQuery);
      
      postsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const helpfulVotes = data.helpfulVotes || 0;
        const basePoints = helpfulVotes > 5 ? this.POINT_VALUES.forum_post_helpful : 10;
        
        activities.push({
          type: 'forum_post',
          points: basePoints + (helpfulVotes * 2),
          timestamp: data.createdAt?.toDate() || new Date(),
          details: { helpfulVotes, category: data.category }
        });
      });

      // Forum replies
      const repliesQuery = query(
        collection(db, 'forum_replies'),
        where('userId', '==', userId)
      );
      const repliesSnapshot = await getDocs(repliesQuery);
      
      repliesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const helpfulVotes = data.helpfulVotes || 0;
        const basePoints = helpfulVotes > 3 ? this.POINT_VALUES.forum_reply_helpful : 5;
        
        activities.push({
          type: 'forum_reply',
          points: basePoints + helpfulVotes,
          timestamp: data.createdAt?.toDate() || new Date(),
          details: { helpfulVotes }
        });
      });

    } catch (error) {
      console.error('Error getting forum activities:', error);
    }
    
    return activities;
  }

  private static async getMentoringActivities(userId: string) {
    const activities = [];
    
    try {
      // Peer connections where user is mentor
      const connectionsQuery = query(
        collection(db, 'peer_connections'),
        where('mentorId', '==', userId),
        where('status', '==', 'active')
      );
      const connectionsSnapshot = await getDocs(connectionsQuery);
      
      connectionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        activities.push({
          type: 'mentoring',
          points: this.POINT_VALUES.mentoring_session,
          timestamp: data.createdAt?.toDate() || new Date(),
          details: { connectionId: doc.id }
        });
      });

    } catch (error) {
      console.error('Error getting mentoring activities:', error);
    }
    
    return activities;
  }

  private static async getHealthTrackingActivities(userId: string) {
    const activities = [];
    
    try {
      // Daily check-ins
      const checkinsQuery = query(
        collection(db, 'daily_checkins'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(90) // Last 90 days
      );
      const checkinsSnapshot = await getDocs(checkinsQuery);
      
      checkinsSnapshot.docs.forEach(doc => {
        activities.push({
          type: 'daily_check_in',
          points: this.POINT_VALUES.daily_check_in,
          timestamp: doc.data().date?.toDate() || new Date()
        });
      });

      // Symptom entries
      const symptomsQuery = query(
        collection(db, 'symptom_entries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const symptomsSnapshot = await getDocs(symptomsQuery);
      
      symptomsSnapshot.docs.forEach(doc => {
        activities.push({
          type: 'symptom_tracking',
          points: this.POINT_VALUES.symptom_tracking,
          timestamp: doc.data().createdAt?.toDate() || new Date()
        });
      });

      // Journal entries
      const journalsQuery = query(
        collection(db, 'journal_entries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const journalsSnapshot = await getDocs(journalsQuery);
      
      journalsSnapshot.docs.forEach(doc => {
        activities.push({
          type: 'journal_entry',
          points: this.POINT_VALUES.journal_entry,
          timestamp: doc.data().createdAt?.toDate() || new Date()
        });
      });

    } catch (error) {
      console.error('Error getting health tracking activities:', error);
    }
    
    return activities;
  }

  private static async getCommunityActivities(userId: string) {
    const activities = [];
    
    try {
      // Community contributions
      const contributionsQuery = query(
        collection(db, 'community_contributions'),
        where('userId', '==', userId)
      );
      const contributionsSnapshot = await getDocs(contributionsQuery);
      
      contributionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        activities.push({
          type: 'community_support',
          points: this.POINT_VALUES.community_support,
          timestamp: data.timestamp?.toDate() || new Date(),
          details: { type: data.type }
        });
      });

    } catch (error) {
      console.error('Error getting community activities:', error);
    }
    
    return activities;
  }

  private static calculateResearchScore(activities: UserActivity[]): number {
    const researchActivities = activities.filter(a => a.type === 'research_participation');
    const baseScore = researchActivities.reduce((sum, activity) => sum + activity.points, 0);
    
    // Bonus for consistent research participation
    const uniqueMonths = new Set(
      researchActivities.map(a => `${a.timestamp.getFullYear()}-${a.timestamp.getMonth()}`)
    ).size;
    
    const consistencyBonus = uniqueMonths > 3 ? baseScore * 0.2 : 0;
    
    return Math.round(baseScore + consistencyBonus);
  }

  private static calculateSupportScore(forumActivities: UserActivity[], communityActivities: UserActivity[]): number {
    const supportActivities = [
      ...forumActivities.filter(a => a.details?.helpfulVotes > 0),
      ...communityActivities
    ];
    
    const baseScore = supportActivities.reduce((sum, activity) => sum + activity.points, 0);
    
    // Quality multiplier for highly helpful content
    const highQualityCount = forumActivities.filter(a => a.details?.helpfulVotes >= 5).length;
    const qualityBonus = highQualityCount * 25;
    
    return Math.round(baseScore + qualityBonus);
  }

  private static calculateKnowledgeScore(activities: UserActivity[]): number {
    const knowledgeActivities = activities.filter(a => 
      a.type === 'forum_post' && 
      (a.details?.category === 'education' || a.details?.helpfulVotes >= 3)
    );
    
    return knowledgeActivities.reduce((sum, activity) => sum + activity.points, 0);
  }

  private static calculateMentoringScore(activities: UserActivity[]): number {
    const mentoringActivities = activities.filter(a => a.type === 'mentoring');
    const baseScore = mentoringActivities.reduce((sum, activity) => sum + activity.points, 0);
    
    // Bonus for long-term mentoring relationships
    const longTermBonus = mentoringActivities.length > 5 ? baseScore * 0.3 : 0;
    
    return Math.round(baseScore + longTermBonus);
  }

  private static calculateConsistencyScore(activities: UserActivity[]): number {
    // Calculate streaks and consistency
    const dailyActivities = activities.filter(a => 
      ['daily_check_in', 'symptom_tracking', 'journal_entry'].includes(a.type)
    );
    
    // Group by date
    const activityDates = new Set(
      dailyActivities.map(a => a.timestamp.toDateString())
    );
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      if (activityDates.has(checkDate.toDateString())) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Base points for consistency
    const baseScore = dailyActivities.length * 2;
    const streakBonus = currentStreak * 10;
    
    return Math.round(baseScore + streakBonus);
  }

  private static async saveImpactScore(calculation: ImpactScoreCalculation): Promise<void> {
    try {
      await setDoc(doc(db, 'userImpactScores', calculation.userId), {
        ...calculation,
        lastCalculated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving impact score:', error);
      throw error;
    }
  }

  private static async checkAchievements(userId: string, calculation: ImpactScoreCalculation): Promise<void> {
    try {
      const achievements = [];
      
      // Research achievements
      if (calculation.researchScore >= 500) {
        achievements.push({
          id: 'research_pioneer',
          name: 'Research Pioneer',
          category: 'research',
          unlockedAt: new Date()
        });
      }
      
      // Community achievements
      if (calculation.supportScore >= 750) {
        achievements.push({
          id: 'community_pillar',
          name: 'Community Pillar',
          category: 'community',
          unlockedAt: new Date()
        });
      }
      
      // Knowledge achievements
      if (calculation.knowledgeScore >= 400) {
        achievements.push({
          id: 'knowledge_guardian',
          name: 'Knowledge Guardian',
          category: 'knowledge',
          unlockedAt: new Date()
        });
      }
      
      // Mentoring achievements
      if (calculation.mentoringScore >= 600) {
        achievements.push({
          id: 'mentor_extraordinaire',
          name: 'Mentor Extraordinaire',
          category: 'mentoring',
          unlockedAt: new Date()
        });
      }
      
      // Consistency achievements
      if (calculation.consistencyScore >= 300) {
        achievements.push({
          id: 'consistency_champion',
          name: 'Consistency Champion',
          category: 'milestone',
          unlockedAt: new Date()
        });
      }
      
      // Total score achievements
      if (calculation.totalScore >= 5000) {
        achievements.push({
          id: 'impact_titan',
          name: 'Impact Titan',
          category: 'milestone',
          unlockedAt: new Date()
        });
      }
      
      // Save new achievements
      for (const achievement of achievements) {
        const achievementRef = doc(db, 'userAchievements', `${userId}_${achievement.id}`);
        const existingDoc = await getDoc(achievementRef);
        
        if (!existingDoc.exists()) {
          await setDoc(achievementRef, {
            userId,
            ...achievement,
            unlockedAt: serverTimestamp()
          });
        }
      }
      
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  static async updateUserImpactScore(userId: string): Promise<void> {
    try {
      await this.calculateUserImpactScore(userId);
    } catch (error) {
      console.error('Error updating user impact score:', error);
    }
  }

  static async recalculateAllScores(): Promise<void> {
    try {
      // Get all users with activities
      const usersQuery = query(collection(db, 'users'), limit(1000));
      const usersSnapshot = await getDocs(usersQuery);
      
      const promises = usersSnapshot.docs.map(doc => 
        this.calculateUserImpactScore(doc.id)
      );
      
      await Promise.all(promises);
      console.log('All impact scores recalculated successfully');
      
    } catch (error) {
      console.error('Error recalculating all scores:', error);
    }
  }
}

export default ImpactCalculationEngine;