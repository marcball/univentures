import React from 'react';

function LocationPreview({ location }) {
  return (
    //Styling for location previes
    <div className="bg-white rounded-lg shadow-lg p-4 transition-transform transform hover:scale-105">
            <img 
                src={location.image_url} // Ensure location has an imageUrl property
                alt={location.name} 
                className="w-full h-32 object-cover rounded-t-lg mb-2" 
            />
            <h3 className="text-xl font-semibold mb-2">{location.name}</h3>
            <p className="text-gray-600 mb-2">{location.description}</p>
            <p className="text-gray-500 text-sm">{location.address}</p>
            <p className="text-gray-500 text-sm">{location.hours}</p>
            <a 
                href={location.website} 
                className="mt-4 inline-block text-blue-500 hover:underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
            >
                Visit Website
            </a>
        </div>
  );
}

export default LocationPreview;