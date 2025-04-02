import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { StarIcon, RefreshIcon } from "@heroicons/react/solid";

const Restaurant = () => {
  const { schoolID } = useParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surpriseLocation, setSurpriseLocation] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/nearby/${schoolID}/restaurant`);
        if (!response.ok) throw new Error("Failed to fetch locations");
        const data = await response.json();
        setLocations(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [schoolID]);

  // Function to select a random location
  const handleSurpriseClick = () => {
    if (locations.length > 0) {
      const randomIndex = Math.floor(Math.random() * locations.length);
      setSurpriseLocation(locations[randomIndex]);
    }
  };

  // Function to reset the page
  const handleReset = () => {
    setSurpriseLocation(null);
  };

  if (loading) return <p>Loading locations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      {/* Action Buttons */}
      <div className="flex justify-end mb-4 gap-4">
        <button
          onClick={handleSurpriseClick}
          className="flex items-center gap-2 bg-yellow-400 text-white py-2 px-4 rounded-lg shadow-md hover:bg-yellow-500 transition-all"
        >
          <StarIcon className="h-6 w-6" />
          Surprise Me!
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-gray-400 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-500 transition-all"
        >
          <RefreshIcon className="h-6 w-6" />
          Reset
        </button>
      </div>

      {/* Show Surprise Location */}
      {surpriseLocation ? (
        <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 mb-6">
          <h2 className="font-semibold text-xl text-center">
            🎉 {surpriseLocation.name} 🎉
          </h2>
          <p className="text-center text-gray-500 mt-2">
            {surpriseLocation.vicinity}
          </p>
          {surpriseLocation.photos && surpriseLocation.photos[0]?.photo_url ? (
            <img
              src={surpriseLocation.photos[0].photo_url}
              alt={surpriseLocation.name}
              className="w-full h-48 object-cover rounded-lg mt-4"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4 flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
          {surpriseLocation.rating && (
            <p className="text-center text-yellow-500 mt-2">⭐ {surpriseLocation.rating}</p>
          )}
        </div>
      ) : (
        /* Render All Locations */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {locations.length > 0 ? (
            locations.map((location) => (
              <div
                key={location.place_id}
                className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 flex flex-col items-center"
              >
                {location.photos && location.photos[0]?.photo_url ? (
                  <img
                    src={location.photos[0].photo_url}
                    alt={location.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500">No Image Available</span>
                  </div>
                )}
                <h3 className="font-semibold text-lg text-center">{location.name}</h3>
                <p className="text-sm text-center text-gray-500 mt-2">{location.vicinity}</p>
                {location.rating && (
                  <p className="text-sm text-center text-yellow-500 mt-2">⭐ {location.rating}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No locations found nearby.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Restaurant;
