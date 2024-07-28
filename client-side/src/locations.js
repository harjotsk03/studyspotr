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
            location: { lat: 49.18909007053937, lng: -122.85016331715596 },
            info: {
              name: "SFU Engineering Building",
              rating: 4.75,
              requiresID: true,
              silentArea: true,
              openingHours: "7:00 AM - 10:30 PM",
            },
          },
          {
            key: "Starbucks Morgan Crossing",
            location: { lat: 49.048194756726005, lng: -122.78309248387815 },
            info: {
              name: "Starbucks Morgan Crossing",
              rating: 5,
              requiresID: false,
              silentArea: false,
              openingHours: "6:00 AM - 9:00 PM",
            },
          },
          {
            key: "Surrey Central Blenz Cafe",
            location: { lat: 49.18804917291319, lng: -122.84939371980073 },
            info: {
              name: "Surrey Central Blenz Cafe",
              rating: 4.5,
              requiresID: false,
              silentArea: false,
              openingHours: "9:00 AM - 9:00 PM",
            },
          },
          {
            key: "UBC Life Building 2nd Floor Study Area",
            location: { lat: 49.26764954674522, lng: -123.2499998080245 },
            info: {
              name: "UBC Life Building 2nd Floor Study Area",
              rating: 4.5,
              requiresID: true,
              silentArea: false,
              openingHours: "6:00 AM - 9:00 PM",
            },
          },
          {
            key: "UBC Life Building 1nd Floor Collegia",
            location: { lat: 49.26733538454429, lng: -123.25008196906498 },
            info: {
              name: "UBC Life Building 1nd Floor Collegia",
              rating: 4,
              requiresID: true,
              silentArea: false,
              openingHours: "6:00 AM - 9:00 PM",
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
