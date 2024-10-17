import React, { useState } from 'react';
import { User, LogIn, LogOut } from 'lucide-react';
import LoginForm from './components/LoginForm';
import ProfileForm from './components/ProfileForm';
import { UserProfile } from './types';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:3000/api/login', { email, password });
      setToken(response.data.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setToken(null);
  };

  const handleProfileSubmit = async (profile: UserProfile) => {
    try {
      const response = await axios.post('http://localhost:3000/api/submit-profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(profile);
      alert(response.data.message);
    } catch (error) {
      console.error('Profile submission failed:', error);
      alert('Failed to submit profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <User className="mr-2" /> Spotify Lead Gen
        </h1>
        {isLoggedIn ? (
          <>
            <ProfileForm onSubmit={handleProfileSubmit} />
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
            >
              <LogOut className="mr-2" /> Logout
            </button>
          </>
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}

export default App;