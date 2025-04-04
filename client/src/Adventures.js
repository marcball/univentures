import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AdventureModal from './AdventureWindow';
import StarRating from './components/StarRating/StarRating';

const Adventures = () => {
  const { schoolID } = useParams();
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdventure, setSelectedAdventure] = useState(null);

  useEffect(() => {
    const fetchAdventures = async () => {
        try {
          setLoading(true);
      
          const response = await fetch(`/api/nearby/${schoolID}/activities`);
          const text = await response.text(); 
          console.log("🧪 Raw response from Google API route:", text); 
      
          // Try parsing
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error("❌ Failed to parse response as JSON", parseError);
            setError("Received non-JSON response from server.");
            return;
          }
      
          setAdventures(data);
          setError(null);
        } catch (err) {
          console.error("❌ fetchAdventures error:", err);
          setError(err.message);
          setAdventures([]);
        } finally {
          setLoading(false);
        }
      };

    fetchAdventures();
  }, [schoolID]);

  const handleAdventureClick = (activity) => {
    setSelectedAdventure(activity);
  };

  const closeModal = () => {
    setSelectedAdventure(null);
  };

  if (loading) return <p>Loading Adventures...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {adventures.length > 0 ? (
        adventures.map((adventure) => (
          <div
            key={adventure.place_id || adventure.name}
            className="bg-white dark:bg-[#0b141c] border dark:border-[#0b141c] rounded-lg shadow-lg p-4 flex flex-col items-center cursor-pointer"
            onClick={() => handleAdventureClick(adventure)}
          >
            {adventure.photos && adventure.photos[0]?.photo_url ? (
              <img
                src={adventure.photos[0].photo_url}
                alt={adventure.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <img
                  src='adventure-default.webp'
                  alt="No Image Available"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              </div>
            )}
            <h3 className="font-semibold text-lg text-center text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">
              {adventure.name}
            </h3>
            
            {/*
            <p className="text-sm text-center text-gray-500 mt-2 text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">
              {adventure.vicinity}
            </p>
            */}
            {adventure.rating && (
              <div className="flex items-center mt-2 text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE">
                {/* Pass rating to StarRating */}
                <StarRating rating={adventure.rating} variant="star-icon" />
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No adventures found nearby.</p>
      )}

      {selectedAdventure && (
        <AdventureModal activity={selectedAdventure} onClose={closeModal} />
      )}
    </div>
  );
};

export default Adventures;
