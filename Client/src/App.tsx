import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import Home from './pages/Home';
import Task from './pages/Task';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Referral from './pages/Referral';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import './styles/App.css';
import './styles/Footer.css';
import Loading from './components/Loading';

const manifestUrl = "https://full-app-two.vercel.app/manifest.json";

// Main App Component
const App: React.FC = () => {
  const [isPopupVisible, setPopupVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPopupVisible(false); 
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <Router>
          <>
            {isPopupVisible && <Loading />} 
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/task" element={<Task />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
            </Routes>
            <Footer /> 
          </>
        </Router>
      </TonConnectUIProvider>
    </AuthProvider>
  );
}

// Footer Component with navigation links
const Footer: React.FC = () => (
  <footer className="footer-nav">
    <nav>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/task">Tasks</Link></li>
        <li><Link to="/leaderboard">Leaderboard</Link></li>
        <li><Link to="/referral">Referral</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </nav>
  </footer>
);

export default App;
