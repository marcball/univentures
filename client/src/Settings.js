import React, { useRef, useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/solid';


const Settings = ({ isOpen, onClose }) => {
    const settingsRef = useRef(null);
    const [darkMode, setDarkMode] = useState(false);

    // Close the settings window when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                onClose(); // Close the window
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);


    {/* DARK MODE */ }
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setDarkMode(true);
        }
    }, []);

    const toggleDarkMode = () => {
        setDarkMode((prev) => {
            const newMode = !prev;
            document.documentElement.classList.toggle('dark', newMode);
            localStorage.setItem('theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

    return (
        <div
            ref={settingsRef}
            className={`fixed top-24 right-0 w-48 bg-TEXT_LIGHTMODE dark:bg-TEXT_DARKMODE rounded-l-lg shadow-lg transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
                } transition-transform duration-300 ease-in-out z-50`}
        >
            <div className="p-4">
                {/* Light/Dark Mode Toggle */}
                <div className="flex items-center justify-center">
                    <div
                        className={`relative w-16 h-8 bg-gray-700 rounded-full cursor-pointer flex items-center p-1`}
                        onClick={toggleDarkMode}
                    >
                        <div
                            className={`absolute w-6 h-6 bg-gray-900 rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-8' : 'translate-x-0'}`}
                        />

                        {/* Sun Icon */}
                        <SunIcon
                            className={`h-5 w-5 text-yellow-500 absolute left-1 top-1/2 transform -translate-y-1/2 transition-opacity duration-100 ${darkMode ? 'opacity-0' : 'opacity-100'}`}
                        />

                        {/* Moon Icon */}
                        <MoonIcon
                            className={`h-5 w-5 text-yellow-500 absolute right-1 top-1/2 transform -translate-y-1/2 transition-opacity duration-100 ${darkMode ? 'opacity-100' : 'opacity-0'}`}
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Settings;
