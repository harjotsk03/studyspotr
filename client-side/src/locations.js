// locations.js
import { useState, useEffect } from 'react';
import useGeocode from './hooks/useGeocode';

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
        const initialLocations = [
          {
            key: "Gurleens House",
            location: { lat: 49.123970, lng: -122.829210 },
            info: {
              name: "Gurleen's House",
              rating: 4.5,
              requiresID: false,
              silentArea: false,
              openingHours: "9:00 AM - 9:00 PM",
            },
          },
          {
            key: "SFU Engineering Building",
            location: { lat: 49.124026, lng: -122.829598 },
            info: {
              name: "SFU Engineering Building",
              rating: 3.5,
              requiresID: true,
              silentArea: true,
              openingHours: "9:00 AM - 11:00 PM",
            },
          },
        ];

        const updatedLocations = await Promise.all(initialLocations.map(async (loc) => {
          const address = await getAddress(loc.location.lat, loc.location.lng);
          return {
            ...loc,
            info: { ...loc.info, address },
          };
        }));

        setLocations(updatedLocations);
      };

      fetchLocations();
    }
  }, [googleMaps, getAddress]);

  return locations;
};

export default useLocations;
