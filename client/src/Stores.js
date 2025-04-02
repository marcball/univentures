import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Stores = () => {
  const { schoolID } = useParams();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/nearby/${schoolID}/stores`);
        if (!response.ok) throw new Error('Failed to fetch stores');
        const data = await response.json();
        setStores(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [schoolID]);

  if (loading) return <p>Loading stores...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {stores.length > 0 ? (
        stores.map((stores) => (
          <div
            key={stores.place_id}
            className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 flex flex-col items-center"
          >
            {stores.photos && stores.photos[0]?.photo_url ? (
              <img
                src={stores.photos[0].photo_url}
                alt={stores.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
            <h3 className="font-semibold text-lg text-center">{stores.name}</h3>
            <p className="text-sm text-center text-gray-500 mt-2">{stores.vicinity}</p>
            {stores.rating && (
              <p className="text-sm text-center text-yellow-500 mt-2">⭐ {stores.rating}</p>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No stores found nearby.</p>
      )}
    </div>
  );
};

export default Stores;
