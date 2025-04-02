import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './Images/logo.webp'
import Settings from './Settings';
import { FaCog } from 'react-icons/fa';

const RenderBanner = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  //close hamburger on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  return (
    <div className=' bg-BG_LIGHTMODE dark:bg-BG_DARKMODE w-screen py-2 px-5 lg:px-10 flex justify-between text-neutral-300'>
      <span className='text-lg font-semibold'>
        <Link to="/"><img src={logo} alt="Logo" style={{ width: '80px', height: 'auto' }} /></Link>
      </span>

      <ul className='hidden md:flex items-center space-x-5 font-bold text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE'>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/account">Account</Link></li>
        <li>
          <button onClick={toggleSettings} className="relative">
            <FaCog size={14} className="text-neutral-600 dark:text-neutral-300" />
          </button>
        </li>
      </ul>

      <Settings isOpen={isSettingsOpen} onClose={toggleSettings} />

      <div className="flex group md:hidden items-center space-x-4">
        {/* Settings */}
        <button onClick={toggleSettings} className="relative">
          <FaCog size={18} className="text-neutral-600 dark:text-neutral-300" />
        </button>
        {/* Hamburger */}
        <button className="space-y-1 group md:hidden" onClick={toggleMenu}>
          <div className="w-6 h-1 bg-[#101c26] dark:bg-white transition-transform duration-300"></div>
          <div className="w-6 h-1 bg-[#101c26] dark:bg-white transition-transform duration-300"></div>
          <div className="w-6 h-1 bg-[#101c26] dark:bg-white transition-transform duration-300"></div>
        </button>
      </div>

      {/* Dropdown */}
      <ul
        ref={menuRef}
        className={`z-50 bg-white dark:bg-BG_DARKMODE text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE font-bold shadow-md dark:shadow-[#0a0a0a] rounded-lg w-60 absolute right-2 top-16 transition-transform duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
          }`}
      >
        <li className="flex justify-center w-full py-4 hover:bg-gray-200 dark:hover:bg-gray-800">
          <Link to="/about" className="w-full h-full flex justify-center items-center">
            About
          </Link>
        </li>
        <li className="flex justify-center w-full py-4 hover:bg-gray-200 dark:hover:bg-gray-800">
          <Link to="/contact" className="w-full h-full flex justify-center items-center">
            Contact
          </Link>
        </li>
        <li className="flex justify-center w-full py-4 hover:bg-gray-200 dark:hover:bg-gray-800">
          <Link to="/account" className="w-full h-full flex justify-center items-center">
            Account
          </Link>
        </li>
      </ul>

    </div>
  );
};

export default RenderBanner;