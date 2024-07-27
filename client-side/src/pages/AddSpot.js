import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import useGeolocation from '../hooks/useGeolocation';
import useGeocode from '../hooks/useGeocode';
import { Circle } from '../Circle';
import { FiNavigation } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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

  const reloadMap = useCallback(() => {
    setMapKey(prevKey => prevKey + 1);
  }, []);

  const onMapClick = useCallback(async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    try {
      const address = await getAddress(lat, lng);
      const newMarker = { lat, lng, address };
      setMarker(newMarker);
      setSelectedMarker(newMarker);
    } catch (error) {
      console.error("Error getting address:", error);
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

  if (!mapCenter) return <div>Loading Maps...</div>;

  return (
    <div className='w-full h-screen relative'>
      <button onClick={handleBackToFind} className='w-max fixed top-4 flex flex-row items-center bg-blue-500 text-white z-50 px-2 py-1.5 text-xs gap-1 left-3 shadow-lg rounded-lg'><FaArrowLeft size={8}/> Find a Study Spot</button>
      <button
        onClick={reloadMap}
        className="fixed top-3 left-40 px-3 py-3 -ml-2 button z-30 text-sm bg-white text-black rounded shadow-md hover:bg-gray-200"
      >
        <FiNavigation />
      </button>

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
      </GoogleMap>
      
      {marker && (
      <div className={`fixed bottom-0 lg:top-4 lg:right-4 m-4 p-4 bg-white shadow-md rounded-lg lg:w-1/4 h-2/3 z-40 flex flex-col ${hideUI ? 'hidden' : ''}`}>
        <button className='flex lg:hidden mb-2' onClick={handleHideUI}>Hide</button>
          <div className="p-4">
            <h3 className="text-lg font-bold">Location Details</h3>
            <p><strong>Latitude:</strong> {marker.lat}</p>
            <p><strong>Longitude:</strong> {marker.lng}</p>
            <p><strong>Address:</strong> {marker.address}</p>
          </div>
      </div>
      )}
    </div>
  );
};

export default AddSpot;
