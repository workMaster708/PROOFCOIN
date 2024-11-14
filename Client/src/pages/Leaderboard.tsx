import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/api'; // Ensure this function is correctly set up to fetch leaderboard data
import '../styles/Leaderboard.css';

// Define the structure of each leaderboard entry
interface LeaderboardEntry {
  id: string;
  name: string;
  coins: number;
  rank: number;
}

// Define the expected response structure if getLeaderboard returns an array
interface LeaderboardResponse {
  telegramId?: string;
  _id?: string;
  name?: string;
  coins: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userId = '12345'; // Replace with actual logic to get the current user's ID

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await getLeaderboard(); // Fetch leaderboard data

        if (Array.isArray(response)) {
          const formattedData: LeaderboardEntry[] = response.map((entry: LeaderboardResponse, index) => ({
            id: entry.telegramId || entry._id || 'Unknown',
            name: entry.name || 'Anonymous',
            coins: entry.coins,
            rank: index + 1, // Assign ranks based on position
          }));

          // Sort by coins in descending order
          const sortedData = formattedData.sort((a, b) => b.coins - a.coins);

          // Limit to top 100
          const top100 = sortedData.slice(0, 100);
          setLeaderboard(top100); // Update leaderboard state with top 100

          // Find the current user in the entire leaderboard (not limited to 100)
          const currentUserData = formattedData.find(user => user.id === userId);
          if (currentUserData) {
            setCurrentUser(currentUserData); // Set current user's data
          }
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to fetch leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [userId]);

  if (loading) {
    return (
      <div className="loading-message">
        <div className="spinner"></div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="leaderboard-container">
      <h1 id="h12">Leaderboard</h1>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Coins</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr
              key={entry.id}
              className={currentUser && currentUser.id === entry.id ? 'highlight' : ''}
            >
              <td>
                {/* Displaying rank with top 3 icons */}
                {index === 0 && `🥇`}
                {index === 1 && `🥈`}
                {index === 2 && `🥉`}
                {index > 2 && `${index + 1}`} {/* No icon for ranks 4 and beyond */}
              </td>
              <td>{entry.name || 'Anonymous'}</td>
              <td>{entry.coins}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Display current user's rank and coin count below the table */}
      {currentUser && (
        <div className="current-user-info">
          <h2>Your Info</h2>
          <p>
            <strong>Name:</strong> {currentUser.name || 'Anonymous'}
            <br />
            <strong>Rank:</strong>{' '}
            {leaderboard.findIndex(user => user.id === currentUser.id) + 1}
            {/* Find user rank within the top 100 */}
            <br />
            <strong>Coins:</strong> {currentUser.coins}
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
