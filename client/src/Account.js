import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Banner from './Banner';


function Account() {
  const [loading, setLoading] = useState(true);           // Don't load until cookie checked
  const [isLoggedIn, setIsLoggedIn] = useState(false);    // Logged in boolean
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');                 // Error to display if no account
  const [firstName, setFirstName] = useState(userInfo?.firstName || "");
  const [lastName, setLastName] = useState(userInfo?.lastName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [schoolPlaceholder, setSchoolPlaceholder] = useState('');
  const [schoolImageURL, setSchoolImageURL] = useState('');
  const [reviews, setReviews] = useState([]);             // State for reviews
  const [reviewsLoading, setReviewsLoading] = useState(true); // State to handle review loading
  const [hasSchool, setHasSchool] = useState(false);
  const [deletePasswordInput, setDeletePasswordInput] = useState("");
  const navigate = useNavigate();


  // GET LOGIN COOKIE
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loginResponse = await axios.get('/api/auth/check-login');

        if (loginResponse.data.isLoggedIn) {
          setIsLoggedIn(true);

          // Fetch account information
          const accountResponse = await axios.get('/api/account');
          const accountData = accountResponse.data;
          setUserInfo(accountData);
          setFirstName(accountData.firstName);
          setLastName(accountData.lastName);

          // Fetch user reviews
          fetchReviews(accountData.id);

        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setError(error.response?.data?.message || 'Something went wrong getting account information');
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Fetch reviews based on user_id
  const fetchReviews = async (userId) => {
    try {
      const response = await axios.get(`/api/reviews/user?user_id=${userId}`);
      setReviews(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  // Update schoolPlaceholder after userInfo is set
  useEffect(() => {
    if (userInfo) {
      setSchoolPlaceholder(
        userInfo.schoolName || "School with your email is not in the system. Please contact us to add it!"
      );
      if (userInfo.schoolId) {
        setHasSchool(true);
      }
    }
  }, [userInfo]);


  //LOAD SCHOOL PIC
  useEffect(() => {
    if (userInfo?.email) {
      const domain = userInfo.email.split('@')[1];
      const logoURL = `https://logo.clearbit.com/${domain}`;
      setSchoolImageURL(logoURL);
    }
  }, [userInfo]);

  // DONT MOVE DOWN TO LOGIN OR ACCOUNT PAGE YET - need to check if logged in already
  if (loading) {
    return <div className='bg-BG_LIGHTMODE dark:bg-BG_DARKMODE w-screen min-h-screen'><div><Banner /></div></div>;  // Could just put navbar here
  }

  // CHECK LOGIN COOKIE
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  //LOGOUT BUTTON
  const handleLogout = async () => {
    try {
      const response = await axios.post('/api/auth/logout');
      if (response.status === 200) {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  //FIRST NAME LAST NAME EDIT
  const handleSave = async () => {
    if (firstName === userInfo.firstName && lastName === userInfo.lastName) {
      setIsEditing(false);
      return;
    }

    try {
      const response = await axios.post('/api/account', {
        firstName, lastName
      });

      if (response.status === 200) {
        userInfo.firstName = firstName;   //set original database vars to new database vars
        userInfo.lastName = lastName;     //so if handleSave() with no change it doesnt make request

        //localStorage.setItem('userInfo', JSON.stringify(userInfo));         //IMPORTANT: update local storage names for changes
        setMessage("Your account has been updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      setError("Faied to update account: " + error.response?.data.message);
    }
  };

  //NEW EMAIL ADDRESS BUTTON
  const handleMySchool = () => {
    if (userInfo && userInfo.schoolId) {
      navigate(`/school/${userInfo.schoolId}`);
    }
  };

  //DELETE REVIEW
  const handleDeleteReview = async (reviewId) => {
    try {
      
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      
      if (response.ok) {
        setReviews((prevReviews) => prevReviews.filter((review) => review.review_id !== reviewId));
      } 
      else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  //DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/auth/delete_account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email, // Assuming this comes from your user state
          password: deletePasswordInput, // User's entered password
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message); // Success message
        // Optionally, redirect to the homepage or login page
        window.location.href = '/';
      } else {
        alert(data.message); // Show error message
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting your account.');
    }

  };


  // LOGGED IN - ACCOUNT PAGE
  return (
    <div className="bg-BG_LIGHTMODE dark:bg-BG_DARKMODE h-screen text-white overflow-x-hidden">
      {/* Navbar */}
      <Banner />

      {/* Account Info */}
      <div className="flex flex-col items-center justify-center px-4">
        <div className="relative dark:bg-[#13222E] bg-neutral-100 shadow-lg rounded-lg p-8 w-full max-w-full mx-auto">
          {/* Your Account */}
          {userInfo ? (
            <div className="">
              <div className="flex flex-col items-center">
                <h1 className="text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE text-4xl font-bold mb-8 cursor-default">Your Account</h1>
              </div>

              {/* Main Box */}
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center max-w-lg">

                  {/* User's School */}
                  <div className="flex items-center justify-center max-w-lg w-full mt-6 mb-4 cursor-default">
                    {/* School Icon */}
                    {schoolImageURL && (
                      <img
                        src={schoolImageURL}
                        alt="School Logo"
                        className="w-8 h-8 mr-2 mb-1"
                        onError={(e) => e.target.style.display = 'none'} // Hide if image fails to load
                      />
                    )}

                    {/* School Placeholder Text */}
                    <p className="text-sm font-medium text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">{schoolPlaceholder}</p>

                    {hasSchool && (
                      <button
                        className="ml-4 rounded bg-teal-700 hover:bg-teal-600 px-4 py-2 text-white"
                        onClick={handleMySchool}
                      >
                        Go to School Page
                      </button>
                    )
                    }



                  </div>

                  {/*FirstName LastName Edit */}
                  <div className="flex space-x-4 mt-6 mb-4 w-full">
                    <div className="w-1/2">
                      <input
                        type="text"
                        value={firstName || ""}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-700/20 border border-zinc-700/50 text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE rounded focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        disabled={!isEditing}
                        placeholder='First Name'
                      />
                    </div>

                    <div className="w-1/2">
                      <input
                        type="text"
                        value={lastName || ""}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-700/20 border border-zinc-700/50 text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE rounded focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        disabled={!isEditing}
                        placeholder='Last Name'
                      />
                    </div>

                    <div className="flex space-x-2">
                      {isEditing ? (
                        <button
                          onClick={handleSave}
                          className="bg-teal-500 text-white font-bold py-2 px-4 rounded"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsEditing(true)
                            setMessage();
                          }}
                          className="bg-teal-700 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {/*Email */}
                  <div className="flex space-x-4 mb-4 w-full">
                    <div className="w-full">
                      <input
                        type="text"
                        value={userInfo.email || ""}
                        className="w-full px-3 py-2 bg-zinc-700/20 border border-zinc-700/50 text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE rounded focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        disabled={true}
                        placeholder='Email'
                      />
                    </div>
                  </div>

                  {/*Logout */}
                  <button
                    className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p>Loading account info...</p>
          )}
          {message && <p className="flex flex-col items-center mt-4 text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">{message}</p>}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>



      {/* Reviews Section */}
      <div className="mt-12 flex flex-col items-center justify-center px-4">
        <div className="dark:bg-[#13222E] bg-neutral-100 shadow-lg rounded-lg w-full p-8 mx-auto">
          <div>
            <h1 className="flex flex-col items-center text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE text-4xl font-bold mb-8 cursor-default">
              Your Reviews
            </h1>
            {reviewsLoading ? (
              <p className="flex flex-col items-center">Loading reviews...</p>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.review_id}
                      className="text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE border-b border-gray-600 pb-4 relative w-full"
                    >
                      <div className="flex items-start justify-between w-full">

                        {/* Review Content */}
                        <div className="ml-2 flex-1 text-center">
                          <div className="font-semibold text-lg">
                            <p className="font-bold">
                              {review.location_name} <span className="font-normal">at</span>{' '}
                              <a
                                href={`/school/${review.school_id}`}
                                className="text-teal-500 hover:underline"
                              >
                                {review.school_name}
                              </a>
                            </p>
                          </div>
                          <div className="text-sm mt-2 italic text-center">
                            <p>"{review.review_text}"</p>
                          </div>
                        </div>
                        {/* Delete Button */}
                        <button
                          className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                          onClick={() => handleDeleteReview(review.review_id)} // Replace with your delete function later
                        >
                          <span className="text-xs font-semibold">X</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">
                    You have no reviews! Go explore and come back!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>






      {/*Delete account */}
      <div className="mt-12 flex flex-col items-center justify-center mb-12 px-4">
        <div className="dark:bg-[#13222E] bg-neutral-100 shadow-lg rounded-lg w-full p-8 mx-auto">
          <div>
            <h1 className="flex flex-col items-center text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE text-4xl font-bold mb-8 cursor-default">Leave UniVentures</h1>
            {/*<p className="text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">We will be sad to see you go, but you have free will</p> */}
            <div className="flex items-center space-x-4 justify-center">
              <input
                type="password"
                value={deletePasswordInput}
                onChange={(e) => setDeletePasswordInput(e.target.value)}
                placeholder="Enter your password to delete"
                className="px-3 py-2 bg-zinc-700/20 border border-zinc-700/50 text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE rounded focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 w-64"
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deletePasswordInput.length < 8}
                className={`px-4 py-2 font-bold rounded ${deletePasswordInput.length >= 8
                  ? "bg-red-700 hover:bg-red-600 text-white"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
                  }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}

export default Account;
