// User data structure
export interface UserData {
  last_name: string | undefined;
  first_name: string;
  id: string;                // Unique user ID
  _id: string;              // Optional MongoDB-style ID
  name: string;              // Full name of the user
  firstName: string;         // User's first name
  lastName?: string;         // User's last name (optional)
  username: string;          // Telegram username
  telegramId: string;        // User's Telegram ID
  bio?: string;              // User's biography (optional)
  coins: number;             // Current coin balance
  totalCoins: number;        // Total coins accumulated by the user
  coinsToClaim: number;      // Coins available to claim
  tasksCompleted: number;    // Number of completed tasks
  referralCount: number;     // Number of users referred by the user
  lastFarmingTime?: string;  // Last farming activity timestamp (ISO date string, optional)
}

// Task data structure
export interface TaskData {
  id: string;               // Unique task ID
  name: string;             // Task name
  description?: string;     // Task description (optional)
  points: number;           // Points awarded for completing the task
  isCompleted: boolean;     // Completion status of the task
}

// Leaderboard entry data structure
export interface LeaderboardData {
  rank: number;             // User's rank on the leaderboard
  telegramId: string;       // Telegram ID of the user
  username: string;         // Telegram username of the user
  totalCoins: number;       // Total coins used for leaderboard ranking
}

// Referral data structure
export interface ReferralData {
  totalReferrals: number;    // Total number of referrals made by the user
  referralLink: string;      // Unique referral link for the user
  referralCount: number;     // Active referrals (e.g., users who joined via referral)
  referredUsers: UserData[]; // List of referred users (complete user data)
}

// Rankings data structure
export interface RankingData {
  rank: number;             // User's rank position
  telegramId: string;       // Telegram ID of the user
  username: string;         // Telegram username of the user
  totalCoins: number;       // Total coins used for ranking purposes
}

// User rank data structure
export interface UserRankData {
  rank: number;             // User's rank on the leaderboard
  telegramId: string;       // Telegram ID of the user
  username: string;         // Telegram username of the user
  totalCoins: number;       // User's total coins
  coinsToClaim: number;     // Coins available to claim
}
