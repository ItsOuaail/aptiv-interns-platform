"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      const { token, user } = response.data; // Extract user
      login(token, user); // Pass user to login
      console.log('Login successful:', response.data);
      if (user.role === 'HR') {
        router.push('/dashboard');
      } else if (user.role === 'INTERN') {
        router.push('/internSide');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10"></div>
        <div className="relative">
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-xl font-bold tracking-wider text-white">APTIV</span>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Welcome Back
            <span className="text-orange-500 ml-2">!</span>
          </h1>
          <p className="text-gray-300 mb-8 text-center">Please sign in to your account</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
            >
              Login
            </button>
          </form>
          {error && <p className="mt-4 text-red-500 text-center animate-pulse">{error}</p>}
          <p className="mt-4 text-center text-gray-400 text-sm">
            Don’t have an account?{' '}
            <a href="/register" className="text-orange-500 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;