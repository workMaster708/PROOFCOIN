import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '../api/api';
import profilePic from '../assets/Images/Proofcoin-profile.jpg';
import '../styles/Profile.css';

interface UserData {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  bio?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coins, setCoins] = useState<number | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const response = await getUserData(user.id);
      setCoins(response.coins);
      const userData: UserData = {
        id: response.id,
        first_name: response.name,
        last_name: response.last_name,
        username: response.username,
        bio: response.bio,
      };
      setUserData(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage('An error occurred while fetching user data.');
    }
  };

  return (
    <div className="Profile-container">
      <div className="profile">
        <img src={profilePic} className="profile-pic" alt="Profile" />
        <h2>{userData?.first_name} {userData?.last_name && ` ${userData.last_name}`}</h2>
        {userData?.username && <p className="username">@{userData.username}</p>}
        {userData?.bio && <p className="bio">{userData.bio}</p>}
      </div>

      <div className="coins-info">
        <p>Coins: {coins !== null ? coins : 'Loading...'}</p>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Profile;
