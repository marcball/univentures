import React from 'react';
import './css/input.css';
import Banner from './Banner';
import { FaMapMarkerAlt, FaStar, FaRandom } from 'react-icons/fa';

function About() {
    return (
        <div className="bg-BG_LIGHTMODE dark:bg-BG_DARKMODE min-h-screen overflow-x-hidden">  
            <Banner />
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-16">
                    <div className="text-center">
                        <h1 className="text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE font-bold uppercase text-5xl">Discover UniVentures</h1>
                        <p className="text-TEXT_LIGHTMODE dark:text-gray-400 mt-4 text-lg">
                            Your gateway to exciting campus adventures, hand-picked and tailored just for you.
                        </p>
                        <div className="h-0.5 bg-teal-700 w-16 mx-auto mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
                        <div className="bg-zinc-800 p-8 rounded-xl shadow-lg text-center">
                            <FaMapMarkerAlt className="text-teal-500 text-4xl mx-auto mb-4" />
                            <h2 className="text-white text-xl font-semibold">Explore New Places</h2>
                            <p className="text-gray-400 mt-2">
                                Find hidden gems and popular spots around your college campus using Google’s Places API and user added locations.
                            </p>
                        </div>

                        <div className="bg-zinc-800 p-8 rounded-xl shadow-lg text-center">
                            <FaStar className="text-teal-500 text-4xl mx-auto mb-4" />
                            <h2 className="text-white text-xl font-semibold">Rate & Review</h2>
                            <p className="text-gray-400 mt-2">
                                Share your experiences by rating and reviewing adventures, helping others make the best choices.
                            </p>
                        </div>

                        <div className="bg-zinc-800 p-8 rounded-xl shadow-lg text-center">
                            <FaRandom className="text-teal-500 text-4xl mx-auto mb-4" />
                            <h2 className="text-white text-xl font-semibold">Surprise Me!</h2>
                            <p className="text-gray-400 mt-2">
                                Feeling adventurous? Let us pick a random adventure for you with just one click!
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-20">
                        <p className="text-TEXT_LIGHTMODE dark:text-gray-400 text-lg leading-7">
                            No account? No problem! You can explore freely, but to create and review adventures, simply sign up and verify your university email.
                        </p>
                        <p className="text-TEXT_LIGHTMODE dark:text-gray-400 text-lg mt-4">
                            Start planning your next adventure with UniVentures today!
                        </p>
                        <p className="text-TEXT_LIGHTMODE dark:text-gray-400 text-s mt-36">
                            This product uses OpenStreetMap data © OpenStreetMap contributors,
                        </p>
                        <p className="text-TEXT_LIGHTMODE dark:text-gray-400 text-s mt-1">
                            and data sourced from the Hipo API under the MIT License.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default About;
