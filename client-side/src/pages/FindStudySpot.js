import React, { useState, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import Directions from '../components/Directions';
import useGeolocation from '../hooks/useGeolocation';
import useLocations from '../locations';
import InfoCard from '../components/InfoCard';
import { Circle } from '../Circle';

const FindStudySpot = () => {
  const { location, error } = useGeolocation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [travelTime, setTravelTime] = useState('');
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [mapKey, setMapKey] = useState(0); // State to force map reload
  const locations = useLocations();
  const [circleRadius , setCircleRadius] = useState(19);

  const reloadMap = useCallback(() => {
    setMapKey(prevKey => prevKey + 1); // Update key to force re-render
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  

  const handleRadiusChange = (radius) => () => {
    setCircleRadius(radius);
  };

  return (
    <div className='w-3/4 h-screen relative'>
      <button
        onClick={reloadMap}
        className="fixed top-4 left-4 px-3 py-2 z-30 text-sm bg-white text-black rounded shadow-md hover:bg-grey-200"
      >
        My Location
      </button>
      
      {location ? (
        <>
          <Map
            key={mapKey} // Use key to force re-render
            defaultZoom={19}
            defaultCenter={location}
            mapId='37067e848e82e602'
            options={{
              zoomControl: true,
              mapTypeControl: false,
              scaleControl: true,
              streetViewControl: true,
              rotateControl: true,
              fullscreenControl: false,
            }}
            gestureHandling={"greedy"}
            onClick={() => {
              setSelectedLocation(null);
              setTravelTime('');
            }}
          >

            <Circle
              radius={circleRadius}
              center={location}
              strokeColor={'#0000FF'}
              strokeOpacity={0.6}
              strokeWeight={2}
              fillColor={'#0000FF'}
              fillOpacity={0.2}
              className="user-location-circle"
            />
        

            {locations.map(loc => (
              <AdvancedMarker
                key={loc.key}
                position={loc.location}
                onClick={() => setSelectedLocation(loc)}
              >
                <Pin />
                {selectedLocation && selectedLocation.key === loc.key && (
                  <InfoWindow
                    position={loc.location}
                    onCloseClick={() => {
                      setSelectedLocation(null);
                    }}
                  >
                    <InfoCard
                      info={{ ...loc.info, travelTime }}
                      onChangeMode={setTravelMode} // Pass setTravelMode to InfoCard
                    />
                  </InfoWindow>
                )}
              </AdvancedMarker>
            ))}

            {selectedLocation && (
              <Directions
                origin={location}
                destination={selectedLocation.location}
                travelMode={travelMode} // Pass the current travel mode
                onTravelTimeChange={setTravelTime}
              />
            )}

          </Map>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default FindStudySpot;
