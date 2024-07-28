import React, { useState, useEffect, useCallback } from 'react';
import { FaMapPin, FaRegClock, FaRegIdCard, FaStar, FaStarHalfAlt, FaVolumeDown, FaVolumeMute, FaVolumeOff, FaWifi, FaBiking, FaBusAlt, FaCarAlt, FaHamburger, FaWalking, FaPlus } from 'react-icons/fa';
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import useGeolocation from '../hooks/useGeolocation';
import useLocations from '../locations';
import { Circle } from '../Circle';
import InfoCard from '../components/InfoCard';
import Directions from '../components/Directions';
import { useNavigate } from 'react-router-dom';
import { FiNavigation } from "react-icons/fi";
import { getDistance } from '../utils/distance';

const CitySearch = () => {
  const navigate = useNavigate();
  const { location, error } = useGeolocation();
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [travelMode, setTravelMode] = useState('DRIVING');
  const locations = useLocations();
  const [mapKey, setMapKey] = useState(0);
  const [hideUI, setHideUI] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [showLocations, setShowLocations] = useState(false); // Track whether to show locations

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const totalStars = Array(fullStars).fill(<FaStar className="star-full" />);
    
    if (hasHalfStar) {
      totalStars.push(<FaStarHalfAlt className="star-full" />);
    }

    while (totalStars.length < 5) {
      totalStars.push(<FaStar key={totalStars.length} className="text-gray-200" />);
    }

    return totalStars;
  };

  const descriptors = [
    { key: 'Wifi', value: getRatingStars(5), icon: <FaWifi size={12} /> },
    { key: 'Food', value: getRatingStars(3), icon: <FaHamburger size={11} /> }
  ];  
  
  const reviews = [
    { key: 1, name: 'Harjot Singh', description: "Great place to study, not the quietest place but really good vibe, great food spots, and wifi was top notch" },
    { key: 2, name: 'Gurleen Gill', description: "Pretty average place, food was okay, wifi was so so. Only go if you are close by already." }
  ];  

  const reloadMap = useCallback(() => {
    setMapKey(prevKey => prevKey + 1);
    setSelectedCity(null);
    setHideUI(false);
    setUserRating(null);
    setSearchTerm('');
  }, []);

  const filteredLocations = locations.filter(loc =>
    loc.info.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMapClick = () => {
    setSelectedCity(null);
    setTravelTime('');
    setUserRating(null);
    setShowLocations(false); // Hide location list on map click
  };

  const handleMarkerClick = (loc) => {
    setSelectedCity(loc);
    setTravelTime('');
    const distance = getDistance(location.lat, location.lng, loc.location.lat, loc.location.lng);
    if (distance <= 500) {
      setUserRating(loc.info.rating);
    } else {
      setUserRating(null);
    }
  };

  const handleRatingChange = (rating) => {
    if (selectedCity) {
      console.log(`Rating for ${selectedCity.info.name}: ${rating}`);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleHideUI = () => {
    setHideUI(prevHide => !prevHide);
  };

  const handleAddSpot = () => {
    navigate("/addStudySpot");
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setShowLocations(term.length > 0); // Show locations if there is a search term
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className='w-full h-screen relative'>
      {!hideUI && <button onClick={handleAddSpot} className='w-max fixed bottom-6 flex flex-row items-center bg-blue-500 text-white z-50 px-2 py-1.5 text-xs gap-1 right-5 lg:right-16 shadow-lg rounded-lg'>
        <FaPlus size={8}/> Add a Study Spot
      </button>}
      <button
        onClick={reloadMap}
        className="fixed top-4 left-1/2 lg:left-60 px-3 py-3 -ml-1.5 button z-30 text-sm bg-white text-black rounded shadow-md hover:bg-gray-200"
      >
        <FiNavigation />
      </button>

      {!hideUI && 
      <div className='fixed top-4 w-40 lg:w-52 left-4 px-3 py-3 z-30 text-sm bg-white text-black rounded shadow-md'>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search for a Study Spot"
          className='p-2 border w-full border-gray-300 rounded'
        />
        <ul className={`mt-2 bg-white border border-gray-300 rounded ${showLocations ? 'block' : 'hidden'} lg:block h-24 overflow-scroll`}>
          {filteredLocations.map(loc => (
            <li
              key={loc.key}
              onClick={() => handleMarkerClick(loc)}
              className='p-2 cursor-pointer hover:bg-gray-100'
            >
              {loc.info.name}
            </li>
          ))}
        </ul>
      </div>
    }
      
      
      {location ? (
        <>
          <Map
            key={mapKey}
            defaultZoom={17}
            defaultCenter={location}
            mapId='37067e848e82e602'
            options={{
              zoomControl: true,
              mapTypeControl: false,
              scaleControl: true,
              streetViewControl: false,
              rotateControl: true,
              fullscreenControl: false,
            }}
            gestureHandling={"greedy"}
            onClick={handleMapClick}
          >
            {filteredLocations.map(loc => (
              <AdvancedMarker
                key={loc.key}
                position={loc.location}
                onClick={() => handleMarkerClick(loc)}
              >
                <Pin />
              </AdvancedMarker>
            ))}

            {selectedCity && (
              <Directions
                origin={location}
                destination={selectedCity.location}
                travelMode={travelMode}
                onTravelTimeChange={setTravelTime}
              />
            )}

            <Circle
              radius={5}
              center={location}
              strokeColor={'#0000FF'}
              strokeOpacity={0.6}
              strokeWeight={2}
              fillColor={'#0000FF'}
              fillOpacity={0.2}
              className="user-location-circle"
            />
          </Map>

          {selectedCity && hideUI ? <button className='fixed bottom-16 px-2 py-3 text-sm rounded-lg w-2/3 left-16 bg-white' onClick={handleHideUI}>Show Info</button> : <></>}

          {selectedCity && (
            <div className={`fixed bottom-0 lg:top-4 lg:right-4 m-4 p-4 bg-white shadow-md rounded-lg lg:w-1/4 lg:h-2/3 z-40 flex flex-col ${hideUI ? 'hidden' : ''}`}>
              <button className='flex lg:hidden mb-2 text-sm' onClick={handleHideUI}>Hide Info</button>
              <div className='flex-1 overflow-hidden flex flex-col'>
                <div className='flex-1 overflow-hidden'>
                  <InfoCard
                    info={selectedCity.info}
                    onChangeMode={setTravelMode}
                  />
                  {userRating !== null && (
                    <div className='absolute top-2.5 left-24 pl-3'>
                      <button onClick={() => handleRatingChange(userRating)} className='text-xs text-blue-500'>
                        Rate this Spot
                      </button>
                    </div>
                  )}
                  <div className='mt-4'>
                    <div className='flex flex-row gap-2 mt-2'>
                      <button
                        onClick={() => setTravelMode('DRIVING')}
                        className={`px-2 py-1 rounded ${travelMode === 'DRIVING' ? 'text-blue-500' : ''} text-lg`}
                      >
                        <FaCarAlt />
                      </button>
                      <button
                        onClick={() => setTravelMode('WALKING')}
                        className={`px-2 py-1 rounded ${travelMode === 'WALKING' ? 'text-blue-500' : ''} text-lg`}
                      >
                        <FaWalking />
                      </button>
                      <button
                        onClick={() => setTravelMode('BICYCLING')}
                        className={`px-2 py-1 rounded ${travelMode === 'BICYCLING' ? 'text-blue-500' : ''} text-lg`}
                      >
                        <FaBiking />
                      </button>
                      <button
                        onClick={() => setTravelMode('TRANSIT')}
                        className={`px-2 py-1 rounded ${travelMode === 'TRANSIT' ? 'text-blue-500' : ''} text-lg`}
                      >
                        <FaBusAlt />
                      </button>
                    </div>
                    <div className='mt-4'>
                      {travelTime ? (
                        <p className='text-gray-800'>
                          Estimated travel time: {travelTime}
                        </p>
                      ) : (
                        <p className='text-gray-800'>
                          Select a location to see travel time
                        </p>
                      )}
                    </div>
                    <div className='flex flex-col gap-2 mb-1 pt-2 h-36'>
                      {descriptors.map(descriptor => (
                        <div key={descriptor.key} className='p-3 bg-gray-100'>
                          <p className='text-sm flex flex-row items-center gap-1'>{descriptor.icon} {descriptor.key}: {descriptor.value}</p> 
                        </div>
                      ))}
                      <h3 className='text-md mt-2'>Reviews</h3>
                    </div>
                    <div className='overflow-scroll h-32 flex flex-col gap-2'>
                      {reviews.map(review => (
                        <div key={review.key} className='p-3 bg-gray-100 flex flex-col items-start'>
                          <p className='text-sm font-semibold'>{review.name}</p>
                          <p className='text-xs'>{review.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CitySearch;
