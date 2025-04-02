import React from 'react';
import './css/input.css';
import Banner from './Banner';
import background from './Images/About-Background.jpg'


function About() {
    return (
        <div className='w-screen h-screen bg-cover bg-center flex flex-col' style={{ backgroundImage: `url(${background})` }}>
            <div className = "mt-64">
                <div className='flex flex-col items-center mx-40 px-10 py-10 rounded-2xl bg-[#101c26]'>
                    <div className='text-white font-serif text-5xl mb-4'>Lost your way?</div>
                    <h2 className='text-white text-center'>
                        You have adventured into an unheard of page! Let's
                        not be too adventurous and get back on 
                        <a href="/" className="text-teal-600"> track</a>
                        
                    </h2>
                </div>
            </div>
        </div>
    );
}
export default About;