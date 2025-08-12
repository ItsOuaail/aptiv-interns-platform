import React, { useState } from 'react'; 
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import MessageDetailModal from '../common/MessageDetailModal';

const Navbar = ({ notifications = [] }) => {
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const handleNotificationClick = (messageId: number) => {
    setSelectedMessageId(messageId);
    setShowMessageModal(true);
    setShowNotifications(false);
  };

  const handleMessageDeleted = (messageId: number) => {
    // You might want to refresh notifications here or update the parent component
    console.log('Message deleted:', messageId);
  };

  return (
    <>
      <nav className="bg-black text-white shadow-lg relative">
        {/* Background overlay for subtle gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between h-16 items-center">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="ml-2 text-xl font-bold tracking-wider">APTIV</span>
                  <div className="w-2 h-2 bg-orange-500 rounded-full ml-2"></div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium tracking-wide"
              >
                HOME
              </a>
              <Link
                href="/dashboard?view=all#table"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium tracking-wide"
              >
                ARCHIVE
              </Link>
              <Link
                href="/messages"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium tracking-wide"
              >
                MESSAGES
              </Link>
              
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium tracking-wide"
              >
                ABOUT
              </a>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notification Icon and Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-300 hover:text-white transition-colors duration-200 relative"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-md shadow-lg py-1 z-10 text-gray-200">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                          onClick={() => handleNotificationClick(notif.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">
                                {notif.subject}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                From: {notif.senderName}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notif.sentAt).toLocaleString()}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm">
                        No internship notifications
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-transparent hover:bg-gray-800 transition-all duration-200 border border-gray-600 hover:border-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button className="text-gray-300 hover:text-white p-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="/dashboard"
              className="block px-3 py-2 text-gray-300 hover:text-white font-medium tracking-wide"
            >
              HOME
            </a>
            <Link
              href="/dashboard?view=all#table"
              className="block px-3 py-2 text-gray-300 hover:text-white font-medium tracking-wide"
            >
              ARCHIVE
            </Link>
            <Link
              href="/messages"
              className="block px-3 py-2 text-gray-300 hover:text-white font-medium tracking-wide"
            >
              MESSAGES
            </Link>
            
            <a
              href="#"
              className="block px-3 py-2 text-gray-300 hover:text-white font-medium tracking-wide"
            >
              ABOUT
            </a>
          </div>
        </div>
      </nav>

      {/* Message Detail Modal */}
      <MessageDetailModal
        messageId={selectedMessageId}
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setSelectedMessageId(null);
        }}
        onDelete={handleMessageDeleted}
      />
    </>
  );
};

export default Navbar;