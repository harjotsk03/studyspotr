import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import debounce from 'lodash.debounce';
import useGeolocation from '../hooks/useGeolocation';
import useGeocode from '../hooks/useGeocode';
import { Circle } from '../Circle';
import { FiNavigation } from 'react-icons/fi';
import { FaArrowLeft, FaInfo, FaInfoCircle, FaStar, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { TextareaAutosize } from '@mui/material';
import TimePicker from 'react-time-picker'

const libraries = ['places'];

const AddSpot = () => {
  const navigate = useNavigate();

  const { location: mapCenter, error } = useGeolocation();
  const getAddress = useGeocode(window.google);
  const [mapKey, setMapKey] = useState(0); // State to force map reload
  const [marker, setMarker] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);
  const [hideUI, setHideUI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [instructions, setInstructions] = useState(true);
  const [rating, setRating] = useState(0); // State to store the current rating
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationRating, setNewLocationRating] = useState(0);
  const [newLocationIDRequired, setNewLocationIDRequired] = useState(true);
  const [newLocationSilentArea, setNewLocationSilentArea] = useState(true);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [newLocationOpenHours, setNewLocationOpenHours] = useState("");
  const [newLocationComment, setNewLocationComment] = useState("");
  const [newLocationLongLat, setNewLocationLongLat] = useState({});
  const [message, setMessage] = useState("");


  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = ((hours + 11) % 12 + 1); // Convert to 12-hour format
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Function to update the combined hours string
  const updateOpenHours = useCallback(() => {
    const formattedFrom = formatTime(fromTime);
    const formattedTo = formatTime(toTime);
    setNewLocationOpenHours(`${formattedFrom} - ${formattedTo}`);
  }, [fromTime, toTime]);

  // Handle time change and update open hours
  const handleTimeChange = (event) => {
    const { name, value } = event.target;
    if (name === 'from') {
      setFromTime(value);
    } else if (name === 'to') {
      setToTime(value);
    }
    updateOpenHours();
  };

  const handleStarClick = (index) => {
    setRating(index + 1); // Update rating based on clicked star index
    setNewLocationRating(index + 1);
  };

  const reloadMap = useCallback(() => {
    setMapKey(prevKey => prevKey + 1);
    setSearchResults([]);
    setSearchQuery('');
    setMarker(null);
    setHideUI(false);
  }, []);

  const handleSearch = useCallback(debounce((query) => {
    if (map && query) {
      const service = new window.google.maps.places.PlacesService(map);
      service.textSearch(
        { query, type: ['city'] },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setSearchResults(results);
            setMarkers(results.map(place => ({
              position: place.geometry.location,
              name: place.name,
            })));
            map.setCenter(results[0].geometry.location);
          }
        }
      );
    }
  }, 300), [map]); // Debounce with a delay of 300ms

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleResultClick = (location) => {
    map.setCenter(location);
    map.setZoom(15);
  };

  const onMapClick = useCallback(async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    if (event.domEvent.shiftKey) {
      // If Shift key was pressed, set the marker to null
      setMarker(null);
      setSelectedMarker(null);
    } else {
      // Otherwise, set the marker with address information
      try {
        const address = await getAddress(lat, lng);
        const newMarker = { lat, lng, address };
        setMarker(newMarker);
        setSelectedMarker(newMarker);
      } catch (error) {
        console.error("Error getting address:", error);
      }
    }
  }, [getAddress]);

  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleHideUI = () => {
    setHideUI(prevHide => !prevHide);
  };

  const handleBackToFind = () => {
    navigate("/");
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!mapCenter) return <div>Loading Maps...</div>;

  const handleInfo = () => {
    setInstructions(!instructions);
  }

  const handleName = (e) => {
    const value = e.target.value;
    setNewLocationName(value);
  }

  const handleID = (value) => {
    if(value == 1){
      setNewLocationIDRequired(true);
    }else if(value == 2){
      setNewLocationIDRequired(false);
    }
  }
  
  const handleSilentArea = (value) => {
    if(value == 1){
      setNewLocationSilentArea(true);
    }else if(value == 2){
      setNewLocationSilentArea(false);
    }
  }

  const handleHours = (e) => {
    setNewLocationOpenHours(e.target.value);
  }
  
  const handleComment = (e) => {
    setNewLocationComment(e.target.value);
  }

  const submitStudySpot = async () => {
    try {
      const response = await axios.post('http://localhost:3001/createstudyspot', {
        key: newLocationName,
        name: newLocationName,
        rating: newLocationRating,
        IDRequired: newLocationIDRequired,
        silentArea: newLocationSilentArea,
        openHours: newLocationOpenHours,
        comment: newLocationComment,
        lat: marker.lat,
        long: marker.lng
      });

      if (response.data) {
        setMessage('Study spot created successfully!');
        // Handle success (e.g., show a message or redirect)
      } else {
        setMessage('Study spot creation failed: No data received');
      }
    } catch (error) {
      if (error.response) {
        // Error from the server
        if (error.response.status === 400) {
          setMessage('Bad Request: Check your input');
        } else if (error.response.status === 404) {
          setMessage('Resource not found!');
        } else {
          setMessage(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // No response received
        setMessage('No response received from server');
      } else {
        // Error in setting up the request
        setMessage(`Error: ${error.message}`);
      }
    }
  };
  
  return (
    <div className='w-full h-screen relative'>

      {instructions && 
          <div className='w-full h-full bg-black flex items-center justify-center overflow-hidden absolute z-50 bg-opacity-50'>
              <div className='w-1/2 h-1/2 bg-white shadow-xl rounded-xl relative'>
                  <button onClick={handleInfo} className='absolute top-2 right-2 px-3 py-3 rounded-md'>
                      <FaTimes />
                  </button>

                  <div className='px-4 py-3'>
                    <p className='text-lg'>How To Create A New Study Spot Guide</p>
                    <p className='text-sm mt-2'>1. Search or drag to go the location or area of your study spot</p>
                    <p className='text-sm mt-1'>2. Use your mouse to click on a location</p>
                    <p className='text-sm mt-1'>3. Fill in the information for the study spot on the panel that will pop up on the side</p>
                    <p className='text-sm mt-1'>4. Hit the "Create Study Spot" button and your study spot will now be available for everyone to view and visit!</p>
                  </div>
                  
              </div>
          </div>
      }

      {!instructions && 
        <div className='fixed right-2 top-2 z-50'>
            <button onClick={handleInfo} className='absolute top-2 text-sm flex flex-row items-center gap-0.5 bg-white hover:bg-gray-300 right-2 px-3 py-2 rounded-md'>
                <FaInfo size={10} /> Help
            </button>
        </div>
        }

      <button onClick={handleBackToFind} className='w-max fixed bottom-6 flex flex-row items-center bg-blue-500 text-white z-50 px-2 py-1.5 text-xs gap-1 right-5 lg:right-16 shadow-lg rounded-lg'><FaArrowLeft size={8}/> Find a Study Spot</button>
      <button
        onClick={reloadMap}
        className="fixed top-4 left-1/2 lg:left-60 px-3 py-3 -ml-1.5 button z-30 text-sm bg-white text-black rounded shadow-md hover:bg-gray-200"
      >
        <FiNavigation />
      </button>

      <div className='fixed top-4 w-40 h-10 lg:w-52 left-4 items-center flex flex-col px-1 py-1 z-30 text-sm bg-white text-black rounded shadow-md'>
        <input placeholder="Search an area or place"
          value={searchQuery}
          onChange={handleChange} 
          className='p-2 h-8 text-sm border w-full border-gray-300 rounded'/>
        <div className='flex flex-col fixed top-14 rounded-md -mt-1 pt-1 bg-white'>
          {searchResults.map((place, index) => (
            <button className='bg-white w-52 py-1 px-2 rounded-md text-left hover:bg-gray-300' button key={index} onClick={() => handleResultClick(place.geometry.location)}>
              <p>{place.name}</p>
            </button>
          ))}
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={20}
        onClick={onMapClick}
        onLoad={onLoad}
        libraries={libraries}
        key={mapKey}
        options={{
          mapId: '37067e848e82e602', // Ensure this ID is correct
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: true,
          fullscreenControl: false,
        }}
      >
        {map && mapCenter && (
          <Circle
            map={map}
            center={mapCenter}
            radius={5} // Adjust radius as needed
            strokeColor={'#0000FF'}
            strokeOpacity={0.6}
            strokeWeight={2}
            fillColor={'#0000FF'}
            fillOpacity={0.2}
            className="user-location-circle"
            onClick={onMapClick}
            zIndex={2}
          />
        )}
        {marker && (
          <Marker
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => setSelectedMarker(marker)}
            zIndex={20}
          >
          </Marker>
        )}

          {markers.map((marker, index) => (
            <Marker key={index} position={marker.position} title={marker.name} />
          ))}
      </GoogleMap>
      
      {marker && (
      <div className={`fixed bottom-0 lg:top-4 lg:right-4 m-4 p-4 bg-white shadow-md rounded-lg lg:w-1/4 h-3/4 z-40 flex flex-col ${hideUI ? 'hidden' : ''}`}>
        <button className='flex lg:hidden mb-2' onClick={handleHideUI}>Hide</button>
          <div className="p-4">
            <h2 className='text-lg'><strong>Create a Study Spot</strong></h2>
            <p className='text-xs mt-2'>{marker.address}</p>
            <p className='mt-2'>Study Spot Name</p>
            <input onChange={(e) => handleName(e)} className='text-sm w-full p-2 h-8 text-sm border w-full border-gray-300 rounded mt-1' placeholder='Location Name'/>
            <p className='mt-2'>Rating</p>
            <div className='flex flex-row'>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleStarClick(index)}
                  className={`p-1 ${index < rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  <FaStar size={20} />
                </button>
              ))}
            </div>

            <p className='mt-2'>ID Required?</p>
            <div className='flex flex-row gap-2 mt-1'>
              <button onClick={() => handleID(1)} className={`${newLocationIDRequired ? "bg-blue-500 text-white" : "bg-gray-200 text-black"} px-2 text-xs py-1 rounded-md`}>Yes</button>
              <button onClick={() => handleID(2)} className={`${!newLocationIDRequired ? "bg-blue-500 text-white" : "bg-gray-200 text-black"} px-2 text-xs py-1 rounded-md`}>No</button>
            </div>

            <p className='mt-2'>Silent Study Areas?</p>
            <div className='flex flex-row gap-2 mt-1'>
              <button onClick={() => handleSilentArea(1)}  className={`${newLocationSilentArea ? "bg-blue-500 text-white" : "bg-gray-200 text-black"} px-2 text-xs py-1 rounded-md`}>Yes</button>
              <button onClick={() => handleSilentArea(2)} className={`${!newLocationSilentArea ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}  px-2 text-xs py-1 rounded-md`}>No</button>
            </div>

            <p className='mt-2'>Opening Hours</p>
            <div className='flex flex-row items-center gap-2 mt-1'>
            <p className='text-xs'>From:</p>
              <input
                type='time'
                name='from'
                value={fromTime}
                onChange={handleTimeChange}
                className='text-xs'
              />
              <p className='text-xs'>To:</p>
              <input
                type='time'
                name='to'
                value={toTime}
                onChange={handleTimeChange}
                className='text-xs'
              />
            </div>

            <p className='mt-2'>Write a comment</p>
            <textarea onChange={(e) => handleComment(e)} className='text-sm h-32 w-full p-2 h-8 text-sm mt-1 mb-2 border w-full border-gray-300 rounded' placeholder='Leave some helpful info...'/>

            <button onClick={submitStudySpot} className='w-max bg-blue-500 text-white px-2 py-1 text-sm rounded-md'>Create Study Spot</button>
            
            {/* <h3 className="text-lg font-bold">Location Details</h3>
            <p><strong>Latitude:</strong> {marker.lat}</p>
            <p><strong>Longitude:</strong> {marker.lng}</p>
            <p><strong>Address:</strong> {marker.address}</p> */}
          </div>
      </div>
      )}

      {/* <div className='fixed bottom-32 right-32 z-50 bg-white'>
        <p>{newLocationName}</p>
        <p>{newLocationRating}</p>
        <p>{newLocationIDRequired ? <p>yes</p> : <p>no</p>}</p>
        <p>{newLocationSilentArea ? <p>yes</p> : <p>no</p>}</p>
        <p>{newLocationOpenHours}</p>
        <p>{newLocationComment}</p>
      </div> */}
    </div>
  );
};

export default AddSpot;
