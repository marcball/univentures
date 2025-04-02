import React from 'react';
import './css/input.css';
import Banner from './Banner';
import { FaMapMarkerAlt, FaStar, FaRandom } from 'react-icons/fa';

function VerificationPage() {
    return (
        <div className="bg-BG_LIGHTMODE dark:bg-BG_DARKMODE min-h-screen overflow-x-hidden">  
            <Banner />
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6 md:px-16">
                    <div className="text-center">
                        <h1 className="text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE font-bold uppercase text-5xl">One More Step...</h1>
                        <p className="text-2xl text-TEXT_LIGHTMODE dark:text-gray-200 mt-4 text-lg">
                            And then the world is yours.
                        </p>
                        <div className="h-0.5 bg-teal-700 w-16 mx-auto mt-6"></div>
                        <p className="text-TEXT_LIGHTMODE dark:text-gray-200 mt-20 text-lg">
                            You should receive an email with a link to verify your account (make sure to check your spam folder).
                        </p>
                        <p className="text-TEXT_LIGHTMODE dark:text-gray-200 text-lg">
                            Once verified, head on over to the  
                            <a className="text-red-400 font-bold ml-2 mr-2" href="/login">LOGIN</a>
                            page.
                        </p>
                        

                    </div>
                </div>
            </section>
        </div>
    );
}

export default VerificationPage;
