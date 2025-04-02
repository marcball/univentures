import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/input.css';
import Banner from './Banner';
import SearchBar from './Search';
import NotSignedInBanner from './NotSignedInBanner';
import Login from './Login';
import Signup from './Signup';
import EmailSignUp from './SignUpEmail';
import axios from 'axios';


function MainPage() {
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    useEffect(() => {
        const checkLogin = async () => {
            try {
                const loginResponse = await axios.get('/api/auth/check-login');
                if (loginResponse.data.isLoggedIn) {
                    setIsLoggedIn(true);
                }
            }
            catch (error) {
                console.error("Failed to check login status: ", error);
            }
            finally {
                setLoading(false);
            }
        }
        checkLogin();
    }, []);


    if (loading) {
        return (
        <div
            className="bg-BG_LIGHTMODE dark:bg-BG_DARKMODE overflow-auto flex flex-col items-center min-h-screen">
        </div>
        )
    }
    else {
        return (
            // Main container with full height and width
            <div className="bg-BG_LIGHTMODE dark:bg-BG_DARKMODE overflow-auto flex flex-col items-center min-h-screen">

                {/* Conditionally render the banner based on authentication status */}
                {isLoggedIn ? <Banner /> : <NotSignedInBanner />}

                {/* Centered content */}
                <div className='flex flex-col items-center bg-BG_LIGHTMODE dark:bg-BG_DARKMODE'>

                    {/* Title */}
                    <div className='text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE font-serif text-7xl  pt-32'>
                        UniVentures
                    </div>

                    {/* Tagline very close to the title */}
                    <div className='text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE font-serif text-xl'>
                        Find Your Next Campus Adventure
                    </div>

                    {/* Email sign-up form, very close to the tagline */}
                    <div className="mt-">
                        <SearchBar />

                    </div>
                </div>
            </div>
        );
    }
}

export default MainPage;


{/* My thoughts with EmailSignUp is I want them to go to another "create an account" page
        where they can select school and all the other info we need
        (This is also how netflix does it you want it to be as simple as possible for the first move'
        for user retention) - Marc*/}