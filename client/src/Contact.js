import React, {useState} from 'react';
import './css/input.css';
import Banner from './Banner';
import emailjs from 'emailjs-com';

function Contact() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        comments: ''
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const sendEmail = (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        //Send the form on the contact page
        emailjs.send('service_ot4eiqh', 'template_5bydjzv', formData, 'VHTZvm-mD4dC2ldbI')
            .then((response) => {
                console.log('Email sent successfully!', response.status, response.text);
                setSuccessMessage('Message sent successfully!');
                setErrorMessage('');
                setFormData({ name: '', email: '', subject: '', comments: '' }); // Reset form
            })
            .catch((error) => {
                console.log('Failed to send email:', error);
                setErrorMessage('Failed to send message, please try again later.');
                setSuccessMessage('');
            });
    };

    return (
        //styling for contact page
        <div className='bg-BG_LIGHTMODE dark:bg-BG_DARKMODE min-h-screen'>
            <Banner/>
            <section className='py-2'>
                <div className='max-w-6xl mx-auto p-4 md:p-16 xl:p-20'>
                    <div className='lg:w-2/3 space-y-5 text-center mx-auto'>
                        <h1 className='text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE uppercase tracking-wides font-medium text-4xl'>
                            Get in touch
                        </h1>
                        <div className='h-0.5 bg-teal-700 w-14 mx-auto'></div>
                        <p className='text-TEXT_LIGHTMODE dark:text-gray-300 text-base leading-6'>
                            We'd love to hear from you!
                        </p>
                    </div>
                    <div className='grid grid-cols-1 gap-6 mt-16'>
                        <div className='lg:col-span-2'>
                            <form onSubmit={sendEmail}>
                                <div className='space-y-6'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        <label htmlFor='name' className='sr-only'>Name</label>
                                        <input
                                        type='text'
                                        name='name'
                                        id='name'
                                        value={formData.name}
                                        onChange={handleChange}
                                        className='border text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE text-sm rounded focus:ring-0 focus:border-gray-400 block w-full p-3 bg-zinc-700/20 border-zinc-700/50 placeholder-gray-500 dark:placeholder:text-gray-300/50'
                                        placeholder='Enter your name'
                                        required
                                        />
                                        <label htmlFor='email' className='sr-only'>Email</label>
                                        <input
                                        type='email'
                                        name='email'
                                        id='email'
                                        value={formData.email}
                                        onChange={handleChange}
                                        className='border text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE text-sm rounded focus:ring-0 focus:border-gray-400 block w-full p-3 bg-zinc-700/20 border-zinc-700/50 placeholder-gray-500 dark:placeholder:text-gray-300/50'
                                        placeholder='Enter your email'
                                        required
                                        />
                                    </div>
                                    <label htmlFor='subject' className='sr-only'>Subject</label>
                                        <input
                                        type='text'
                                        name='subject'
                                        id='subject'
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className='border text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE text-sm rounded focus:ring-0 focus:border-gray-400 block w-full p-3 bg-zinc-700/20 border-zinc-700/50 placeholder-gray-500 dark:placeholder:text-gray-300/50'
                                        placeholder='Enter your subject'
                                        required
                                        />
                                        <label htmlFor='comments' className='sr-only'>Message</label>
                                        <textarea
                                        name='comments'
                                        id='comments'
                                        value={formData.comments}
                                        onChange={handleChange}
                                        className='border text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE text-sm rounded focus:ring-0 focus:border-gray-400 block w-full p-3 bg-zinc-700/20 border-zinc-700/50 placeholder-gray-500 dark:placeholder:text-gray-300/50'
                                        placeholder='Enter your Message'
                                        rows='3'
                                        required
                                        ></textarea>
                                        <div className='text-right'>
                                            <input
                                            type='submit'
                                            id='submit'
                                            name='send'
                                            className='bg-teal-700 inline-block px-15 py-2.5 px-2.5 rounded text-sm cursor-pointer select-none outline-none transition-all duration-500 focus:ring-offset-0 hover:-translate-y-1.5 bg-red-500 text-white'
                                            value='Send Message'
                                            />
                                        </div>
                                </div>
                            </form>
                            {successMessage && <p className="text-green-500">{successMessage}</p>}
                            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
export default Contact;