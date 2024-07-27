// useGeocode.js
import { useState, useEffect, useCallback } from 'react';

const useGeocode = () => {
  const [geocoder, setGeocoder] = useState(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      const geocoderInstance = new window.google.maps.Geocoder();
      setGeocoder(geocoderInstance);
    }
  }, []);

  const getAddress = useCallback((lat, lng) => {
    return new Promise((resolve, reject) => {
      if (geocoder) {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK') {
            resolve(results[0]?.formatted_address || 'No address found');
          } else {
            reject('Geocoder failed due to: ' + status);
          }
        });
      } else {
        reject('Geocoder is not initialized');
      }
    });
  }, [geocoder]);

  return getAddress;
};

export default useGeocode;
