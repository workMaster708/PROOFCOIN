// Importing necessary types
import { UserData, TaskData, LeaderboardData, ReferralData, RankingData, UserRankData } from './types'; // Import types if defined in a types file

// Function to fetch user data by Telegram ID
export const getUserData = async (userId: string): Promise<UserData> => {
  try {
    const response = await fetch(`https://full-app-5ise.onrender.com/api/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const data: UserData = await response.json();
    console.log('User Data Response:', data); // Debugging log
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to start farming coins for a user
export const farmCoins = async (userId: string): Promise<{ coins: number; coinsToClaim: number }> => {
  try {
    const response = await fetch(`https://full-app-5ise.onrender.com/api/farm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegramId: userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to farm coins');
    }
    const data = await response.json();
    console.log('Farm Coins Response:', data); // Debugging log
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to claim farming coins
export const claimCoins = async (userId: string): Promise<{ totalCoins: number }> => {
  try {
    const response = await fetch(`https://full-app-5ise.onrender.com/api/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegramId: userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to claim coins');
    }
    const data = await response.json();
    console.log('Claim Coins Response:', data); // Debugging log
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to add a task for a user
export const addTask = async (userId: string, taskName: string, points: number): Promise<TaskData> => {
  try {
    const response = await fetch(`https://full-app-5ise.onrender.com/api/user/${userId}/add-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskName, points }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to add task:', errorData);
      throw new Error(errorData.error || 'Failed to add task');
    }
    const data: TaskData = await response.json();
    console.log('Add Task Response:', data); // Debugging log
    return data;
  } catch (error) {
    console.error('Error in addTask:', error);
    throw error;
  }
};

// Function to complete a task for a user
export const completeTask = async (userId: string, taskName: string): Promise<TaskData> => {
  try {
    const response = await fetch(`https://full-app-5ise.onrender.com/api/user/${userId}/complete-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskName }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to complete task:', errorData);
      throw new Error(errorData.error || 'Failed to complete task');
    }
    const data: TaskData = await response.json();
    console.log('Complete Task Response:', data); // Debugging log
    return data;
  } catch (error) {
    console.error('Error in completeTask:', error);
    throw error;
  }
};

// Function to fetch all tasks for a user
export const getTasks = async (userId: string): Promise<TaskData[]> => {
  try {
    const response = await fetch(`https://full-app-5ise.onrender.com/api/user/${userId}/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const data: TaskData[] = await response.json();
    console.log('Tasks Data Response:', data); // Debugging log
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to get the leaderboard data
export const getLeaderboard = async (): Promise<LeaderboardData[]> => {
  try {
    const response = await fetch('https://full-app-5ise.onrender.com/api/leaderboard');
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    const data: LeaderboardData[] = await response.json();
    console.log('Leaderboard Data Response:', data); // Debugging log
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch a user's referral link
export const getReferralLink = async (userId: string): Promise<ReferralData> => {
  try {
    const response = await fetch(`https://full-app-5ise.onrender.com/api/user/referral-link/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch referral link');
    }
    const data: ReferralData = await response.json();
    console.log('Referral Link Response:', data); // Debugging log
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to get user referrals and referral count
export const getUserReferrals = async (userId: string): Promise<ReferralData> => {
  try {
    const response = await fetch(`https://full-app-5ise.onrender.com/api/user/referral/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch referred users');
    }
    const data: ReferralData = await response.json();
    console.log('User Referrals Data Response:', data); // Debugging log
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to get rankings data (new functionality)
export const getRankings = async (): Promise<RankingData[]> => {
  try {
    const response = await fetch('https://full-app-5ise.onrender.com/api/rankings');
    if (!response.ok) {
      throw new Error('Failed to fetch rankings');
    }
    const data: RankingData[] = await response.json();
    console.log('Rankings Data Response:', data); // Debugging log
    return data;
  } catch (error) {
    throw error;
  }
};

// Function to get user rank based on coins (new functionality)
export const getUserRank = async (userId: string): Promise<UserRankData> => {
  try {
    const response = await fetch(`https://full-app-5ise.onrender.com/api/rank/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user rank');
    }
    const data: UserRankData = await response.json();
    console.log('User Rank Response:', data); // Debugging log
    return data;
  } catch (error) {
    throw error;
  }
};
