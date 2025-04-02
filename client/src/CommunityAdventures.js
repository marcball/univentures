import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RefreshIcon, StarIcon } from '@heroicons/react/solid';
import ActivityModal from './AdventureWindow';
import StarRating from './components/StarRating/StarRating';

const CommunityAdventures = ({ schoolID, filters }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const queryString = new URLSearchParams(filters).toString();
        const url = `/api/school/${schoolID}/locations${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }

        const data = await response.json();
        setLocations(data);

      } catch (error) {
        console.error('Error fetching locations:', error);
      }
      finally {
        setLoading(false);
      }
    };
    fetchLocations(); // Call the function when the component mounts
  }, [schoolID, filters]);

  if (loading) return <p>Loading Adventures...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const handleActivityClick = (location) => {
    setSelectedActivity(location);
  };

  const closeModal = () => {
    setSelectedActivity(null);

  };



  const handleSurprise = async () => {
    try {
      const response = await fetch(`/api/random-location?school_id=${encodeURIComponent(schoolID)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch a random location");
      }
      const data = await response.json();

      // Update the surprise location state
      setSelectedActivity(data);
    } catch (error) {
      console.error("Error fetching random location:", error);
    }
  };


  if (loading) return <p>Loading Adventures...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-end items-center mb-4 gap-4">
        {/* Surprise Me Button */}
        <button
          onClick={handleSurprise} // Call handleSurprise when the button is clicked
          className="flex items-center gap-2 bg-yellow-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-yellow-400 transform hover:scale-110 duration-300 hover:shadow-m hover:shadow-yellow-500 transition-all "
        >
          <StarIcon className="h-6 w-6" />
          Surprise Me
        </button>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {locations.length > 0 ? (
          
          locations.map((location) => (
            <div
              key={location.id}
              className="bg-white dark:bg-[#0b141c] border dark:border-[#0b141c] rounded-lg shadow-lg p-4 flex flex-col items-center cursor-pointer" // Add cursor-pointer for clickability
              onClick={() => handleActivityClick(location)}
            >

              <img
                src={location.image_url ? location.image_url : "/adventure-default.webp"}
                alt={"No Image Available"}
                className="w-full h-32 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.src = '/adventure-default.webp';  // Set the fallback image on error
                }}
              />
              <h3 className="font-semibold text-lg text-center text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">{location.name}</h3>
              {/*    <p className="text-sm text-center text-gray-500 mt-2 text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">{location.description}</p>       */}
              {/*     <p className="text-sm text-center text-gray-500 mt-2 text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">{location.address}</p>       */}

              {location.ratings && (
                <div className="flex justify-center items-center mt-2 text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">
                  <StarRating rating={location.ratings} variant="star-icon" />
                </div>
              )}

            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No community adventures found nearby.</p>
        )}

        {/* Render the activity modal if an activity is selected */}
        {selectedActivity && (
          <ActivityModal activity={selectedActivity} onClose={closeModal}/>
        )}
      </div>
    </div>
  );
}

export default CommunityAdventures;
