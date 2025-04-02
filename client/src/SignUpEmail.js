import React, { useState } from 'react';

const EmailSignUp = () => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', query);
  };

  return (
    // Outer container to center the content
    <div className="flex items-center justify-center overflow-auto flex flex-col items-center">
      {/* Inner container for the form, centered on the page */}
      <div className='flex w-96 rounded bg-white shadow-lg mt-8'> {/* mt-8 adds space above */}
        <form onSubmit={handleSearch} className='flex w-full'>
          <input
            onChange={(e) => setQuery(e.target.value)} // Update query state
            className='w-full border-none bg-transparent px-4 py-1 text-gray-900 outline-none focus:outline-none'
            placeholder="Email address"
          />
          <button
            className='m-2 rounded-full bg-teal-700 px-5 py-3 text-white whitespace-nowrap'
            type='submit'
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailSignUp;
