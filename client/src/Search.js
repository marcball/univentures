import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [schools, setSchools] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [schoolId, setSchoolId] = useState(null);
    const [hasSchool, setHasSchool] = useState(false);
    const [schoolName, setSchoolName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('/api/auth/check-login');
                if (response.data.isLoggedIn) {
                    setIsLoggedIn(true);

                    const response = await axios.get('/api/account', { withCredentials: true });
                    const userInfo = response.data;
                    if (userInfo && userInfo.schoolId) {
                        setSchoolId(userInfo.schoolId);
                        setHasSchool(true);
                        if (userInfo.schoolName) {
                            setSchoolName(userInfo.schoolName);
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error checking login status:', error);
                setIsLoggedIn(false);
            }
        }
        checkLoginStatus();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/schools?query=${query}`);
            setSchools(response.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const handleSchoolClick = (schoolID) => {
        navigate(`/school/${schoolID}`);
    };

    const handleMySchoolClick = async () => {
        try {
            const response = await axios.get('/api/account', { withCredentials: true });
            const userInfo = response.data;
            if (userInfo && userInfo.schoolId) {
                navigate(`/school/${userInfo.schoolId}`);
            }
        } catch (error) {
            console.error('Error fetching userID', error);
        }
    };


    return (
        <div className='flex flex-col items-center justify-start bg-BG_LIGHTMODE dark:bg-BG_DARKMODE mt-8'>
            <div>
                <div className='flex w-96 rounded-full bg-MAIN_BLUE dark:bg-white'>
                    <form onSubmit={handleSearch} className='flex w-full'>
                        <input
                            type='search'
                            name='search'
                            id='search'
                            placeholder='Enter your school'
                            onChange={(e) => setQuery(e.target.value)}  // Update query state
                            className='w-full border-none bg-transparent px-6 py-1 text-white dark:text-gray-900 outline-none focus:outline-none'
                        />
                        <button className='m-2 rounded-full bg-teal-700 px-5 py-3 text-white whitespace-nowrap' type='submit'>
                            Search
                        </button>
                    </form>
                </div>
                {/* Display search results */}
                <div className='mt-4 w-96'>
                    <ul className='bg-white rounded shadow-lg max-h-60 overflow-y-auto'>
                        {query.length > 0 && schools.length === 0 ? (  // Check if query is not empty and schools is empty
                            <li className='p-2 text-gray-500'>No results found</li>
                        ) : null}
                        {schools.length > 0 && schools.map((school) => (
                            <li
                                key={school.id}
                                onClick={() => handleSchoolClick(school.id)}  // Navigate on click
                                className='cursor-pointer hover:bg-gray-200 p-2'
                            >
                                {school.school_name}
                            </li>
                        ))}
                    </ul>

                </div>

                {/* User's School Button */}
                {hasSchool && (<div className="flex justify-center mt-4">
                    <button
                        className="rounded bg-teal-700 hover:bg-teal-600 px-4 py-2 text-white"
                        onClick={handleMySchoolClick}
                    >
                        {schoolName}
                    </button>
                </div>
                )}

            </div>
        </div>
    );

};


export default SearchBar;