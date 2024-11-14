import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define types for user data and AuthContext value
interface User {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  telegramId: string;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
}

// Create the AuthContext with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component that manages the authentication state
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // User state initialized to null

  // Helper function to fetch Telegram user data
  const fetchTelegramUser = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      const telegramUser = tg.initDataUnsafe?.user || null;
      console.log('Fetched Telegram User Data:', telegramUser);

      if (telegramUser) {
        setUser({
          id: telegramUser.id, // Use the Telegram ID as the user ID
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
          telegramId: telegramUser.id,
        });
      } else {
        console.error('No user data available from Telegram.');
      }
    } else {
      console.error('Telegram WebApp API not available.');
      // For local testing without Telegram, uncomment the following lines:
      // setUser({
      //   id: 'test-id',
      //   first_name: 'Test',
      //   last_name: 'User',
      //   username: 'testuser',
      //   telegramId: 'test-id'
      // });
    }
  };

  // Initial effect to fetch user data when the component mounts
  useEffect(() => {
    fetchTelegramUser(); // Check for Telegram user data on mount
  }, []);

  // Function to log in the user
  const login = () => {
    fetchTelegramUser(); // Re-fetch data when login is called
  };

  // Function to log out the user
  const logout = () => {
    setUser(null); // Set user state to null
  };

  // Provide the user and auth functions to the context
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider'); // Error handling if used outside provider
  }
  return context; // Return the context value
};
