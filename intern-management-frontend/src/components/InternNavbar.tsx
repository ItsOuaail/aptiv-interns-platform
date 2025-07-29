import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const InternNavbar = ({ setActiveSection, notifications = [] }) => {
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <nav className="bg-black text-white shadow-lg relative">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="ml-2 text-xl font-bold tracking-wider">APTIV</span>
                <div className="w-2 h-2 bg-orange-500 rounded-full ml-2"></div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => setActiveSection('messages')}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium tracking-wide"
            >
              MESSAGES
            </button>
            <button
              onClick={() => setActiveSection('sendMessage')}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium tracking-wide"
            >
              SEND MESSAGE
            </button>
            <button
              onClick={() => setActiveSection(null)}
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium tracking-wide"
            >
              DASHBOARD
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="p-2 text-gray-300 hover:text-white transition-colors duration-200 relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 text-gray-200">
                  <button
                    onClick={() => setActiveSection(null)} // Changed from 'profile' to null
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                  >
                    View Profile
                  </button>
                  <hr className="border-gray-600 my-1" />
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-transparent hover:bg-gray-800 transition-all duration-200 border border-gray-600 hover:border-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              <span>Logout</span>
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button className="text-gray-300 hover:text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-gray-900 border-t border-gray-800">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <button
            onClick={() => setActiveSection('messages')}
            className="block px-3 py-2 text-gray-300 hover:text-white font-medium tracking-wide"
          >
            MESSAGES
          </button>
          <button
            onClick={() => setActiveSection('sendMessage')}
            className="block px-3 py-2 text-gray-300 hover:text-white font-medium tracking-wide"
          >
            SEND MESSAGE
          </button>
          <button
            onClick={() => setActiveSection(null)}
            className="block px-3 py-2 text-gray-300 hover:text-white font-medium tracking-wide"
          >
            DASHBOARD
          </button>
        </div>
      </div>
    </nav>
  );
};

export default InternNavbar;