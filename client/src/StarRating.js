import React, { useState } from 'react';

const StarRating = ({ locationId, currentRating, onRatingUpdate }) => {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(currentRating || 0);
    const [userId, setUserId] = useState(null);

    const handleRate = async (rating) => {
        setSelectedRating(rating);

        try {

            // Fetch the user info first
            const userInfoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/user-info`, {
                credentials: 'include'
            });
            const userInfo = await userInfoResponse.json();
            const user_id = userInfo.user_id;  // Get user ID directly from the response

            // Make sure the user is logged in
            if (!user_id) {
                alert("User is not logged in");
                return;
            }

            // Now make the rating request with the user_id
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rate`, {
                method: 'POST',
                credentials: 'include'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location_id: locationId,
                    user_id: user_id,  // Use the fetched user_id
                    rating,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                onRatingUpdate(data.average_rating); // Update parent component
            } else {
                alert(data.error || 'Failed to submit rating');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('An error occurred while submitting your rating.');
        }
    };

    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                key={star}
                className={`star ${star <= (hoveredRating || selectedRating) ? 'text-yellow-500' : 'text-gray-400'} text-3xl cursor-pointer`}  // Adjusted size to text-3xl
                onMouseEnter={() => setHoveredRating(star)} 
                onMouseLeave={() => setHoveredRating(0)} 
                onClick={() => handleRate(star)} 
                >
                ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;