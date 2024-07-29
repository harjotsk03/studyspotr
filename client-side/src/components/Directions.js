import React, { useEffect, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

function Directions({ origin, destination, travelMode, onTravelTimeChange }) {
  const map = useMap();
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  useEffect(() => {
    if (window.google && window.google.maps && map) {
      // Create DirectionsService and DirectionsRenderer
      const service = new window.google.maps.DirectionsService();
      const renderer = new window.google.maps.DirectionsRenderer({
        map: map,
        preserveViewport: true, // Prevent automatic zoom and pan
        suppressMarkers: true, // Do not automatically add markers
      });
      setDirectionsService(service);
      setDirectionsRenderer(renderer);
    }
  }, [map]);

  useEffect(() => {
    if (directionsService && directionsRenderer && origin && destination) {
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: travelMode,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const duration = result.routes[0].legs[0].duration.text;
            onTravelTimeChange(duration);

            // Optionally fit bounds to the route (if you want)
            // const bounds = new window.google.maps.LatLngBounds();
            // result.routes[0].overview_path.forEach((latLng) => bounds.extend(latLng));
            // map.fitBounds(bounds);
          } else {
            console.error('Directions request failed due to ' + status);
          }
        }
      );
    }

    // Cleanup function to clear directions
    return () => {
      if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] });
      }
    };
  }, [directionsService, directionsRenderer, origin, destination, travelMode, onTravelTimeChange, map]);

  return null;
}

export default Directions;
