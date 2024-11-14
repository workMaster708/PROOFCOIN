import React from 'react';
import '../styles/Dailystreak.css';

// Define the types for each reward item
interface Reward {
  day: number;
  reward: string;
  claimed: boolean;
}

const DailyStreak: React.FC = () => {
  const vipRewards: Reward[] = [
    { day: 1, reward: '500', claimed: true },
    { day: 2, reward: '1K', claimed: true },
    { day: 3, reward: '2K', claimed: true },
    { day: 4, reward: '4K', claimed: true },
    { day: 5, reward: '10K', claimed: true },
    { day: 6, reward: '30K', claimed: false },
    { day: 7, reward: '50K', claimed: false },
  ];

  return (
    <div className="vip-task-container">
      <div className="header">
        <h2>Daily check-in</h2>
        <p>Gain your diamonds with daily login streak!</p>
      </div>
      <div className="vip-task-grid">
        {vipRewards.map((reward) => (
          <div
            key={reward.day}
            className={`vip-task-item ${reward.claimed ? 'claimed' : ''}`}
          >
            <span>Day {reward.day}</span>
            <div className="reward-icon">🔎</div>
            <span>{reward.reward}</span>
          </div>
        ))}
      </div>
      <div className="footer">
        <button className="checkin-button" disabled>
          See you tomorrow
        </button>
      </div>
    </div>
  );
};

export default DailyStreak;
