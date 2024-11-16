import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserData, farmCoins, claimCoins } from '../api/api';
import profilePic from '../assets/Images/Proofcoin-profile.jpg'; // Adjust the path as necessary
import '../styles/Home.css';
import Proof from '../components/PRoofing'; // Import the Gear animation
import Spinner from '../components/Spinner'; // Import the Spinner component

// Define the expected structure of user data, including the properties returned by the API
interface UserData {
  id: string;
  first_name: string;
  coins: number;
  coinsToClaim: number;
  lastFarmingTime?: string;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coins, setCoins] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [coinsToClaim, setCoinsToClaim] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  // Cooldown timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cooldown && cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prevCooldown) => {
          if (prevCooldown && prevCooldown > 1000) {
            return prevCooldown - 1000; // Decrease by 1 second (1000 ms)
          } else {
            clearInterval(interval);
            return null; // Stop the countdown when cooldown is 0
          }
        });
      }, 1000); // Update every second
    }

    return () => clearInterval(interval);
  }, [cooldown]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const response = await getUserData(user.id);
      setCoins(response.coins);
      setCoinsToClaim(response.coinsToClaim);

      const userData: UserData = {
        id: response.id,
        first_name: response.first_name,  // Adjusted to match the API response
        coins: response.coins,
        coinsToClaim: response.coinsToClaim,
        lastFarmingTime: response.lastFarmingTime,
      };
      setUserData(userData);

      if (response.lastFarmingTime) {
        const lastFarmingTime = new Date(response.lastFarmingTime);
        const cooldownDuration = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
        const timeElapsed = Date.now() - lastFarmingTime.getTime();
        const remainingCooldown = cooldownDuration - timeElapsed;

        setCooldown(remainingCooldown > 0 ? remainingCooldown : null);
      } else {
        setCooldown(null); // No cooldown if there's no last farming time
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage('An error occurred while fetching user data.');
    }
  };

  const handleFarm = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await farmCoins(user.id);
      setCoins(response.coins);
      setCoinsToClaim(response.coinsToClaim);
      fetchUserData(); // Refresh data after farming
    } catch (error) {
      console.error('Error farming coins:', error);
      setErrorMessage('An error occurred while farming coins.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await claimCoins(user.id);
      setCoins(response.totalCoins); // Update total coins after claiming
      setCoinsToClaim(0); // Reset coins to claim after claiming
      fetchUserData(); // Refresh data after claiming
    } catch (error) {
      console.error('Error claiming coins:', error);
      setErrorMessage('An error occurred while claiming coins.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="home-container">
      {/* Header Bar */}
      <header className="header-bar">
        <h2>Beta Phase</h2>
      </header>

      {/* User Profile Section */}
      <div className="user-profile">
        <img src={profilePic} alt="Profile" className="profile-pic" />
        <h2>{userData?.first_name}</h2>
      </div>

      {/* Coins Info */}
      <div className="coins-info">
        <p>Coins: {coins !== null ? coins : 'Loading...'}</p>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Farming / Claiming Section */}
      <div className="farming-section">
        {cooldown && cooldown > 0 ? (
          <>
            <Proof />
            <button disabled>
              <span className="disabled-timer-button">{formatTime(cooldown)}</span>
            </button>
          </>
        ) : coinsToClaim && coinsToClaim > 0 ? (
          <button onClick={handleClaim} disabled={isLoading} className="claim-button">
            {isLoading ? <Spinner /> : `Claim ${coinsToClaim} Coins`}
          </button>
        ) : (
          <button onClick={handleFarm} disabled={isLoading} className="farm-button">
            {isLoading ? <Spinner /> : '🔎Start Proofing🔍'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
