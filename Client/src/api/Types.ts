// types.ts

// User data structure
export interface UserData {
    telegramId: string;       // User's Telegram ID
    username: string;         // Telegram username
    totalCoins: number;       // Total coins the user has
    coinsToClaim: number;     // Coins available to claim
    tasksCompleted: number;   // Number of completed tasks
    referralCount: number;    // Number of users referred
  }
  
  // Task data structure
  export interface TaskData {
    taskId: string;           // Unique ID for the task
    taskName: string;         // Name of the task
    description?: string;     // Description of the task (optional)
    points: number;           // Points awarded for completing the task
    completed: boolean;       // Whether the task has been completed
  }
  
  // Leaderboard data structure
  export interface LeaderboardData {
    rank: number;             // Rank position
    telegramId: string;       // Telegram ID of the user
    username: string;         // Username of the user
    totalCoins: number;       // Total coins the user has
  }
  
  // Referral data structure
  export interface ReferralData {
    referralLink: string;     // Referral link for the user
    referralCount: number;    // Number of users referred by this user
    referredUsers: UserData[]; // Array of referred users (or IDs if more efficient)
  }
  
  // Rankings data structure
  export interface RankingData {
    rank: number;             // User's rank position
    telegramId: string;       // User's Telegram ID
    username: string;         // Username of the user
    totalCoins: number;       // Total coins for ranking purposes
  }
  
  // User rank data structure
  export interface UserRankData {
    rank: number;             // Rank of the user
    telegramId: string;       // User's Telegram ID
    username: string;         // Username of the user
    totalCoins: number;       // User's total coins
    coinsToClaim: number;     // Coins available to claim
  }
  