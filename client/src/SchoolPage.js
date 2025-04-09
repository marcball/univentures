import React, { useEffect, useState, useRef } from 'react';
import { SunIcon, MoonIcon, XIcon, FilterIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { useParams, NavLink, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import Banner from './Banner';
import AddAdventure from './AddAdventure';
import StaticPlusButton from './components/StaticPlusButton/StaticPlusButton';
import Adventures from './Adventures';
import CommunityAdventures from './CommunityAdventures';
import StarRating from './components/StarRating/StarRating';


const SchoolDetail = () => {
	const { schoolID } = useParams();
	const [userId, setUserId] = useState(null);
	const [userSchoolId, setUserSchoolId] = useState(null);
	const [school, setSchool] = useState(null);
	const [schoolImageURL, setSchoolImageURL] = useState('');
	const [isWindowOpen, setWindowOpen] = useState(false);
	const [isFilterOpen, setFilterOpen] = useState(false);
	const location = useLocation();
	const [activeTab, setActiveTab] = useState('Public Adventures'); // current tab to change filters
	const [typeFilterOpen, setTypeFilterOpen] = useState(false);
	const filterRef = useRef(null);
	const dropdownRef = useRef(null);
	const isActiveLink = location.pathname === `/school/${schoolID}` && location.search === '';

	//get user id
	useEffect(() => {
		// Fetch user account data
		const fetchUserData = async () => {
			try {
				const response = await axios.get('https://univentures.up.railway.app/api/account',
                    { withCredentials: true }
                );
				setUserId(response.data.id);
				setUserSchoolId(response.data.schoolId);
			} catch (error) {
				console.error("Error fetching user data:", error);
				setUserId(null); // Not logged in
				setUserSchoolId(null);
			}
		};

		fetchUserData();
	}, []);

	//
	const handleClickAddAdventure = () => {
		if (!userId) {
			alert("You must be logged in to perform this action.");
			return;
		}

		if (String(userSchoolId) !== schoolID) {
			console.log(userSchoolId);
			console.log(schoolID);
			alert("This is not your school page.");
			return;
		}

		toggleWindow();
	};

	const [pendingFilters, setPendingFilters] = useState({
		type: '',
		ratings: 0,		//default show all ratings
	});

	const [sendingFilters, setSendingFilters] = useState({
		type: '',
		ratings: 0,		//show all ratings
	});

	const toggleWindow = () => setWindowOpen(!isWindowOpen);
	const toggleFilter = () => setFilterOpen(!isFilterOpen);
	const toggleTypeFilter = () => setTypeFilterOpen(!typeFilterOpen);

	const handleTypeSelect = (type) => {
		setPendingFilters((prev) => ({ ...prev, type: type }));
		setTypeFilterOpen(false);
	};

	const handleRatingsSelect = (ratings) => {
		setPendingFilters((prev) => ({ ...prev, ratings }));
		setTypeFilterOpen(false);
	};



	//FILTER
	const applyFilters = () => {
		//Close Filter
		setFilterOpen(false);
		setTypeFilterOpen(false);


		/***************************
		   PUBLIC Filters Applied
		****************************/
		if (activeTab === "Public Adventures") {

		}



		/***************************
		   COMMUNITY Filters Applied
		****************************/
		else {
			//Make type just a letter
			const typeMappings = {
				'Activities': 'A',
				'Bars': 'B',
				'Classes': 'CA',
				'Clubs': 'CB',
				'Events': 'E',
				'Restaurants': 'R',
				'Stores': 'S',
				'Other': 'O'
			};

			const entireType = pendingFilters.type;
			const mappedType = typeMappings[entireType] || '';

			setSendingFilters({
				type: mappedType,
				ratings: pendingFilters.ratings,
			});
		}
	};

	const resetFilters = () => {
		setPendingFilters({
			type: '',
			ratings: 0, // Reset ratings to default
		});

		//TO DO
		//Could call applyFilters() now from here to update
		//or let user click apply
	};

	const filtersForPublicAdventures = ['Activities', 'Bars', 'Restaurants', 'Stores']

	const filtersForCommunityAdventures = ['Activities', 'Bars', 'Classes', 'Clubs', 'Events', 'Restaurants', 'Stores', 'Other'];

	const activeFilters = activeTab === 'Public Adventures'
		? filtersForPublicAdventures
		: filtersForCommunityAdventures;


	{/* CHANGE FILTER */ }
	useEffect(() => {
		// Set activeTab based on the current route
		if (location.pathname.includes('community')) {
			setActiveTab('Community Adventures');
		} else {
			setActiveTab('Public Adventures');
		}
	}, [location]);


	{/* CLICK OUTSIDE FILTERS */ }
	useEffect(() => {
		const handleClickOutside = (event) => {
			// Close the filter entirely if clicking outside the filter
			if (filterRef.current && !filterRef.current.contains(event.target)) {
				setFilterOpen(false);
				setTypeFilterOpen(false);
			}
			// Close only the dropdown if clicking outside the dropdown but inside the filter
			else if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setTypeFilterOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		const fetchSchoolDetails = async () => {
			try {
				const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/schools/${schoolID}`,
                    { withCredentials: true }
                );

				setSchool(response.data);

				if (response?.data?.domain) {
					const domain = response.data.domain;
					const logoURL = `https://logo.clearbit.com/${domain}`;
					setSchoolImageURL(logoURL);
				}
			} catch (error) {
				console.error('Error fetching school details:', error);
			}
		};

		fetchSchoolDetails();
	}, [schoolID]);


	{/* LOADING */ }
	if (!school) return <div>Loading...</div>;


	{/* ADD ADVENTURE */ }
	const handleAddAdventure = async (formData) => {
		formData = {
			schoolId: schoolID,
			...formData,
		}

		try {
			const response = await fetch('https://univentures.up.railway.app/api/adventure', {
				method: 'POST',
                credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				window.location.reload();
				toggleWindow();
			} else {
				const errorData = await response.json();
				alert(`Error adding adventure: ${errorData.message}`);
			}
		} catch (error) {
			console.error('Error adding adventure:', error);
			alert('Error adding adventure');
		}
	};



	{/*

	*** PAGE TO RETURN ***

*/}

	return (
		<main className="bg-BG_LIGHTMODE dark:bg-BG_DARKMODE overflow-x-hidden">
			<div className={`min-h-screen flex flex-col`}>
				<Banner />
				<div className="p-4 relative">
					<div className="flex flex-col items-center mb-4">
						{schoolImageURL && (
							<img
								src={schoolImageURL}
								alt="School Logo"
								className="w-8 h-8 mr-2"
								onError={(e) => (e.target.style.display = 'none')}
							/>
						)}
						<h1 className="text-4xl text-TEXT_LIGHTMODE dark:text-TEXT_DARKMODE font-bold cursor-default">{school.school_name}</h1>
					</div>

					{/* Filter */}
					<div className="flex items-center justify-between mb-6">
						<div>
							<div
								ref={filterRef}
								className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-lg transform ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'
									} transition-transform duration-300 ease-in-out z-50`}
							>
								<div className="p-4 flex items-center justify-between">
									<h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Filters</h2>
									<button
										onClick={toggleFilter}
										className="text-gray-800 dark:text-gray-200 hover:text-red-500"
									>
										<XIcon className="h-6 w-6" />
									</button>
								</div>
								<div className="p-4">
									{/* Type Dropdown */}
									<div
										ref={dropdownRef}
										className="relative">

										<button
											onClick={toggleTypeFilter}
											className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg"
										>
											<span>Type {pendingFilters.type && `: ${pendingFilters.type}`}</span>
											<ChevronDownIcon className="h-5 w-5" />
										</button>
										{typeFilterOpen && (
											<ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
												{activeFilters.map((type) => (
													<li
														key={type}
														className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
														onClick={() => handleTypeSelect(type)}
													>
														{type}
													</li>
												))}
											</ul>
										)}
									</div>

									{/* Ratings */}
									<div className="mt-8">
										<label className="flex flex-col items-center block text-gray-700 dark:text-white mb-2">
											Rating
										</label>
										<input
											type="range"
											min="0"
											max="5"
											step="0.5"
											className="w-full cursor-pointer accent-teal-700"
											value={pendingFilters.ratings}
											onChange={(e) =>
												setPendingFilters((prev) => ({ ...prev, ratings: Number(e.target.value) }))
											}
										/>
										<div className="flex justify-center items-center mt-2"></div>
										{/* Use StarRating to Display Stars Dynamically */}
										<StarRating rating={pendingFilters.ratings} />
									</div>


									{/* Apply Button */}
									<div className="mt-2">
										<button
											onClick={applyFilters}
											className="w-full px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-600"
										>
											Apply
										</button>
									</div>

									{/* Reset Button */}
									<div className="mt-4">
										<button
											onClick={resetFilters}
											className="w-full px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600"
										>
											Clear
										</button>
									</div>

								</div>
							</div>
						</div>


						{/* Adventure Selection and Filter button */}
						<nav className="relative flex-1 flex justify-center">
							<div className="flex space-x-4 mr-14">
								{/* Filter Button */}
								<button
									onClick={toggleFilter}
									className="flex items-center gap-2 p-2 rounded dark:bg-gray-800"
								>
									<FilterIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
								</button>
								<NavLink
									to={`/school/${schoolID}`}
									className={`px-4 py-2 text-lg font-medium ${isActiveLink
										? 'text-teal-600 border-b-2 border-teal-600'
										: 'text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-500'
										}`}

								>
									Public Adventures
								</NavLink>
								<NavLink
									to="community"
									className={({ isActive }) =>
										`px-4 py-2 text-lg font-medium ${isActive
											? 'text-teal-600 border-b-2 border-teal-600'
											: 'text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-500'
										}`
									}
									onClick={() => {

										resetFilters();
									}}
								>
									Community Adventures
								</NavLink>
							</div>
						</nav>
					</div>

					<div className="mt-8">
						{activeTab === 'Public Adventures' ? (
							<Adventures schoolID={schoolID} filters={sendingFilters} />
						) : (
							<CommunityAdventures schoolID={schoolID} filters={sendingFilters} />
						)}
					</div>
				</div>

				{/* ADD ADVENTURE */}
				<AddAdventure
					isOpen={isWindowOpen}
					toggleWindow={toggleWindow}
					onSubmit={handleAddAdventure}
				/>

				{activeTab === 'Community Adventures' && (
					<StaticPlusButton onClick={handleClickAddAdventure} />
				)}
			</div>
		</main>
	);
};

export default SchoolDetail;
