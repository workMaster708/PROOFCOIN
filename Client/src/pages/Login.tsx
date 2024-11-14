import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/'); // Redirect to the home page if user is logged in
    }
  }, [user, navigate]);

  return (
    <div className="login-container">
      <h1>Login with Telegram</h1>
      <button onClick={login}>Login</button>
    </div>
  );
};

export default Login;
