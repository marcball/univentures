import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from './Images/logo.webp'
import Settings from './Settings';
import { FaCog } from 'react-icons/fa';

const RenderLoginBanner = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <div className='w-screen py-2 px-5 lg:px-10 bg-BG_LIGHTMODE dark:bg-BG_DARKMODE flex justify-between text-neutral-300'>
      <span className='text-lg font-semibold'>
        <Link to="/"><img src={logo} alt="Logo" style={{ width: '80px', height: 'auto' }} /></Link>
      </span>

      <ul className='flex items-center space-x-5'>
        {/* Adding the Sign In button */}
        <li>
          <Link
            to="/login"
            className="text-black bg-gray-200 hover:bg-gray-300 dark:bg-white dark:hover:bg-gray-200 py-2 px-4 rounded-full transition-colors block "
            style={{ fontWeight: 'bold' }}
          >
            Sign In
          </Link>
        </li>
        <li>
          <button onClick={toggleSettings} className="relative">
            <FaCog size={14} className="text-neutral-600 dark:text-neutral-300"/>
          </button>
        </li>
      </ul>
      <Settings isOpen={isSettingsOpen} onClose={toggleSettings} />
    </div>
  );
};

export default RenderLoginBanner;