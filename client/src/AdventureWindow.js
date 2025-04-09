import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';

const ActivityModal = ({ activity, onClose }) => {

    const [isPublic, setIsPublic] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState([]);
    const [userId, setUserId] = useState(null); // State to store userId
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track if the user is logged in
    const [currentRating, setCurrentRating] = useState(activity.ratings);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
      }, []);

    const handleRatingUpdate = (newAverage) => {
        setCurrentRating(newAverage);
    };

    useEffect(() => {
        if (activity) {
            fetchReviews();
        }

        checkLoginStatus();
    }, [activity]); 

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/reviews?school_id=${activity.school_id}&location_id=${activity.id}`);
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const checkLoginStatus = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/check-login`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.isLoggedIn) {
                setIsLoggedIn(true);
                const userInfoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/user-info`, {
                credentials: 'include'
                });
                const userInfo = await userInfoResponse.json();
                setUserId(userInfo.user_id); 
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    };

    useEffect(() => {
        // set vars if a public adventure
        if (activity.photos && activity.photos[0]?.photo_url) {
            setIsPublic(true);
            activity.image_url = activity.photos[0]?.photo_url;
            activity.address = activity.vicinity;
        }
    }, [activity]);  

    const handleReviewChange = (e) => {
        setReviewText(e.target.value);
    };

    const handleSubmitReview = async () => {
        if (!reviewText.trim()) return;

        if (!isLoggedIn) {
            alert('User is not logged in');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews`, {
                method: 'POST',
                credentials: 'include', // cookie
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    school_id: activity.school_id,
                    location_id: activity.id,
                    user_id: userId,  // Use the userId from session
                    review: reviewText,
                }),
            });

            if (response.ok) {
                setReviewText('');
                fetchReviews();
            } else {
                alert('Failed to submit review.');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('An error occurred.');
        }
    };

    if (!activity) {
        return null; // Return null if no activity is passed, just for safety
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2 p-6 shadow-lg">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">{activity.name}</h2>
                    <button
                        className="text-gray-500 dark:text-gray-200 hover:text-red-500 transition-all"
                        onClick={onClose}
                    >
                        ✖
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex flex-col space-y-4 max-h-[80vh] overflow-y-auto px-5">
                    <img
                        src={activity.image_url ? activity.image_url : "/adventure-default.webp"}
                        alt={activity.name}
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                            e.target.src = '/adventure-default.webp';  // Set the fallback image on error
                        }}
                    />
                    {/* Render description only for community adventures */}
                    {!isPublic && (
                        <div>
                            <h3 className="text-xl text-gray-700 dark:text-gray-300 font-bold">Description</h3>
                            <p className="text-gray-600 dark:text-gray-400">{activity.description}</p>
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl text-gray-700 dark:text-gray-300 font-bold">Location</h3>
                        <p className="text-gray-600 dark:text-gray-400">{activity.address}</p>
                    </div>

                    {/* Render reviews only for community adventures */}
                    
                    {activity.ratings && !isPublic && (
                        <div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Leave a Rating</h3>
                        <StarRating
                            locationId={activity.id}
                            currentRating={currentRating}
                            onRatingUpdate={handleRatingUpdate}
                        />
                    </div>
                    )}
                    
                    {!isPublic && (
                    <div>
                        <h3 className="text-xl text-gray-700 dark:text-gray-300 font-bold">Write a Review</h3>

                        <div className="mt-4">
                            {/* Review Textarea */}
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                rows="4"
                                placeholder="Write your review here..."
                                value={reviewText}
                                onChange={handleReviewChange}
                            />
                        </div>
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleSubmitReview}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                    )}

                    
                    {/* Display Reviews only for community */}
                    {!isPublic && (
                    <div>
                        <h3 className=" mb-5 text-xl text-gray-700 dark:text-gray-300 font-bold">View Reviews</h3>
                        {reviews.length > 0 ? (
                            <ul className="space-y-2">
                                {reviews.map((review) => (
                                    <li key={review.review_id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-600">
                                        <p className="text-gray-700 dark:text-gray-300">{review.review_text}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Reviewed on: {new Date(review.created_at).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
                        )}
                    </div>
                    )}

                    

                </div>


            </div>
        </div>
    );
};


export default ActivityModal;