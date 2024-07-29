import { useState, useEffect } from 'react';
import useGeocode from './hooks/useGeocode';
import axios from 'axios'; // Make sure to install axios

const useLocations = () => {
  const [locations, setLocations] = useState([]);
  const [googleMaps, setGoogleMaps] = useState(null);
  const getAddress = useGeocode(googleMaps);

  useEffect(() => {
    if (window.google) {
      setGoogleMaps(window.google);
    }
  }, []);

  useEffect(() => {
    if (googleMaps) {
      const fetchLocations = async () => {
        try {
          // Fetch locations from your backend
          const response = await axios.get('http://localhost:3001/locations');
          const initialLocations = response.data;

          // Fetch addresses and update locations
          const updatedLocations = await Promise.all(initialLocations.map(async (loc) => {
            const address = await getAddress(loc.location.lat, loc.location.long);
            return {
              ...loc,
              info: {
                ...loc.info,
                address
              }
            };
          }));

          setLocations(updatedLocations);
        } catch (error) {
          console.error('Error fetching locations:', error);
        }
      };

      // Set interval to fetch locations every second
      const intervalId = setInterval(fetchLocations, 1000);

      // Clear interval on cleanup
      return () => clearInterval(intervalId);
    }
  }, [googleMaps, getAddress]);

  console.log(locations);
  return locations;
};

export default useLocations;
