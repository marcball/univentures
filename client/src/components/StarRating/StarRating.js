import React from "react";
import './StarRating.css';
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating, variant = "star-filter" }) => {
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
    const fullStars = Math.floor(roundedRating); // Number of full stars
    const hasHalfStar = roundedRating % 1 !== 0; // Check for half star
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Remaining stars

    return (
        <div className={`star-rating ${variant}`}>
            {/* Numeric Rating (Placed Before Stars) */}
            {variant === "star-icon" && (
                <span className="rating-text">{rating.toFixed(1)}</span>
            )}
            {/* Render Full Stars */}
            {Array(fullStars)
                .fill()
                .map((_, index) => (
                    <FaStar key={`full-${index}`} className={variant} />
                ))}
            {/* Render Half Star */}
            {hasHalfStar && <FaStarHalfAlt className={variant} />}
            {/* Render Empty Stars */}
            {Array(emptyStars)
                .fill()
                .map((_, index) => (
                    <FaRegStar key={`empty-${index}`} className={variant} />
                ))}
        </div>
    );
};

export default StarRating;

