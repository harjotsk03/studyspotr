import React, { useState, useEffect, useCallback } from 'react';
import { FaMapPin, FaRegClock, FaRegIdCard, FaStar, FaStarHalfAlt, FaVolumeDown, FaVolumeMute, FaVolumeOff, FaWifi, FaBiking, FaBusAlt, FaCarAlt, FaHamburger, FaWalking } from 'react-icons/fa';
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import useGeolocation from '../hooks/useGeolocation';
import useLocations from '../locations';
import { Circle } from '../Circle';
import InfoCard from '../components/InfoCard';
import Directions from '../components/Directions'; // Import Directions component
import { FiNavigation } from "react-icons/fi";

const CitySearch = () => {
  const { location, error } = useGeolocation();
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [travelMode, setTravelMode] = useState('DRIVING');
  const locations = useLocations();
  const [mapKey, setMapKey] = useState(0); // State to force map reload
  const [hideUI, setHideUI] = useState(false);

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const totalStars = Array(fullStars).fill(<FaStar className="star-full" />);
    
    if (hasHalfStar) {
      totalStars.push(<FaStarHalfAlt className="star-full" />);
    }

    // Optionally add empty stars to reach a total of 5 stars
    while (totalStars.length < 5) {
      totalStars.push(<FaStar key={totalStars.length} className="text-gray-200" />); // Use a different color for empty stars
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
  }, []);

  // Filter locations based on search term
  const filteredLocations = locations.filter(loc =>
    loc.info.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMapClick = () => {
    setSelectedCity(null);
    setTravelTime('');
  };

  const handleMarkerClick = (loc) => {
    setSelectedCity(loc);
    setTravelTime('');
  };

  // Effect to prevent scrolling on the entire page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleHideUI = () => {
    setHideUI(prevHide => !prevHide);
  }

  return (
    <div className='w-full h-screen relative'>
      <button
        onClick={reloadMap}
        className="fixed top-5 left-60 px-3 py-3 -ml-2 button z-30 text-sm bg-white text-black rounded shadow-md hover:bg-gray-200"
      >
        <FiNavigation />
      </button>

      <div className='fixed top-4 left-4 px-3 py-2 z-30 text-sm bg-white text-black rounded shadow-md'>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a location"
          className='p-2 border border-gray-300 rounded'
        />
        <ul className='mt-2 bg-white border border-gray-300 rounded'>
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

          {selectedCity && hideUI ? <button className='fixed bottom-0 w-screen bg-white' onClick={handleHideUI}>Show</button> : <></>}

          {selectedCity && (
            <div className={`fixed bottom-0 lg:top-4 lg:right-4 m-4 p-4 bg-white shadow-md rounded-lg lg:w-1/4 h-2/3 z-40 flex flex-col ${hideUI ? 'hidden' : ''}`}>
              <button className='flex lg:hidden mb-2' onClick={handleHideUI}>Hide</button>
              <div className='flex-1 overflow-auto'>
                <InfoCard
                  info={selectedCity.info}
                  onChangeMode={setTravelMode}
                />
                <div className='mt-4'>
                  <div className='flex flex-row gap-2 mt-2'>
                    <button
                      onClick={() => setTravelMode('DRIVING')}
                      className={`px-2 py-1 rounded ${travelMode === 'DRIVING' ? 'bg-blue-500 text-white' : 'bg-gray-200'} text-lg`}
                    >
                      <FaCarAlt />
                    </button>
                    <button
                      onClick={() => setTravelMode('WALKING')}
                      className={`px-2 py-1 rounded ${travelMode === 'WALKING' ? 'bg-blue-500 text-white' : 'bg-gray-200'} text-lg`}
                    >
                      <FaWalking />
                    </button>
                    <button
                      onClick={() => setTravelMode('BICYCLING')}
                      className={`px-2 py-1 rounded ${travelMode === 'BICYCLING' ? 'bg-blue-500 text-white' : 'bg-gray-200'} text-lg`}
                    >
                      <FaBiking />
                    </button>
                    <button
                      onClick={() => setTravelMode('TRANSIT')}
                      className={`px-2 py-1 rounded ${travelMode === 'TRANSIT' ? 'bg-blue-500 text-white' : 'bg-gray-200'} text-md`}
                    >
                      <FaBusAlt />
                    </button>
                  </div>
                  <div className='text-xs mt-1'>Estimated Travel Time: {travelTime}</div>
                </div>
              </div>
              <div className='overflow-scroll flex flex-col gap-2 h-64'>
                {descriptors.map(descriptor => (
                  <div key={descriptor.key} className='p-3 bg-gray-100'>
                    <p className='text-sm flex flex-row items-center gap-1'>{descriptor.icon} {descriptor.key}: {descriptor.value}</p> 
                  </div>
                ))}

                <h3 className='text-md mt-2 -mb-1'>Reviews</h3>
                {reviews.map(review => (
                  <div key={review.key} className='p-3 bg-gray-100 flex flex-col items-start'>
                    <p className='text-sm font-semibold'>{review.name}</p>
                    <p className='text-xs'>{review.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>Loading your location...</div>
      )}
    </div>
  );
};

export default CitySearch;
