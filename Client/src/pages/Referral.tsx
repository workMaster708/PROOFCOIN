import { useState, useEffect } from 'react';
import { getUserReferrals, getReferralLink } from '../api/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Referral.css';

interface ReferredUser {
  _id: string;
  name: string;
  coins: number;
}

const Referral: React.FC = () => {
  const [referralLink, setReferralLink] = useState<string>('');
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [, setReferrals] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [copyMessageVisible, setCopyMessageVisible] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user || !user.id) {
        console.error('User ID is not available.');
        setLoading(false);
        return;
      }

      try {
        const referralData = await getReferralLink(user.id);
        console.log('Referral Link Response:', referralData);

        if (referralData && referralData.referralLink) {
          setReferralLink(referralData.referralLink);
        } else {
          console.error('Referral link is missing in the response:', referralData);
          setReferralLink('Referral link is missing.');
        }

        const userReferralData = await getUserReferrals(user.id);
        console.log('User Referral Data Response:', userReferralData);

        if (userReferralData && userReferralData.referredUsers) {
          setReferredUsers(userReferralData.referredUsers || []);
          setReferrals(userReferralData.totalReferrals || 0);
        } else {
          console.error('Referred users data is missing:', userReferralData);
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
        setReferralLink('Error fetching referral link.');
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user]);

  const copyToClipboard = () => {
    if (!referralLink) {
      console.error('Referral link is not set.');
      return;
    }

    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopyMessageVisible(true);
        setTimeout(() => setCopyMessageVisible(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const inviteFriend = () => {
    if (!referralLink) {
      console.error('Referral link is not set.');
      return;
    }

    const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}`;
    window.open(telegramLink, '_blank');
  };

  if (loading) {
    return (
      <div className="loading-message">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="referral-page">
      <h2 className="referral-header">Invite Friends</h2>
      <p className="referral-link">
        {referralLink || 'Loading referral link...'}
      </p>
      
      <div className="button-container">
        <button 
          className="forward-button" 
          onClick={inviteFriend} 
          disabled={!referralLink}
        >
          Invite a Friend
        </button>
        <button 
          className="copy-button" 
          onClick={copyToClipboard} 
          disabled={!referralLink}
          aria-label="Copy referral link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17 1H7C5.34 1 4 2.34 4 4v16c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm1 18c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v15zM9 10h6v2H9zm0 4h6v2H9z" />
          </svg>
        </button>
      </div>

      <p className="total-referrals">📤Referrals📤</p>

      <ul className="referred-users-list">
        {referredUsers.map(user => (
          <li key={user._id} className="referred-user-item">
            {user.name} - {user.coins} coins
          </li>
        ))}
      </ul>

      {copyMessageVisible && (
        <div className="copy-message">
          Referral link copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default Referral;
